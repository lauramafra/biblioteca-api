# Relatório de Testes da API

Gerado automaticamente por `npm test` em 24/09/2026, 11:22:40.

**Resultado: 50/50 testes aprovados.**

Para cada teste foram conferidos: método HTTP, URL, dados enviados, resposta e código HTTP recebidos,
a alteração real no banco de dados (consulta SQL direta) e o tratamento de erros.

## Resumo

| # | Grupo | Teste | Método | URL | HTTP esperado | HTTP recebido | Resultado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Livros | Cadastro de livro válido | POST | `/livros` | 201 | 201 | ✅ Passou |
| 2 | Livros | Cadastro sem título (campo obrigatório) | POST | `/livros` | 400 | 400 | ✅ Passou |
| 3 | Livros | Cadastro com ISBN duplicado | POST | `/livros` | 409 | 409 | ✅ Passou |
| 4 | Livros | Cadastro com ano de publicação inválido | POST | `/livros` | 400 | 400 | ✅ Passou |
| 5 | Livros | Listagem de livros | GET | `/livros` | 200 | 200 | ✅ Passou |
| 6 | Livros | Consulta de livro por id | GET | `/livros/12` | 200 | 200 | ✅ Passou |
| 7 | Livros | Consulta de livro inexistente | GET | `/livros/999999` | 404 | 404 | ✅ Passou |
| 8 | Livros | Consulta com id inválido | GET | `/livros/abc` | 400 | 400 | ✅ Passou |
| 9 | Livros | Pesquisa por título (parcial) | GET | `/livros/busca/casmurro` | 200 | 200 | ✅ Passou |
| 10 | Livros | Pesquisa sem resultados | GET | `/livros/busca/xyzxyzxyz` | 200 | 200 | ✅ Passou |
| 11 | Livros | Ordenação por ano (decrescente) | GET | `/livros/ordenados?campo=ano_publicacao&ordem=desc` | 200 | 200 | ✅ Passou |
| 12 | Livros | Ordenação por título (padrão crescente) | GET | `/livros/ordenados` | 200 | 200 | ✅ Passou |
| 13 | Livros | Ordenação por campo inválido | GET | `/livros/ordenados?campo=senha` | 400 | 400 | ✅ Passou |
| 14 | Livros | Edição de livro | PUT | `/livros/12` | 200 | 200 | ✅ Passou |
| 15 | Livros | Edição de livro inexistente | PUT | `/livros/999999` | 404 | 404 | ✅ Passou |
| 16 | Usuários | Cadastro de usuário válido | POST | `/usuarios` | 201 | 201 | ✅ Passou |
| 17 | Usuários | Cadastro com CPF inválido | POST | `/usuarios` | 400 | 400 | ✅ Passou |
| 18 | Usuários | Cadastro com CPF duplicado | POST | `/usuarios` | 409 | 409 | ✅ Passou |
| 19 | Usuários | Cadastro com e-mail inválido | POST | `/usuarios` | 400 | 400 | ✅ Passou |
| 20 | Usuários | Usuário extra para teste de exclusão | POST | `/usuarios` | 201 | 201 | ✅ Passou |
| 21 | Usuários | Listagem de usuários | GET | `/usuarios` | 200 | 200 | ✅ Passou |
| 22 | Usuários | Consulta de usuário por id | GET | `/usuarios/6` | 200 | 200 | ✅ Passou |
| 23 | Usuários | Consulta de usuário inexistente | GET | `/usuarios/999999` | 404 | 404 | ✅ Passou |
| 24 | Usuários | Edição de usuário | PUT | `/usuarios/6` | 200 | 200 | ✅ Passou |
| 25 | Usuários | Edição com e-mail de outro usuário | PUT | `/usuarios/6` | 409 | 409 | ✅ Passou |
| 26 | Empréstimos | Registro de empréstimo (prazo padrão de 14 dias) | POST | `/emprestimos` | 201 | 201 | ✅ Passou |
| 27 | Empréstimos | Empréstimo de livro sem exemplares disponíveis | POST | `/emprestimos` | 409 | 409 | ✅ Passou |
| 28 | Empréstimos | Empréstimo com livro inexistente | POST | `/emprestimos` | 404 | 404 | ✅ Passou |
| 29 | Empréstimos | Empréstimo com usuário inexistente | POST | `/emprestimos` | 404 | 404 | ✅ Passou |
| 30 | Empréstimos | Empréstimo sem informar livro/usuário | POST | `/emprestimos` | 400 | 400 | ✅ Passou |
| 31 | Empréstimos | Empréstimo com data prevista em formato inválido | POST | `/emprestimos` | 400 | 400 | ✅ Passou |
| 32 | Empréstimos | Empréstimo com data prevista no passado | POST | `/emprestimos` | 400 | 400 | ✅ Passou |
| 33 | Empréstimos | Listagem de empréstimos | GET | `/emprestimos` | 200 | 200 | ✅ Passou |
| 34 | Empréstimos | Filtro por status "atrasado" (dados de teste do banco.sql) | GET | `/emprestimos?status=atrasado` | 200 | 200 | ✅ Passou |
| 35 | Empréstimos | Filtro com status inválido | GET | `/emprestimos?status=perdido` | 400 | 400 | ✅ Passou |
| 36 | Empréstimos | Consulta de empréstimo por id | GET | `/emprestimos/5` | 200 | 200 | ✅ Passou |
| 37 | Empréstimos | Consulta de empréstimo inexistente | GET | `/emprestimos/999999` | 404 | 404 | ✅ Passou |
| 38 | Empréstimos | Renovação (nova data prevista) | PUT | `/emprestimos/5` | 200 | 200 | ✅ Passou |
| 39 | Empréstimos | Atualização sem dados válidos | PUT | `/emprestimos/5` | 400 | 400 | ✅ Passou |
| 40 | Empréstimos | Devolução do livro | PUT | `/emprestimos/5` | 200 | 200 | ✅ Passou |
| 41 | Empréstimos | Devolução repetida (já devolvido) | PUT | `/emprestimos/5` | 409 | 409 | ✅ Passou |
| 42 | Empréstimos | Atualização de empréstimo inexistente | PUT | `/emprestimos/999999` | 404 | 404 | ✅ Passou |
| 43 | Exclusões | Excluir livro que possui empréstimos | DELETE | `/livros/12` | 409 | 409 | ✅ Passou |
| 44 | Exclusões | Excluir usuário que possui empréstimos | DELETE | `/usuarios/6` | 409 | 409 | ✅ Passou |
| 45 | Exclusões | Excluir livro sem empréstimos | DELETE | `/livros/11` | 200 | 200 | ✅ Passou |
| 46 | Exclusões | Excluir usuário sem empréstimos | DELETE | `/usuarios/8` | 200 | 200 | ✅ Passou |
| 47 | Exclusões | Excluir livro inexistente | DELETE | `/livros/999999` | 404 | 404 | ✅ Passou |
| 48 | Exclusões | Excluir usuário inexistente | DELETE | `/usuarios/999999` | 404 | 404 | ✅ Passou |
| 49 | Erros gerais | Rota inexistente | GET | `/rota-que-nao-existe` | 404 | 404 | ✅ Passou |
| 50 | Erros gerais | JSON malformado no corpo | POST | `/livros` | 400 | 400 | ✅ Passou |

