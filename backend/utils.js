// Funções auxiliares usadas pelas rotas

// Erro com código HTTP, tratado pelo middleware de erros do server.js
class HttpError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

// Repassa erros de funções async para o middleware de erros do Express
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Converte o parâmetro :id em inteiro positivo ou lança erro 400
function validarId(valor) {
  if (!/^\d+$/.test(String(valor)) || Number(valor) < 1) {
    throw new HttpError(400, 'O id informado é inválido.');
  }
  return Number(valor);
}

// Valida uma data no formato AAAA-MM-DD (e se ela existe de verdade)
function dataValida(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const d = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}

module.exports = { HttpError, asyncHandler, validarId, dataValida };
