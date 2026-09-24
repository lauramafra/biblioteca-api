require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
