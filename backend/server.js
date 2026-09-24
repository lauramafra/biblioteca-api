require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { HttpError } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de verificação (testa também a conexão com o banco)
app.get('/', async (req, res, next) => {
  try {
    await db.query('SELECT 1');
    res.json({ mensagem: 'API da Biblioteca funcionando!', banco: 'conectado' });
  } catch (erro) {
    next(erro);
  }
});

// Rotas
app.use('/livros', require('./routes/livros'));
app.use('/usuarios', require('./routes/usuarios'));

// Rota não encontrada
app.use((req, res, next) => {
  next(new HttpError(404, `Rota não encontrada: ${req.method} ${req.originalUrl}`));
});

// Tratamento centralizado de erros
app.use((erro, req, res, next) => {
  if (erro.status) return res.status(erro.status).json({ erro: erro.message });
  if (erro.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });

  // Erros do MySQL
  switch (erro.code) {
    case 'ER_DUP_ENTRY': {
      const campo = /for key '(?:\w+\.)?(?:uq_\w+?_)?(\w+)'/.exec(erro.sqlMessage || '');
      return res.status(409).json({ erro: `Já existe um registro com este valor${campo ? ` (${campo[1]})` : ''}.` });
    }
    case 'ER_ROW_IS_REFERENCED_2':
      return res.status(409).json({ erro: 'Não é possível excluir: existem empréstimos vinculados a este registro.' });
    case 'ER_NO_REFERENCED_ROW_2':
      return res.status(400).json({ erro: 'Livro ou usuário informado não existe.' });
    case 'ECONNREFUSED':
    case 'ER_ACCESS_DENIED_ERROR':
    case 'ER_BAD_DB_ERROR':
      return res.status(503).json({ erro: 'Não foi possível conectar ao banco de dados.' });
  }
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
