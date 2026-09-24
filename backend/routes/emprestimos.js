const express = require('express');
const db = require('../db');
const { HttpError, asyncHandler, validarId, dataValida } = require('../utils');

const router = express.Router();

const PRAZO_PADRAO_DIAS = 14;

// Consulta base: junta livro e usuário e calcula o status "atrasado"
// (empréstimo ativo com data prevista já vencida).
const SELECT_BASE = `
  SELECT e.id,
         e.livro_id,
         l.titulo  AS livro_titulo,
         e.usuario_id,
         u.nome    AS usuario_nome,
         e.data_emprestimo,
         e.data_prevista_devolucao,
         e.data_devolucao,
         CASE WHEN e.status = 'ativo' AND e.data_prevista_devolucao < CURDATE()
              THEN 'atrasado' ELSE e.status END AS status
    FROM emprestimos e
    JOIN livros   l ON l.id = e.livro_id
    JOIN usuarios u ON u.id = e.usuario_id`;

async function buscarPorId(id, conexao = db) {
  const [linhas] = await conexao.query(`${SELECT_BASE} WHERE e.id = ?`, [id]);
  return linhas[0];
}

// GET /emprestimos  -> lista todos (filtros opcionais: ?status= ?usuario_id= ?livro_id=)
router.get('/', asyncHandler(async (req, res) => {
  const filtros = [];
  const valores = [];

  if (req.query.status !== undefined) {
    if (!['ativo', 'devolvido', 'atrasado'].includes(req.query.status)) {
      throw new HttpError(400, "status inválido. Use 'ativo', 'devolvido' ou 'atrasado'.");
    }
    filtros.push('t.status = ?');
    valores.push(req.query.status);
  }
  if (req.query.usuario_id !== undefined) {
    filtros.push('t.usuario_id = ?');
    valores.push(validarId(req.query.usuario_id));
  }
  if (req.query.livro_id !== undefined) {
    filtros.push('t.livro_id = ?');
    valores.push(validarId(req.query.livro_id));
  }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const [emprestimos] = await db.query(`SELECT * FROM (${SELECT_BASE}) t ${where} ORDER BY t.id`, valores);
  res.json(emprestimos);
}));

// GET /emprestimos/:id  -> consulta um empréstimo
router.get('/:id', asyncHandler(async (req, res) => {
  const emprestimo = await buscarPorId(validarId(req.params.id));
  if (!emprestimo) throw new HttpError(404, 'Empréstimo não encontrado.');
  res.json(emprestimo);
}));

// POST /emprestimos  -> registra um empréstimo
// Corpo: { livro_id, usuario_id, data_prevista_devolucao? (AAAA-MM-DD) }
router.post('/', asyncHandler(async (req, res) => {
  const body = req.body || {};
  const livroId = validarId(body.livro_id ?? 'x');
  const usuarioId = validarId(body.usuario_id ?? 'x');
  const prevista = body.data_prevista_devolucao;
  if (prevista !== undefined && !dataValida(prevista)) {
    throw new HttpError(400, 'data_prevista_devolucao deve estar no formato AAAA-MM-DD.');
  }

  const conexao = await db.getConnection();
  try {
    await conexao.beginTransaction();

    const [[livro]] = await conexao.query('SELECT id, quantidade FROM livros WHERE id = ? FOR UPDATE', [livroId]);
    if (!livro) throw new HttpError(404, 'Livro não encontrado.');
    const [[usuario]] = await conexao.query('SELECT id FROM usuarios WHERE id = ?', [usuarioId]);
    if (!usuario) throw new HttpError(404, 'Usuário não encontrado.');
    if (livro.quantidade < 1) throw new HttpError(409, 'Não há exemplares disponíveis deste livro.');

    const [[{ hoje }]] = await conexao.query('SELECT CURDATE() AS hoje');
    if (prevista !== undefined && prevista < hoje) {
      throw new HttpError(400, 'data_prevista_devolucao não pode ser anterior à data do empréstimo.');
    }

    const [resultado] = await conexao.query(
      `INSERT INTO emprestimos (livro_id, usuario_id, data_emprestimo, data_prevista_devolucao, status)
       VALUES (?, ?, CURDATE(), ${prevista !== undefined ? '?' : `DATE_ADD(CURDATE(), INTERVAL ${PRAZO_PADRAO_DIAS} DAY)`}, 'ativo')`,
      prevista !== undefined ? [livroId, usuarioId, prevista] : [livroId, usuarioId]
    );
    await conexao.query('UPDATE livros SET quantidade = quantidade - 1 WHERE id = ?', [livroId]);

    await conexao.commit();
    res.status(201).json(await buscarPorId(resultado.insertId));
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}));

// PUT /emprestimos/:id  -> registra a devolução e/ou renova o prazo
// Corpo (ao menos um campo):
//   { "status": "devolvido", "data_devolucao": "AAAA-MM-DD" (opcional, padrão = hoje) }
//   { "data_prevista_devolucao": "AAAA-MM-DD" }  (renovação)
router.put('/:id', asyncHandler(async (req, res) => {
  const id = validarId(req.params.id);
  const body = req.body || {};
  const { status, data_devolucao: dataDevolucao, data_prevista_devolucao: novaPrevista } = body;

  if (status !== undefined && status !== 'devolvido') {
    throw new HttpError(400, "status inválido. O único valor permitido na atualização é 'devolvido'.");
  }
  if (dataDevolucao !== undefined && !dataValida(dataDevolucao)) {
    throw new HttpError(400, 'data_devolucao deve estar no formato AAAA-MM-DD.');
  }
  if (novaPrevista !== undefined && !dataValida(novaPrevista)) {
    throw new HttpError(400, 'data_prevista_devolucao deve estar no formato AAAA-MM-DD.');
  }
  const devolver = status === 'devolvido' || dataDevolucao !== undefined;
  if (!devolver && novaPrevista === undefined) {
    throw new HttpError(400, "Informe 'status': 'devolvido' (devolução) ou 'data_prevista_devolucao' (renovação).");
  }
  if (devolver && novaPrevista !== undefined) {
    throw new HttpError(400, 'Não é possível devolver e renovar o mesmo empréstimo na mesma requisição.');
  }

  const conexao = await db.getConnection();
  try {
    await conexao.beginTransaction();

    const [[atual]] = await conexao.query('SELECT * FROM emprestimos WHERE id = ? FOR UPDATE', [id]);
    if (!atual) throw new HttpError(404, 'Empréstimo não encontrado.');
    if (atual.status === 'devolvido') throw new HttpError(409, 'Este empréstimo já foi devolvido e não pode ser alterado.');

    if (devolver) {
      const [[{ hoje }]] = await conexao.query('SELECT CURDATE() AS hoje');
      const data = dataDevolucao ?? hoje;
      if (data < atual.data_emprestimo) {
        throw new HttpError(400, 'data_devolucao não pode ser anterior à data do empréstimo.');
      }
      await conexao.query(
        "UPDATE emprestimos SET status = 'devolvido', data_devolucao = ? WHERE id = ?",
        [data, id]
      );
      await conexao.query('UPDATE livros SET quantidade = quantidade + 1 WHERE id = ?', [atual.livro_id]);
    } else {
      if (novaPrevista < atual.data_emprestimo) {
        throw new HttpError(400, 'data_prevista_devolucao não pode ser anterior à data do empréstimo.');
      }
      await conexao.query('UPDATE emprestimos SET data_prevista_devolucao = ? WHERE id = ?', [novaPrevista, id]);
    }

    await conexao.commit();
    res.json(await buscarPorId(id));
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}));

module.exports = router;
