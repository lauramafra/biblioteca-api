/**
 * Testes automatizados da API (Etapa 5).
 * Percorre todas as rotas, confere o código HTTP, a resposta e a alteração real no banco
 * e gera o relatório testes/relatorio-testes.md.
 *
 * Uso: com o banco recém-criado (banco.sql) e o servidor rodando:  npm test
 */
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const db = require('../db');

const BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;

// gera um CPF válido a partir de 9 dígitos
function gerarCpf(base9) {
  const d = (s) => {
    let soma = 0;
    for (let i = 0; i < s.length; i++) soma += Number(s[i]) * (s.length + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const d1 = d(base9);
  return base9 + d1 + d(base9 + d1);
}

const ctx = {}; // guarda ids criados durante os testes
const resultados = [];

async function sql(consulta, valores = []) {
  const [linhas] = await db.query(consulta, valores);
  return linhas;
}

async function teste({ grupo, nome, metodo, url, corpo, bruto, esperado, verificar }) {
  const urlFinal = typeof url === 'function' ? url() : url;
  const corpoFinal = typeof corpo === 'function' ? corpo() : corpo;
  const opcoes = { method: metodo, headers: {} };
  if (bruto !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = bruto;
  } else if (corpoFinal !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(corpoFinal);
  }

  let status = 0, dados = null, falha = '', banco = '';
  try {
    const resp = await fetch(BASE + urlFinal, opcoes);
    status = resp.status;
    dados = await resp.json().catch(() => null);
    if (status !== esperado) falha = `esperava HTTP ${esperado}, recebeu ${status}`;
    if (!falha && verificar) banco = (await verificar(dados)) || '';
    if (banco.startsWith('FALHA')) { falha = banco; }
  } catch (e) {
    falha = `erro: ${e.message}`;
  }
  resultados.push({ n: resultados.length + 1, grupo, nome, metodo, url: urlFinal, corpo: bruto ?? corpoFinal, esperado, status, dados, banco, ok: !falha, falha });
  console.log(`${falha ? 'FALHOU' : 'OK    '} #${String(resultados.length).padStart(2, '0')} ${metodo.padEnd(6)} ${urlFinal}  -> ${status} ${falha ? '(' + falha + ')' : ''}`);
}

const ok = (cond, msg) => (cond ? msg : `FALHA no banco: ${msg}`);

async function executar() {
  const sufixo = Date.now().toString().slice(-6);
  const cpfNovo = gerarCpf('935411347');
  const cpfExcluir = gerarCpf('111222333');

  // ---------------------------------------------------------------- LIVROS
  const G1 = 'Livros';
  await teste({ grupo: G1, nome: 'Cadastro de livro válido', metodo: 'POST', url: '/livros', esperado: 201,
    corpo: { titulo: 'Teste de API', autor: 'Autor Teste', isbn: `978${sufixo}0000`.slice(0, 13).padEnd(13, '1'), ano_publicacao: 2024, categoria: 'Tecnologia', quantidade: 5 },
    verificar: async (r) => { ctx.livroId = r.id; ctx.isbn = r.isbn; const [l] = await sql('SELECT * FROM livros WHERE id=?', [r.id]); return ok(l && l.titulo === 'Teste de API' && l.quantidade === 5, `livro ${r.id} inserido na tabela livros (quantidade = 5)`); } });
  await teste({ grupo: G1, nome: 'Cadastro sem título (campo obrigatório)', metodo: 'POST', url: '/livros', esperado: 400,
    corpo: { autor: 'Fulano', isbn: '9781234567897' } });
  await teste({ grupo: G1, nome: 'Cadastro com ISBN duplicado', metodo: 'POST', url: '/livros', esperado: 409,
    corpo: () => ({ titulo: 'Outro', autor: 'Outro', isbn: ctx.isbn }) });
  await teste({ grupo: G1, nome: 'Cadastro com ano de publicação inválido', metodo: 'POST', url: '/livros', esperado: 400,
    corpo: { titulo: 'Livro', autor: 'Autor', isbn: '9781234567897', ano_publicacao: 'abc' } });
  await teste({ grupo: G1, nome: 'Listagem de livros', metodo: 'GET', url: '/livros', esperado: 200,
    verificar: async (r) => { const [{ total }] = await sql('SELECT COUNT(*) total FROM livros'); return ok(Array.isArray(r) && r.length === total, `a API retornou ${r.length} livros = ${total} registros na tabela`); } });
  await teste({ grupo: G1, nome: 'Consulta de livro por id', metodo: 'GET', url: () => `/livros/${ctx.livroId}`, esperado: 200,
    verificar: async (r) => ok(r.id === ctx.livroId && r.titulo === 'Teste de API', 'dados conferem com o registro criado') });
  await teste({ grupo: G1, nome: 'Consulta de livro inexistente', metodo: 'GET', url: '/livros/999999', esperado: 404 });
  await teste({ grupo: G1, nome: 'Consulta com id inválido', metodo: 'GET', url: '/livros/abc', esperado: 400 });
  await teste({ grupo: G1, nome: 'Pesquisa por título (parcial)', metodo: 'GET', url: '/livros/busca/casmurro', esperado: 200,
    verificar: async (r) => ok(r.length === 1 && r[0].titulo === 'Dom Casmurro', 'encontrou "Dom Casmurro"') });
  await teste({ grupo: G1, nome: 'Pesquisa sem resultados', metodo: 'GET', url: '/livros/busca/xyzxyzxyz', esperado: 200,
    verificar: async (r) => ok(Array.isArray(r) && r.length === 0, 'lista vazia') });
  await teste({ grupo: G1, nome: 'Ordenação por ano (decrescente)', metodo: 'GET', url: '/livros/ordenados?campo=ano_publicacao&ordem=desc', esperado: 200,
    verificar: async (r) => ok(r.every((l, i) => i === 0 || l.ano_publicacao <= r[i - 1].ano_publicacao), 'anos em ordem decrescente') });
  await teste({ grupo: G1, nome: 'Ordenação por título (padrão crescente)', metodo: 'GET', url: '/livros/ordenados', esperado: 200 });
  await teste({ grupo: G1, nome: 'Ordenação por campo inválido', metodo: 'GET', url: '/livros/ordenados?campo=senha', esperado: 400 });
  await teste({ grupo: G1, nome: 'Edição de livro', metodo: 'PUT', url: () => `/livros/${ctx.livroId}`, esperado: 200,
    corpo: () => ({ titulo: 'Teste de API (editado)', autor: 'Autor Teste', isbn: ctx.isbn, ano_publicacao: 2025, categoria: 'Tecnologia', quantidade: 5 }),
    verificar: async () => { const [l] = await sql('SELECT * FROM livros WHERE id=?', [ctx.livroId]); return ok(l.titulo === 'Teste de API (editado)' && l.ano_publicacao === 2025, 'título e ano alterados na tabela'); } });
  await teste({ grupo: G1, nome: 'Edição de livro inexistente', metodo: 'PUT', url: '/livros/999999', esperado: 404,
    corpo: { titulo: 'X', autor: 'Y', isbn: '9781234567897' } });

  // -------------------------------------------------------------- USUÁRIOS
  const G2 = 'Usuários';
  await teste({ grupo: G2, nome: 'Cadastro de usuário válido', metodo: 'POST', url: '/usuarios', esperado: 201,
    corpo: { nome: 'Usuário de Teste', cpf: cpfNovo, email: `teste${sufixo}@email.com`, telefone: '(47) 99999-0000' },
    verificar: async (r) => { ctx.usuarioId = r.id; ctx.email = r.email; const [u] = await sql('SELECT * FROM usuarios WHERE id=?', [r.id]); return ok(u && u.cpf === cpfNovo && u.telefone === '47999990000', `usuário ${r.id} inserido (CPF e telefone salvos só com dígitos)`); } });
  await teste({ grupo: G2, nome: 'Cadastro com CPF inválido', metodo: 'POST', url: '/usuarios', esperado: 400,
    corpo: { nome: 'Fulano', cpf: '11111111111', email: 'fulano@email.com' } });
  await teste({ grupo: G2, nome: 'Cadastro com CPF duplicado', metodo: 'POST', url: '/usuarios', esperado: 409,
    corpo: { nome: 'Fulano', cpf: '529.982.247-25', email: 'outro@email.com' } });
  await teste({ grupo: G2, nome: 'Cadastro com e-mail inválido', metodo: 'POST', url: '/usuarios', esperado: 400,
    corpo: { nome: 'Fulano', cpf: gerarCpf('222333444'), email: 'email-invalido' } });
  await teste({ grupo: G2, nome: 'Usuário extra para teste de exclusão', metodo: 'POST', url: '/usuarios', esperado: 201,
    corpo: { nome: 'Usuário Descartável', cpf: cpfExcluir, email: `descartavel${sufixo}@email.com` },
    verificar: async (r) => { ctx.usuarioExcluirId = r.id; return `usuário ${r.id} criado`; } });
  await teste({ grupo: G2, nome: 'Listagem de usuários', metodo: 'GET', url: '/usuarios', esperado: 200,
    verificar: async (r) => { const [{ total }] = await sql('SELECT COUNT(*) total FROM usuarios'); return ok(r.length === total, `a API retornou ${r.length} usuários = ${total} registros`); } });
  await teste({ grupo: G2, nome: 'Consulta de usuário por id', metodo: 'GET', url: () => `/usuarios/${ctx.usuarioId}`, esperado: 200 });
  await teste({ grupo: G2, nome: 'Consulta de usuário inexistente', metodo: 'GET', url: '/usuarios/999999', esperado: 404 });
  await teste({ grupo: G2, nome: 'Edição de usuário', metodo: 'PUT', url: () => `/usuarios/${ctx.usuarioId}`, esperado: 200,
    corpo: () => ({ nome: 'Usuário de Teste (editado)', cpf: cpfNovo, email: ctx.email, telefone: '4733334444' }),
    verificar: async () => { const [u] = await sql('SELECT * FROM usuarios WHERE id=?', [ctx.usuarioId]); return ok(u.nome === 'Usuário de Teste (editado)' && u.telefone === '4733334444', 'nome e telefone alterados na tabela'); } });
  await teste({ grupo: G2, nome: 'Edição com e-mail de outro usuário', metodo: 'PUT', url: () => `/usuarios/${ctx.usuarioId}`, esperado: 409,
    corpo: () => ({ nome: 'Usuário de Teste', cpf: cpfNovo, email: 'maria.silva@email.com' }) });

  // ----------------------------------------------------------- EMPRÉSTIMOS
  const G3 = 'Empréstimos';
  await teste({ grupo: G3, nome: 'Registro de empréstimo (prazo padrão de 14 dias)', metodo: 'POST', url: '/emprestimos', esperado: 201,
    corpo: () => ({ livro_id: ctx.livroId, usuario_id: ctx.usuarioId }),
    verificar: async (r) => {
      ctx.emprestimoId = r.id;
      const [l] = await sql('SELECT quantidade FROM livros WHERE id=?', [ctx.livroId]);
      const [e] = await sql("SELECT status, DATEDIFF(data_prevista_devolucao, data_emprestimo) dias FROM emprestimos WHERE id=?", [r.id]);
      return ok(l.quantidade === 4 && e.status === 'ativo' && e.dias === 14, `empréstimo ${r.id} gravado (ativo, 14 dias) e estoque do livro caiu de 5 para ${l.quantidade}`);
    } });
  await teste({ grupo: G3, nome: 'Empréstimo de livro sem exemplares disponíveis', metodo: 'POST', url: '/emprestimos', esperado: 409,
    corpo: () => ({ livro_id: ctx.livroSemEstoque, usuario_id: ctx.usuarioId }),
    verificar: async () => { const [{ total }] = await sql('SELECT COUNT(*) total FROM emprestimos WHERE livro_id=?', [ctx.livroSemEstoque]); return ok(total === 0, 'nenhum empréstimo foi gravado'); } });
  await teste({ grupo: G3, nome: 'Empréstimo com livro inexistente', metodo: 'POST', url: '/emprestimos', esperado: 404,
    corpo: () => ({ livro_id: 999999, usuario_id: ctx.usuarioId }) });
  await teste({ grupo: G3, nome: 'Empréstimo com usuário inexistente', metodo: 'POST', url: '/emprestimos', esperado: 404,
    corpo: () => ({ livro_id: ctx.livroId, usuario_id: 999999 }) });
  await teste({ grupo: G3, nome: 'Empréstimo sem informar livro/usuário', metodo: 'POST', url: '/emprestimos', esperado: 400, corpo: {} });
  await teste({ grupo: G3, nome: 'Empréstimo com data prevista em formato inválido', metodo: 'POST', url: '/emprestimos', esperado: 400,
    corpo: () => ({ livro_id: ctx.livroId, usuario_id: ctx.usuarioId, data_prevista_devolucao: '31/12/2030' }) });
  await teste({ grupo: G3, nome: 'Empréstimo com data prevista no passado', metodo: 'POST', url: '/emprestimos', esperado: 400,
    corpo: () => ({ livro_id: ctx.livroId, usuario_id: ctx.usuarioId, data_prevista_devolucao: '2020-01-01' }) });
  await teste({ grupo: G3, nome: 'Listagem de empréstimos', metodo: 'GET', url: '/emprestimos', esperado: 200,
    verificar: async (r) => { const [{ total }] = await sql('SELECT COUNT(*) total FROM emprestimos'); return ok(r.length === total, `a API retornou ${r.length} empréstimos = ${total} registros`); } });
  await teste({ grupo: G3, nome: 'Filtro por status "atrasado" (dados de teste do banco.sql)', metodo: 'GET', url: '/emprestimos?status=atrasado', esperado: 200,
    verificar: async (r) => ok(r.length >= 1 && r.every((e) => e.status === 'atrasado'), `${r.length} empréstimo(s) atrasado(s) identificado(s)`) });
  await teste({ grupo: G3, nome: 'Filtro com status inválido', metodo: 'GET', url: '/emprestimos?status=perdido', esperado: 400 });
  await teste({ grupo: G3, nome: 'Consulta de empréstimo por id', metodo: 'GET', url: () => `/emprestimos/${ctx.emprestimoId}`, esperado: 200,
    verificar: async (r) => ok(r.livro_titulo.startsWith('Teste de API') && r.usuario_nome.startsWith('Usuário de Teste'), 'resposta inclui título do livro e nome do usuário') });
  await teste({ grupo: G3, nome: 'Consulta de empréstimo inexistente', metodo: 'GET', url: '/emprestimos/999999', esperado: 404 });
  await teste({ grupo: G3, nome: 'Renovação (nova data prevista)', metodo: 'PUT', url: () => `/emprestimos/${ctx.emprestimoId}`, esperado: 200,
    corpo: { data_prevista_devolucao: '2030-12-31' },
    verificar: async () => { const [e] = await sql('SELECT data_prevista_devolucao d FROM emprestimos WHERE id=?', [ctx.emprestimoId]); return ok(String(e.d).startsWith('2030-12-31'), 'data prevista alterada para 2030-12-31'); } });
  await teste({ grupo: G3, nome: 'Atualização sem dados válidos', metodo: 'PUT', url: () => `/emprestimos/${ctx.emprestimoId}`, esperado: 400, corpo: {} });
  await teste({ grupo: G3, nome: 'Devolução do livro', metodo: 'PUT', url: () => `/emprestimos/${ctx.emprestimoId}`, esperado: 200,
    corpo: { status: 'devolvido' },
    verificar: async () => {
      const [e] = await sql('SELECT status, data_devolucao FROM emprestimos WHERE id=?', [ctx.emprestimoId]);
      const [l] = await sql('SELECT quantidade FROM livros WHERE id=?', [ctx.livroId]);
      return ok(e.status === 'devolvido' && e.data_devolucao && l.quantidade === 5, `status = devolvido, data_devolucao preenchida e estoque voltou para ${l.quantidade}`);
    } });
  await teste({ grupo: G3, nome: 'Devolução repetida (já devolvido)', metodo: 'PUT', url: () => `/emprestimos/${ctx.emprestimoId}`, esperado: 409,
    corpo: { status: 'devolvido' },
    verificar: async () => { const [l] = await sql('SELECT quantidade FROM livros WHERE id=?', [ctx.livroId]); return ok(l.quantidade === 5, 'estoque continua 5 (não foi somado de novo)'); } });
  await teste({ grupo: G3, nome: 'Atualização de empréstimo inexistente', metodo: 'PUT', url: '/emprestimos/999999', esperado: 404, corpo: { status: 'devolvido' } });

  // -------------------------------------------------------------- EXCLUSÕES
  const G4 = 'Exclusões';
  await teste({ grupo: G4, nome: 'Excluir livro que possui empréstimos', metodo: 'DELETE', url: () => `/livros/${ctx.livroId}`, esperado: 409,
    verificar: async () => { const l = await sql('SELECT id FROM livros WHERE id=?', [ctx.livroId]); return ok(l.length === 1, 'livro continua na tabela'); } });
  await teste({ grupo: G4, nome: 'Excluir usuário que possui empréstimos', metodo: 'DELETE', url: () => `/usuarios/${ctx.usuarioId}`, esperado: 409,
    verificar: async () => { const u = await sql('SELECT id FROM usuarios WHERE id=?', [ctx.usuarioId]); return ok(u.length === 1, 'usuário continua na tabela'); } });
  await teste({ grupo: G4, nome: 'Excluir livro sem empréstimos', metodo: 'DELETE', url: () => `/livros/${ctx.livroSemEstoque}`, esperado: 200,
    verificar: async () => { const l = await sql('SELECT id FROM livros WHERE id=?', [ctx.livroSemEstoque]); return ok(l.length === 0, 'registro removido da tabela livros'); } });
  await teste({ grupo: G4, nome: 'Excluir usuário sem empréstimos', metodo: 'DELETE', url: () => `/usuarios/${ctx.usuarioExcluirId}`, esperado: 200,
    verificar: async () => { const u = await sql('SELECT id FROM usuarios WHERE id=?', [ctx.usuarioExcluirId]); return ok(u.length === 0, 'registro removido da tabela usuarios'); } });
  await teste({ grupo: G4, nome: 'Excluir livro inexistente', metodo: 'DELETE', url: '/livros/999999', esperado: 404 });
  await teste({ grupo: G4, nome: 'Excluir usuário inexistente', metodo: 'DELETE', url: '/usuarios/999999', esperado: 404 });

  // ------------------------------------------------------------------ GERAL
  const G5 = 'Erros gerais';
  await teste({ grupo: G5, nome: 'Rota inexistente', metodo: 'GET', url: '/rota-que-nao-existe', esperado: 404 });
  await teste({ grupo: G5, nome: 'JSON malformado no corpo', metodo: 'POST', url: '/livros', esperado: 400, bruto: '{"titulo": "abc",' });
}

// Cria o livro sem estoque usado nos testes de empréstimo/exclusão (também testa POST com quantidade 0)
async function preparar() {
  const sufixo = Date.now().toString().slice(-6);
  const resp = await fetch(`${BASE}/livros`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo: 'Livro Sem Estoque', autor: 'Autor', isbn: `979${sufixo}0009`.padEnd(13, '2').slice(0, 13), quantidade: 0 }) });
  const dados = await resp.json();
  ctx.livroSemEstoque = dados.id;
}