## Detalhes

### Livros

**#1 – Cadastro de livro válido** ✅

- Requisição: `POST /livros`
- Dados enviados: `{"titulo":"Teste de API","autor":"Autor Teste","isbn":"9789601490000","ano_publicacao":2024,"categoria":"Tecnologia","quantidade":5}`
- Código HTTP: 201 (esperado 201)
- Resposta: `{"id":12,"titulo":"Teste de API","autor":"Autor Teste","isbn":"9789601490000","ano_publicacao":2024,"categoria":"Tecnologia","quantidade":5}`
- Verificação no banco: livro 12 inserido na tabela livros (quantidade = 5)

**#2 – Cadastro sem título (campo obrigatório)** ✅

- Requisição: `POST /livros`
- Dados enviados: `{"autor":"Fulano","isbn":"9781234567897"}`
- Código HTTP: 400 (esperado 400)
- Resposta: `{"erro":"titulo é obrigatório."}`

**#3 – Cadastro com ISBN duplicado** ✅

- Requisição: `POST /livros`
- Dados enviados: `{"titulo":"Outro","autor":"Outro","isbn":"9789601490000"}`
- Código HTTP: 409 (esperado 409)
- Resposta: `{"erro":"Já existe um registro com este valor (isbn)."}`

**#4 – Cadastro com ano de publicação inválido** ✅

- Requisição: `POST /livros`
- Dados enviados: `{"titulo":"Livro","autor":"Autor","isbn":"9781234567897","ano_publicacao":"abc"}`
- Código HTTP: 400 (esperado 400)
- Resposta: `{"erro":"ano_publicacao deve ser um ano entre 1000 e 2100."}`

