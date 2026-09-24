# 📚 Biblioteca API

API REST para gerenciamento de uma biblioteca: cadastro de livros e usuários e controle de empréstimos e devoluções.

## 🎯 Objetivo do sistema

Permitir que uma biblioteca organize seu acervo de livros, mantenha o cadastro de seus usuários e controle os empréstimos realizados, incluindo o estoque de exemplares disponíveis, as devoluções e os atrasos.

## 🛠️ Tecnologias utilizadas

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Express](https://expressjs.com/) – servidor e rotas
- [MySQL](https://www.mysql.com/) (ou MariaDB) com o driver [mysql2](https://github.com/sidorares/node-mysql2)
- [CORS](https://github.com/expressjs/cors) – liberação de acesso para front-ends
- [dotenv](https://github.com/motdotla/dotenv) – configuração por variáveis de ambiente
- Git e GitHub – versionamento

## 📋 Requisitos funcionais

| Código | Requisito Funcional | Descrição |
| --- | --- | --- |
| RF01 | Cadastro de Livro | O sistema deve permitir cadastrar um novo livro informando título, autor, ISBN, ano de publicação, categoria e quantidade de exemplares. |
| RF02 | Listagem de Livros | O sistema deve permitir consultar todos os livros cadastrados. |
| RF03 | Consulta de Livro | O sistema deve permitir consultar os dados de um livro específico a partir do seu identificador. |
| RF04 | Pesquisa de Livros | O sistema deve permitir pesquisar livros pelo título (busca parcial, sem diferenciar maiúsculas de minúsculas). |
| RF05 | Ordenação de Livros | O sistema deve permitir listar os livros ordenados por um campo (título, autor, ano, categoria ou quantidade), em ordem crescente ou decrescente. |
| RF06 | Edição de Livro | O sistema deve permitir alterar os dados de um livro já cadastrado. |
| RF07 | Exclusão de Livro | O sistema deve permitir excluir um livro, desde que ele não possua empréstimos registrados. |
| RF08 | Cadastro de Usuário | O sistema deve permitir cadastrar um novo usuário informando nome, CPF, e-mail e telefone. |
| RF09 | Listagem de Usuários | O sistema deve permitir consultar todos os usuários cadastrados. |
| RF10 | Consulta de Usuário | O sistema deve permitir consultar os dados de um usuário específico a partir do seu identificador. |
| RF11 | Edição de Usuário | O sistema deve permitir alterar os dados de um usuário já cadastrado. |
| RF12 | Exclusão de Usuário | O sistema deve permitir excluir um usuário, desde que ele não possua empréstimos registrados. |
| RF13 | Registro de Empréstimo | O sistema deve permitir registrar o empréstimo de um livro a um usuário, definindo a data do empréstimo e a data prevista para devolução. |
| RF14 | Controle de Estoque | O sistema deve reduzir a quantidade disponível do livro a cada empréstimo e impedir o empréstimo quando não houver exemplares disponíveis. |
| RF15 | Listagem de Empréstimos | O sistema deve permitir consultar todos os empréstimos, com filtros opcionais por status, usuário e livro. |
| RF16 | Consulta de Empréstimo | O sistema deve permitir consultar os dados de um empréstimo específico, incluindo o livro e o usuário envolvidos. |
| RF17 | Registro de Devolução | O sistema deve permitir registrar a devolução de um livro, informando a data da devolução, alterando o status do empréstimo para "devolvido" e devolvendo o exemplar ao estoque. |
| RF18 | Renovação de Empréstimo | O sistema deve permitir alterar a data prevista para devolução de um empréstimo que ainda esteja ativo. |
| RF19 | Identificação de Atrasos | O sistema deve identificar como "atrasado" o empréstimo ativo cuja data prevista para devolução já tenha passado. |
| RF20 | Validação de Dados | O sistema deve validar os dados recebidos (campos obrigatórios, formato de CPF, e-mail, ISBN e datas) e impedir duplicidade de ISBN, CPF e e-mail, retornando mensagens de erro claras. |

As regras de negócio completas estão em [`requisitos-funcionais.md`](requisitos-funcionais.md).

## 🗂️ Modelo lógico

O modelo lógico completo (tabelas, campos, chaves, relacionamentos e cardinalidades) está em [`modelo-logico.pdf`](modelo-logico.pdf) (imagem: [`modelo-logico.png`](modelo-logico.png)).

```
LIVROS (1) ──< EMPRESTIMOS >── (1) USUARIOS
  id PK          id PK             id PK
  titulo         livro_id FK       nome
  autor          usuario_id FK     cpf (único)
  isbn (único)   data_emprestimo   email (único)
  ano_publicacao data_prevista_devolucao  telefone
  categoria      data_devolucao
  quantidade     status
```

- Um livro pode aparecer em vários empréstimos (1:N) e um usuário pode fazer vários empréstimos (1:N).
- `livros.quantidade` guarda os exemplares **disponíveis**: diminui a cada empréstimo e aumenta a cada devolução.
- O status `atrasado` não é gravado: é calculado nas consultas (empréstimo `ativo` com data prevista já vencida).
- Livros e usuários com empréstimos não podem ser excluídos (preserva o histórico).

## 📁 Estrutura do projeto

```
biblioteca-api/
└── backend/
    ├── routes/
    │   ├── livros.js
    │   ├── usuarios.js
    │   └── emprestimos.js
    ├── testes/
    │   ├── testar-api.js          # testes automatizados
    │   ├── relatorio-testes.md    # resultado dos testes
    │   └── requisicoes.http       # requisições para testar manualmente
    ├── db.js                      # conexão com o MySQL
    ├── server.js                  # servidor Express
    ├── utils.js                   # funções auxiliares
    ├── banco.sql                  # criação do banco + dados de teste
    ├── modelo-logico.pdf
    ├── modelo-logico.png
    ├── requisitos-funcionais.md
    ├── package.json
    ├── package-lock.json
    ├── .env.example
    └── README.md
```

## ⚙️ Como configurar o banco de dados

1. Instale e inicie o MySQL (ou MariaDB).
2. Na pasta `backend`, execute o script (ele cria o banco `biblioteca`, as tabelas e insere dados de teste):

   ```bash
   mysql -u root -p < banco.sql
   ```

   Ou abra o `banco.sql` no MySQL Workbench e execute o script inteiro.

   > O script pode ser executado novamente a qualquer momento para **restaurar** os dados iniciais.

3. Crie o arquivo `.env` a partir do modelo e informe os dados da sua conexão:

   ```bash
   cp .env.example .env
   ```

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_NAME=biblioteca
   ```

## 📦 Como instalar as dependências

```bash
cd backend
npm install
```

## ▶️ Como executar o servidor

```bash
npm start
```

O servidor ficará disponível em **http://localhost:3000**. Para reiniciar automaticamente ao salvar arquivos, use `npm run dev`.

Teste rápido: acesse `http://localhost:3000/` — deve aparecer `{"mensagem":"API da Biblioteca funcionando!","banco":"conectado"}`.

## 🔗 Rotas disponíveis

### Livros

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/livros` | Lista todos os livros (filtro opcional `?categoria=`) |
| GET | `/livros/:id` | Consulta um livro |
| GET | `/livros/busca/:titulo` | Pesquisa livros pelo título (busca parcial) |
| GET | `/livros/ordenados` | Lista ordenada: `?campo=` (`id`, `titulo`, `autor`, `isbn`, `ano_publicacao`, `categoria`, `quantidade`) e `?ordem=` (`asc` ou `desc`). Padrão: título crescente |
| POST | `/livros` | Cadastra um livro |
| PUT | `/livros/:id` | Atualiza um livro |
| DELETE | `/livros/:id` | Exclui um livro |

### Usuários

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/usuarios` | Lista todos os usuários |
| GET | `/usuarios/:id` | Consulta um usuário |
| POST | `/usuarios` | Cadastra um usuário |
| PUT | `/usuarios/:id` | Atualiza um usuário |
| DELETE | `/usuarios/:id` | Exclui um usuário |

### Empréstimos

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/emprestimos` | Lista os empréstimos (filtros opcionais `?status=ativo\|devolvido\|atrasado`, `?usuario_id=`, `?livro_id=`) |
| GET | `/emprestimos/:id` | Consulta um empréstimo |
| POST | `/emprestimos` | Registra um empréstimo (reduz o estoque do livro) |
| PUT | `/emprestimos/:id` | Registra a devolução (`"status": "devolvido"`) ou renova o prazo (`"data_prevista_devolucao"`) |

### Códigos de resposta

| Código | Quando ocorre |
| --- | --- |
| 200 | Consulta, atualização ou exclusão realizada |
| 201 | Registro criado |
| 400 | Dados inválidos, campo obrigatório ausente ou id inválido |
| 404 | Registro ou rota não encontrada |
| 409 | Conflito: ISBN/CPF/e-mail já cadastrado, livro sem exemplares, empréstimo já devolvido ou exclusão de registro com empréstimos |
| 503 | Falha na conexão com o banco de dados |

Os erros são sempre devolvidos no formato `{ "erro": "mensagem explicando o problema" }`.

## 🧪 Exemplos de requisições

### Cadastrar um livro

```bash
curl -X POST http://localhost:3000/livros \
  -H "Content-Type: application/json" \
  -d '{"titulo":"O Alienista","autor":"Machado de Assis","isbn":"9788535912345","ano_publicacao":1882,"categoria":"Romance","quantidade":3}'
```

Resposta (`201 Created`):

```json
{
  "id": 11,
  "titulo": "O Alienista",
  "autor": "Machado de Assis",
  "isbn": "9788535912345",
  "ano_publicacao": 1882,
  "categoria": "Romance",
  "quantidade": 3
}
```

### Pesquisar livros pelo título

```bash
curl http://localhost:3000/livros/busca/dom
```

### Listar livros ordenados por ano (mais recentes primeiro)

```bash
curl "http://localhost:3000/livros/ordenados?campo=ano_publicacao&ordem=desc"
```

### Cadastrar um usuário

```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"Paulo Santos","cpf":"935.411.347-80","email":"paulo.santos@email.com","telefone":"(47) 99999-1234"}'
```

O CPF e o telefone são gravados apenas com dígitos.

### Registrar um empréstimo

```bash
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"livro_id":5,"usuario_id":5}'
```

Se `data_prevista_devolucao` (formato `AAAA-MM-DD`) não for informada, o prazo padrão é de 14 dias. Resposta (`201 Created`):

```json
{
  "id": 5,
  "livro_id": 5,
  "livro_titulo": "Código Limpo",
  "usuario_id": 5,
  "usuario_nome": "Fernanda Lima",
  "data_emprestimo": "2026-09-24",
  "data_prevista_devolucao": "2026-10-08",
  "data_devolucao": null,
  "status": "ativo"
}
```

### Registrar a devolução

```bash
curl -X PUT http://localhost:3000/emprestimos/5 \
  -H "Content-Type: application/json" \
  -d '{"status":"devolvido"}'
```

O status muda para `devolvido`, a `data_devolucao` é preenchida (hoje, ou a data enviada em `data_devolucao`) e o exemplar volta ao estoque.

### Renovar o prazo

```bash
curl -X PUT http://localhost:3000/emprestimos/1 \
  -H "Content-Type: application/json" \
  -d '{"data_prevista_devolucao":"2030-12-31"}'
```

### Exemplo de erro

```bash
curl -X POST http://localhost:3000/usuarios -H "Content-Type: application/json" \
  -d '{"nome":"Fulano","cpf":"111.111.111-11","email":"fulano@email.com"}'
```

```json
{ "erro": "cpf inválido." }
```

Mais exemplos prontos para Postman, Insomnia, Thunder Client ou REST Client estão em [`testes/requisicoes.http`](testes/requisicoes.http).

## ✅ Testes

Com o banco recém-criado (`banco.sql`) e o servidor rodando, execute em outro terminal:

```bash
npm test
```

O script testa todas as rotas (cadastro, consulta, pesquisa, ordenação, alteração, exclusão, empréstimo e devolução), confere o código HTTP, a resposta e a alteração real no banco, e gera o relatório [`testes/relatorio-testes.md`](testes/relatorio-testes.md).

## 👤 Autor

Projeto desenvolvido como atividade prática de API REST com Node.js, Express e MySQL.