function gerarRelatorio() {
  const total = resultados.length, passou = resultados.filter((r) => r.ok).length;
  const linhas = [];
  linhas.push('# Relatório de Testes da API', '');
  linhas.push(`Gerado automaticamente por \`npm test\` em ${new Date().toLocaleString('pt-BR')}.`, '');
  linhas.push(`**Resultado: ${passou}/${total} testes aprovados.**`, '');
  linhas.push('Para cada teste foram conferidos: método HTTP, URL, dados enviados, resposta e código HTTP recebidos,',
    'a alteração real no banco de dados (consulta SQL direta) e o tratamento de erros.', '');
  linhas.push('## Resumo', '', '| # | Grupo | Teste | Método | URL | HTTP esperado | HTTP recebido | Resultado |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of resultados) linhas.push(`| ${r.n} | ${r.grupo} | ${r.nome} | ${r.metodo} | \`${r.url}\` | ${r.esperado} | ${r.status} | ${r.ok ? '✅ Passou' : '❌ Falhou'} |`);
  linhas.push('', '## Detalhes', '');
  let grupo = '';
  for (const r of resultados) {
    if (r.grupo !== grupo) { grupo = r.grupo; linhas.push(`### ${grupo}`, ''); }
    linhas.push(`**#${r.n} – ${r.nome}** ${r.ok ? '✅' : '❌'}`, '');
    linhas.push(`- Requisição: \`${r.metodo} ${r.url}\``);
    if (r.corpo !== undefined) linhas.push(`- Dados enviados: \`${typeof r.corpo === 'string' ? r.corpo : JSON.stringify(r.corpo)}\``);
    linhas.push(`- Código HTTP: ${r.status} (esperado ${r.esperado})`);
    let resp = JSON.stringify(r.dados);
    if (resp && resp.length > 300) resp = resp.slice(0, 300) + '… (resposta truncada)';
    linhas.push(`- Resposta: \`${resp}\``);
    if (r.banco) linhas.push(`- Verificação no banco: ${r.banco.replace(/^FALHA no banco: /, '❌ ')}`);
    if (r.falha) linhas.push(`- ❌ Falha: ${r.falha}`);
    linhas.push('');
  }
  fs.writeFileSync(path.join(__dirname, 'relatorio-testes.md'), linhas.join('\n'), 'utf8');
  return { total, passou };
}

(async () => {
  try {
    const raiz = await fetch(BASE + '/').catch(() => null);
    if (!raiz || !raiz.ok) {
      console.error(`Não foi possível acessar a API em ${BASE}. Inicie o servidor (npm start) e tente novamente.`);
      process.exit(1);
    }
    await preparar();
    await executar();
    const { total, passou } = gerarRelatorio();
    console.log(`\n${passou}/${total} testes aprovados. Relatório salvo em testes/relatorio-testes.md`);
    process.exitCode = passou === total ? 0 : 1;
  } finally {
    await db.end();
  }
})();