**#5 – Listagem de livros** ✅

- Requisição: `GET /livros`
- Código HTTP: 200 (esperado 200)
- Resposta: `[{"id":1,"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"9788535914849","ano_publicacao":1899,"categoria":"Romance","quantidade":2},{"id":2,"titulo":"O Cortiço","autor":"Aluísio Azevedo","isbn":"9788508040308","ano_publicacao":1890,"categoria":"Romance","quantidade":2},{"id":3,"titulo":"V… (resposta truncada)`
- Verificação no banco: a API retornou 12 livros = 12 registros na tabela

**#6 – Consulta de livro por id** ✅

- Requisição: `GET /livros/12`
- Código HTTP: 200 (esperado 200)
- Resposta: `{"id":12,"titulo":"Teste de API","autor":"Autor Teste","isbn":"9789601490000","ano_publicacao":2024,"categoria":"Tecnologia","quantidade":5}`
- Verificação no banco: dados conferem com o registro criado

**#7 – Consulta de livro inexistente** ✅

- Requisição: `GET /livros/999999`
- Código HTTP: 404 (esperado 404)
- Resposta: `{"erro":"Livro não encontrado."}`

**#8 – Consulta com id inválido** ✅

- Requisição: `GET /livros/abc`
- Código HTTP: 400 (esperado 400)
- Resposta: `{"erro":"O id informado é inválido."}`

**#9 – Pesquisa por título (parcial)** ✅

- Requisição: `GET /livros/busca/casmurro`
- Código HTTP: 200 (esperado 200)
- Resposta: `[{"id":1,"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"9788535914849","ano_publicacao":1899,"categoria":"Romance","quantidade":2}]`
- Verificação no banco: encontrou "Dom Casmurro"

**#10 – Pesquisa sem resultados** ✅

- Requisição: `GET /livros/busca/xyzxyzxyz`
- Código HTTP: 200 (esperado 200)
- Resposta: `[]`
- Verificação no banco: lista vazia

**#11 – Ordenação por ano (decrescente)** ✅

- Requisição: `GET /livros/ordenados?campo=ano_publicacao&ordem=desc`
- Código HTTP: 200 (esperado 200)
- Resposta: `[{"id":12,"titulo":"Teste de API","autor":"Autor Teste","isbn":"9789601490000","ano_publicacao":2024,"categoria":"Tecnologia","quantidade":5},{"id":10,"titulo":"Introdução à Programação com Node.js","autor":"Ana Souza","isbn":"9788575228005","ano_publicacao":2021,"categoria":"Tecnologia","quantidade… (resposta truncada)`
- Verificação no banco: anos em ordem decrescente

**#12 – Ordenação por título (padrão crescente)** ✅

- Requisição: `GET /livros/ordenados`
- Código HTTP: 200 (esperado 200)
- Resposta: `[{"id":9,"titulo":"A Hora da Estrela","autor":"Clarice Lispector","isbn":"9788532511010","ano_publicacao":1977,"categoria":"Romance","quantidade":1},{"id":6,"titulo":"Algoritmos: Teoria e Prática","autor":"Thomas H. Cormen","isbn":"9788535236996","ano_publicacao":2012,"categoria":"Tecnologia","quant… (resposta truncada)`

**#13 – Ordenação por campo inválido** ✅

- Requisição: `GET /livros/ordenados?campo=senha`
- Código HTTP: 400 (esperado 400)
- Resposta: `{"erro":"campo inválido. Use um destes: id, titulo, autor, isbn, ano_publicacao, categoria, quantidade."}`

**#14 – Edição de livro** ✅

- Requisição: `PUT /livros/12`
- Dados enviados: `{"titulo":"Teste de API (editado)","autor":"Autor Teste","isbn":"9789601490000","ano_publicacao":2025,"categoria":"Tecnologia","quantidade":5}`
- Código HTTP: 200 (esperado 200)
- Resposta: `{"id":12,"titulo":"Teste de API (editado)","autor":"Autor Teste","isbn":"9789601490000","ano_publicacao":2025,"categoria":"Tecnologia","quantidade":5}`
- Verificação no banco: título e ano alterados na tabela

**#15 – Edição de livro inexistente** ✅

- Requisição: `PUT /livros/999999`
- Dados enviados: `{"titulo":"X","autor":"Y","isbn":"9781234567897"}`
- Código HTTP: 404 (esperado 404)
- Resposta: `{"erro":"Livro não encontrado."}`

