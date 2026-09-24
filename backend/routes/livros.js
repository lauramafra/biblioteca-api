const express = require('express');
const db = require('../db');
const { HttpError, asyncHandler, validarId } = require('../utils');

const router = express.Router();

const CAMPOS_ORDENACAO = ['id', 'titulo', 'autor', 'isbn', 'ano_publicacao', 'categoria', 'quantidade'];

// Valida e normaliza o corpo da requisição (POST e PUT)
function validarLivro(body) {
  const erros = [];
  const titulo = String(body.titulo ?? '').trim();
  const autor = String(body.autor ?? '').trim();
  const isbn = String(body.isbn ?? '').replace(/[\s-]/g, '').toUpperCase();
  const categoria = body.categoria === undefined || body.categoria === null ? null : String(body.categoria).trim() || null;

  let ano = null;
  if (body.ano_publicacao !== undefined && body.ano_publicacao !== null && body.ano_publicacao !== '') {
    ano = Number(body.ano_publicacao);
    if (!Number.isInteger(ano) || ano < 1000 || ano > 2100) erros.push('ano_publicacao deve ser um ano entre 1000 e 2100.');
  }

  let quantidade = 1;
  if (body.quantidade !== undefined && body.quantidade !== null && body.quantidade !== '') {
    quantidade = Number(body.quantidade);
    if (!Number.isInteger(quantidade) || quantidade < 0) erros.push('quantidade deve ser um número inteiro maior ou igual a zero.');
  }

  if (!titulo) erros.push('titulo é obrigatório.');
  else if (titulo.length > 150) erros.push('titulo deve ter no máximo 150 caracteres.');
  if (!autor) erros.push('autor é obrigatório.');
  else if (autor.length > 100) erros.push('autor deve ter no máximo 100 caracteres.');
  if (!isbn) erros.push('isbn é obrigatório.');
  else if (!/^(\d{13}|\d{9}[\dX])$/.test(isbn)) erros.push('isbn deve ter 10 ou 13 dígitos.');
  if (categoria && categoria.length > 60) erros.push('categoria deve ter no máximo 60 caracteres.');

  if (erros.length) throw new HttpError(400, erros.join(' '));
  return { titulo, autor, isbn, ano_publicacao: ano, categoria, quantidade };
}

async function buscarPorId(id) {
  const [linhas] = await db.query('SELECT * FROM livros WHERE id = ?', [id]);
  return linhas[0];
}

// GET /livros  -> lista todos (filtro opcional ?categoria=)
router.get('/', asyncHandler(async (req, res) => {
  const { categoria } = req.query;
  const [livros] = categoria
    ? await db.query('SELECT * FROM livros WHERE categoria = ? ORDER BY id', [categoria])
    : await db.query('SELECT * FROM livros ORDER BY id');
  res.json(livros);
}));

// GET /livros/busca/:titulo  -> pesquisa parcial pelo título
// (deve vir antes de /:id)
router.get('/busca/:titulo', asyncHandler(async (req, res) => {
  const termo = req.params.titulo.trim();
  const [livros] = await db.query(
    'SELECT * FROM livros WHERE titulo LIKE ? ORDER BY titulo',
    [`%${termo.replace(/[\\%_]/g, '\\$&')}%`]
  );
  res.json(livros);
}));

// GET /livros/ordenados?campo=titulo&ordem=asc  -> lista ordenada
router.get('/ordenados', asyncHandler(async (req, res) => {
  const campo = (req.query.campo || 'titulo').toString();
  const ordem = (req.query.ordem || 'asc').toString().toLowerCase();
  if (!CAMPOS_ORDENACAO.includes(campo)) {
    throw new HttpError(400, `campo inválido. Use um destes: ${CAMPOS_ORDENACAO.join(', ')}.`);
  }
  if (!['asc', 'desc'].includes(ordem)) {
    throw new HttpError(400, "ordem inválida. Use 'asc' ou 'desc'.");
  }
  // campo e ordem passaram pela lista de valores permitidos (evita SQL Injection)
  const [livros] = await db.query(`SELECT * FROM livros ORDER BY ${campo} ${ordem.toUpperCase()}, id`);
  res.json(livros);
}));

// GET /livros/:id  -> consulta um livro
router.get('/:id', asyncHandler(async (req, res) => {
  const livro = await buscarPorId(validarId(req.params.id));
  if (!livro) throw new HttpError(404, 'Livro não encontrado.');
  res.json(livro);
}));

// POST /livros  -> cadastra um livro
router.post('/', asyncHandler(async (req, res) => {
  const l = validarLivro(req.body || {});
  const [resultado] = await db.query(
    'INSERT INTO livros (titulo, autor, isbn, ano_publicacao, categoria, quantidade) VALUES (?, ?, ?, ?, ?, ?)',
    [l.titulo, l.autor, l.isbn, l.ano_publicacao, l.categoria, l.quantidade]
  );
  res.status(201).json(await buscarPorId(resultado.insertId));
}));

// PUT /livros/:id  -> atualiza um livro
router.put('/:id', asyncHandler(async (req, res) => {
  const id = validarId(req.params.id);
  const l = validarLivro(req.body || {});
  const [resultado] = await db.query(
    'UPDATE livros SET titulo = ?, autor = ?, isbn = ?, ano_publicacao = ?, categoria = ?, quantidade = ? WHERE id = ?',
    [l.titulo, l.autor, l.isbn, l.ano_publicacao, l.categoria, l.quantidade, id]
  );
  if (resultado.affectedRows === 0) throw new HttpError(404, 'Livro não encontrado.');
  res.json(await buscarPorId(id));
}));

// DELETE /livros/:id  -> exclui um livro (bloqueado se houver empréstimos)
router.delete('/:id', asyncHandler(async (req, res) => {
  const id = validarId(req.params.id);
  const [resultado] = await db.query('DELETE FROM livros WHERE id = ?', [id]);
  if (resultado.affectedRows === 0) throw new HttpError(404, 'Livro não encontrado.');
  res.json({ mensagem: 'Livro excluído com sucesso.' });
}));

module.exports = router;
