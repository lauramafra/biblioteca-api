# Requisitos Funcionais – Sistema de Biblioteca

**Cenário:** uma biblioteca deseja organizar seu acervo de livros, manter o cadastro de seus usuários e controlar os empréstimos e devoluções realizados.

## Tabela de Requisitos Funcionais

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

## Regras de negócio associadas

- **RN01:** o ISBN de cada livro deve ser único.
- **RN02:** o CPF e o e-mail de cada usuário devem ser únicos.
- **RN03:** a quantidade de um livro representa os exemplares **disponíveis** no momento (diminui no empréstimo e aumenta na devolução).
- **RN04:** um livro ou usuário que já possui empréstimos registrados não pode ser excluído (preserva o histórico).
- **RN05:** a data prevista para devolução não pode ser anterior à data do empréstimo. Se não for informada, será de 14 dias após o empréstimo.
- **RN06:** um empréstimo já devolvido não pode ser alterado nem devolvido novamente.