### Usuários

**#16 – Cadastro de usuário válido** ✅

- Requisição: `POST /usuarios`
- Dados enviados: `{"nome":"Usuário de Teste","cpf":"93541134780","email":"teste960149@email.com","telefone":"(47) 99999-0000"}`
- Código HTTP: 201 (esperado 201)
- Resposta: `{"id":6,"nome":"Usuário de Teste","cpf":"93541134780","email":"teste960149@email.com","telefone":"47999990000"}`
- Verificação no banco: usuário 6 inserido (CPF e telefone salvos só com dígitos)

**#17 – Cadastro com CPF inválido** ✅

- Requisição: `POST /usuarios`
- Dados enviados: `{"nome":"Fulano","cpf":"11111111111","email":"fulano@email.com"}`
- Código HTTP: 400 (esperado 400)
- Resposta: `{"erro":"cpf inválido."}`

**#18 – Cadastro com CPF duplicado** ✅

- Requisição: `POST /usuarios`
- Dados enviados: `{"nome":"Fulano","cpf":"529.982.247-25","email":"outro@email.com"}`
- Código HTTP: 409 (esperado 409)
- Resposta: `{"erro":"Já existe um registro com este valor (cpf)."}`

**#19 – Cadastro com e-mail inválido** ✅

- Requisição: `POST /usuarios`
- Dados enviados: `{"nome":"Fulano","cpf":"22233344405","email":"email-invalido"}`
- Código HTTP: 400 (esperado 400)
- Resposta: `{"erro":"email inválido."}`

**#20 – Usuário extra para teste de exclusão** ✅

- Requisição: `POST /usuarios`
- Dados enviados: `{"nome":"Usuário Descartável","cpf":"11122233396","email":"descartavel960149@email.com"}`
- Código HTTP: 201 (esperado 201)
- Resposta: `{"id":8,"nome":"Usuário Descartável","cpf":"11122233396","email":"descartavel960149@email.com","telefone":null}`
- Verificação no banco: usuário 8 criado

**#21 – Listagem de usuários** ✅

- Requisição: `GET /usuarios`
- Código HTTP: 200 (esperado 200)
- Resposta: `[{"id":1,"nome":"Maria Silva","cpf":"52998224725","email":"maria.silva@email.com","telefone":"47991110001"},{"id":2,"nome":"João Pereira","cpf":"11144477735","email":"joao.pereira@email.com","telefone":"47991110002"},{"id":3,"nome":"Ana Costa","cpf":"12345678909","email":"ana.costa@email.com","telef… (resposta truncada)`
- Verificação no banco: a API retornou 7 usuários = 7 registros

**#22 – Consulta de usuário por id** ✅

- Requisição: `GET /usuarios/6`
- Código HTTP: 200 (esperado 200)
- Resposta: `{"id":6,"nome":"Usuário de Teste","cpf":"93541134780","email":"teste960149@email.com","telefone":"47999990000"}`

**#23 – Consulta de usuário inexistente** ✅

- Requisição: `GET /usuarios/999999`
- Código HTTP: 404 (esperado 404)
- Resposta: `{"erro":"Usuário não encontrado."}`

**#24 – Edição de usuário** ✅

- Requisição: `PUT /usuarios/6`
- Dados enviados: `{"nome":"Usuário de Teste (editado)","cpf":"93541134780","email":"teste960149@email.com","telefone":"4733334444"}`
- Código HTTP: 200 (esperado 200)
- Resposta: `{"id":6,"nome":"Usuário de Teste (editado)","cpf":"93541134780","email":"teste960149@email.com","telefone":"4733334444"}`
- Verificação no banco: nome e telefone alterados na tabela

**#25 – Edição com e-mail de outro usuário** ✅

- Requisição: `PUT /usuarios/6`
- Dados enviados: `{"nome":"Usuário de Teste","cpf":"93541134780","email":"maria.silva@email.com"}`
- Código HTTP: 409 (esperado 409)
- Resposta: `{"erro":"Já existe um registro com este valor (email)."}`

### Empréstimos

**#26 – Registro de empréstimo (prazo padrão de 14 dias)** ✅

- Requisição: `POST /emprestimos`
- Dados enviados: `{"livro_id":12,"usuario_id":6}`
- Código HTTP: 201 (esperado 201)
- Resposta: `{"id":5,"livro_id":12,"livro_titulo":"Teste de API (editado)","usuario_id":6,"usuario_nome":"Usuário de Teste (editado)","data_emprestimo":"2026-09-24","data_prevista_devolucao":"2026-10-08","data_devolucao":null,"status":"ativo"}`
- Verificação no banco: empréstimo 5 gravado (ativo, 14 dias) e estoque do livro caiu de 5 para 4

