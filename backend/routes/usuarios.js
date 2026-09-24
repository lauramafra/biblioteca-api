const express = require('express');
const db = require('../db');
const { HttpError, asyncHandler, validarId } = require('../utils');

const router = express.Router();

// Valida CPF (11 dígitos + dígitos verificadores)
function cpfValido(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digito = (base) => {
    let soma = 0;
    for (let i = 0; i < base; i++) soma += Number(cpf[i]) * (base + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10]);
}

// Valida e normaliza o corpo da requisição (POST e PUT)
function validarUsuario(body) {
  const erros = [];
  const nome = String(body.nome ?? '').trim();
  const cpf = String(body.cpf ?? '').replace(/\D/g, '');
  const email = String(body.email ?? '').trim().toLowerCase();
  let telefone = null;
  if (body.telefone !== undefined && body.telefone !== null && String(body.telefone).trim() !== '') {
    telefone = String(body.telefone).replace(/\D/g, '');
    if (!/^\d{10,11}$/.test(telefone)) erros.push('telefone deve ter 10 ou 11 dígitos (DDD + número).');
  }

  if (!nome) erros.push('nome é obrigatório.');
  else if (nome.length > 100) erros.push('nome deve ter no máximo 100 caracteres.');
  if (!cpf) erros.push('cpf é obrigatório.');
  else if (!cpfValido(cpf)) erros.push('cpf inválido.');
  if (!email) erros.push('email é obrigatório.');
  else if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.push('email inválido.');

  if (erros.length) throw new HttpError(400, erros.join(' '));
  return { nome, cpf, email, telefone };
}

async function buscarPorId(id) {
  const [linhas] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  return linhas[0];
}

// GET /usuarios  -> lista todos
router.get('/', asyncHandler(async (req, res) => {
  const [usuarios] = await db.query('SELECT * FROM usuarios ORDER BY id');
  res.json(usuarios);
}));

// GET /usuarios/:id  -> consulta um usuário
router.get('/:id', asyncHandler(async (req, res) => {
  const usuario = await buscarPorId(validarId(req.params.id));
  if (!usuario) throw new HttpError(404, 'Usuário não encontrado.');
  res.json(usuario);
}));

// POST /usuarios  -> cadastra um usuário
router.post('/', asyncHandler(async (req, res) => {
  const u = validarUsuario(req.body || {});
  const [resultado] = await db.query(
    'INSERT INTO usuarios (nome, cpf, email, telefone) VALUES (?, ?, ?, ?)',
    [u.nome, u.cpf, u.email, u.telefone]
  );
  res.status(201).json(await buscarPorId(resultado.insertId));
}));

// PUT /usuarios/:id  -> atualiza um usuário
router.put('/:id', asyncHandler(async (req, res) => {
  const id = validarId(req.params.id);
  const u = validarUsuario(req.body || {});
  const [resultado] = await db.query(
    'UPDATE usuarios SET nome = ?, cpf = ?, email = ?, telefone = ? WHERE id = ?',
    [u.nome, u.cpf, u.email, u.telefone, id]
  );
  if (resultado.affectedRows === 0) throw new HttpError(404, 'Usuário não encontrado.');
  res.json(await buscarPorId(id));
}));

// DELETE /usuarios/:id  -> exclui um usuário (bloqueado se houver empréstimos)
router.delete('/:id', asyncHandler(async (req, res) => {
  const id = validarId(req.params.id);
  const [resultado] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
  if (resultado.affectedRows === 0) throw new HttpError(404, 'Usuário não encontrado.');
  res.json({ mensagem: 'Usuário excluído com sucesso.' });
}));

module.exports = router;
