// Conexão com o MySQL (pool de conexões)
require('dotenv').config({ quiet: true });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'biblioteca',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // devolve DATE como 'AAAA-MM-DD' (evita problemas de fuso horário)
});

module.exports = pool;