**#27 – Empréstimo de livro sem exemplares disponíveis** ✅

- Requisição: `POST /emprestimos`
- Dados enviados: `{"livro_id":11,"usuario_id":6}`
- Código HTTP: 409 (esperado 409)
- Resposta: `{"erro":"Não há exemplares disponíveis deste livro."}`
- Verificação no banco: nenhum empréstimo foi gravado

**#28 – Empréstimo com livro inexistente** ✅

- Requisição: `POST /emprestimos`
- Dados enviados: `{"livro_id":999999,"usuario_id":6}`
- Código HTTP: 404 (esperado 404)
- Resposta: `{"erro":"Livro não encontrado."}`

**#29 – Empréstimo com usuário inexistente** ✅

- Requisição: `POST /emprestimos`
- Dados enviados: `{"livro_id":12,"usuario_id":999999}`
- Código HTTP: 404 (esperado 404)
- Resposta: `{"erro":"Usuário não encontrado."}`

**#30 – Empréstimo sem informar livro/usuário** ✅

- Requisição: `POST /emprestimos`
- Dados enviados: `{}`
- Código HTTP: 400 (esperado 400)
- Resposta: `{"erro":"O id informado é inválido."}`

**#31 – Empréstimo com data prevista em formato inválido** ✅

- Requisição: `POST /emprestimos`
- Dados enviados: `{"livro_id":12,"usuario_id":6,"data_prevista_devolucao":"31/12/2030"}`
- Código HTTP: 400 (esperado 400)
- Resposta: `{"erro":"data_prevista_devolucao deve estar no formato AAAA-MM-DD."}`

**#32 – Empréstimo com data prevista no passado** ✅

- Requisição: `POST /emprestimos`
- Dados enviados: `{"livro_id":12,"usuario_id":6,"data_prevista_devolucao":"2020-01-01"}`
- Código HTTP: 400 (esperado 400)
- Resposta: `{"erro":"data_prevista_devolucao não pode ser anterior à data do empréstimo."}`

**#33 – Listagem de empréstimos** ✅

- Requisição: `GET /emprestimos`
- Código HTTP: 200 (esperado 200)
- Resposta: `[{"id":1,"livro_id":1,"livro_titulo":"Dom Casmurro","usuario_id":1,"usuario_nome":"Maria Silva","data_emprestimo":"2026-09-19","data_prevista_devolucao":"2026-10-03","data_devolucao":null,"status":"ativo"},{"id":2,"livro_id":2,"livro_titulo":"O Cortiço","usuario_id":2,"usuario_nome":"João Pereira","… (resposta truncada)`
- Verificação no banco: a API retornou 5 empréstimos = 5 registros

**#34 – Filtro por status "atrasado" (dados de teste do banco.sql)** ✅

- Requisição: `GET /emprestimos?status=atrasado`
- Código HTTP: 200 (esperado 200)
- Resposta: `[{"id":2,"livro_id":2,"livro_titulo":"O Cortiço","usuario_id":2,"usuario_nome":"João Pereira","data_emprestimo":"2026-08-25","data_prevista_devolucao":"2026-09-08","data_devolucao":null,"status":"atrasado"}]`
- Verificação no banco: 1 empréstimo(s) atrasado(s) identificado(s)

**#35 – Filtro com status inválido** ✅

- Requisição: `GET /emprestimos?status=perdido`
- Código HTTP: 400 (esperado 400)
- Resposta: `{"erro":"status inválido. Use 'ativo', 'devolvido' ou 'atrasado'."}`

**#36 – Consulta de empréstimo por id** ✅

- Requisição: `GET /emprestimos/5`
- Código HTTP: 200 (esperado 200)
- Resposta: `{"id":5,"livro_id":12,"livro_titulo":"Teste de API (editado)","usuario_id":6,"usuario_nome":"Usuário de Teste (editado)","data_emprestimo":"2026-09-24","data_prevista_devolucao":"2026-10-08","data_devolucao":null,"status":"ativo"}`
- Verificação no banco: resposta inclui título do livro e nome do usuário

**#37 – Consulta de empréstimo inexistente** ✅

- Requisição: `GET /emprestimos/999999`
- Código HTTP: 404 (esperado 404)
- Resposta: `{"erro":"Empréstimo não encontrado."}`

**#38 – Renovação (nova data prevista)** ✅

- Requisição: `PUT /emprestimos/5`
- Dados enviados: `{"data_prevista_devolucao":"2030-12-31"}`
- Código HTTP: 200 (esperado 200)
- Resposta: `{"id":5,"livro_id":12,"livro_titulo":"Teste de API (editado)","usuario_id":6,"usuario_nome":"Usuário de Teste (editado)","data_emprestimo":"2026-09-24","data_prevista_devolucao":"2030-12-31","data_devolucao":null,"status":"ativo"}`
- Verificação no banco: data prevista alterada para 2030-12-31

**#39 – Atualização sem dados válidos** ✅

- Requisição: `PUT /emprestimos/5`
- Dados enviados: `{}`
- Código HTTP: 400 (esperado 400)
- Resposta: `{"erro":"Informe 'status': 'devolvido' (devolução) ou 'data_prevista_devolucao' (renovação)."}`

**#40 – Devolução do livro** ✅

- Requisição: `PUT /emprestimos/5`
- Dados enviados: `{"status":"devolvido"}`
- Código HTTP: 200 (esperado 200)
- Resposta: `{"id":5,"livro_id":12,"livro_titulo":"Teste de API (editado)","usuario_id":6,"usuario_nome":"Usuário de Teste (editado)","data_emprestimo":"2026-09-24","data_prevista_devolucao":"2030-12-31","data_devolucao":"2026-09-24","status":"devolvido"}`
- Verificação no banco: status = devolvido, data_devolucao preenchida e estoque voltou para 5

**#41 – Devolução repetida (já devolvido)** ✅

- Requisição: `PUT /emprestimos/5`
- Dados enviados: `{"status":"devolvido"}`
- Código HTTP: 409 (esperado 409)
- Resposta: `{"erro":"Este empréstimo já foi devolvido e não pode ser alterado."}`
- Verificação no banco: estoque continua 5 (não foi somado de novo)

**#42 – Atualização de empréstimo inexistente** ✅

- Requisição: `PUT /emprestimos/999999`
- Dados enviados: `{"status":"devolvido"}`
- Código HTTP: 404 (esperado 404)
- Resposta: `{"erro":"Empréstimo não encontrado."}`

### Exclusões

**#43 – Excluir livro que possui empréstimos** ✅

- Requisição: `DELETE /livros/12`
- Código HTTP: 409 (esperado 409)
- Resposta: `{"erro":"Não é possível excluir: existem empréstimos vinculados a este registro."}`
- Verificação no banco: livro continua na tabela

**#44 – Excluir usuário que possui empréstimos** ✅

- Requisição: `DELETE /usuarios/6`
- Código HTTP: 409 (esperado 409)
- Resposta: `{"erro":"Não é possível excluir: existem empréstimos vinculados a este registro."}`
- Verificação no banco: usuário continua na tabela

**#45 – Excluir livro sem empréstimos** ✅

- Requisição: `DELETE /livros/11`
- Código HTTP: 200 (esperado 200)
- Resposta: `{"mensagem":"Livro excluído com sucesso."}`
- Verificação no banco: registro removido da tabela livros

**#46 – Excluir usuário sem empréstimos** ✅

- Requisição: `DELETE /usuarios/8`
- Código HTTP: 200 (esperado 200)
- Resposta: `{"mensagem":"Usuário excluído com sucesso."}`
- Verificação no banco: registro removido da tabela usuarios

**#47 – Excluir livro inexistente** ✅

- Requisição: `DELETE /livros/999999`
- Código HTTP: 404 (esperado 404)
- Resposta: `{"erro":"Livro não encontrado."}`

**#48 – Excluir usuário inexistente** ✅

- Requisição: `DELETE /usuarios/999999`
- Código HTTP: 404 (esperado 404)
- Resposta: `{"erro":"Usuário não encontrado."}`

### Erros gerais

**#49 – Rota inexistente** ✅

- Requisição: `GET /rota-que-nao-existe`
- Código HTTP: 404 (esperado 404)
- Resposta: `{"erro":"Rota não encontrada: GET /rota-que-nao-existe"}`

**#50 – JSON malformado no corpo** ✅

- Requisição: `POST /livros`
- Dados enviados: `{"titulo": "abc",`
- Código HTTP: 400 (esperado 400)
- Resposta: `{"erro":"Expected double-quoted property name in JSON at position 17 (line 1 column 18)"}`
