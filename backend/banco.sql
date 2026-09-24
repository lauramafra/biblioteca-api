-- =====================================================================
--  Sistema de Biblioteca - Script de criação do banco de dados (MySQL)
--  Execução:  mysql -u root -p < banco.sql
-- =====================================================================

-- Garante que os acentos sejam lidos corretamente
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS biblioteca
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE biblioteca;

-- Remove as tabelas (filhas primeiro) para permitir reexecutar o script
DROP TABLE IF EXISTS emprestimos;
DROP TABLE IF EXISTS livros;
DROP TABLE IF EXISTS usuarios;

-- ---------------------------------------------------------------------
--  Tabela: livros
--  quantidade = exemplares DISPONÍVEIS (diminui no empréstimo,
--  aumenta na devolução)
-- ---------------------------------------------------------------------
CREATE TABLE livros (
  id              INT          NOT NULL AUTO_INCREMENT,
  titulo          VARCHAR(150) NOT NULL,
  autor           VARCHAR(100) NOT NULL,
  isbn            VARCHAR(13)  NOT NULL,
  ano_publicacao  SMALLINT     NULL,
  categoria       VARCHAR(60)  NULL,
  quantidade      INT          NOT NULL DEFAULT 1,
  CONSTRAINT pk_livros PRIMARY KEY (id),
  CONSTRAINT uq_livros_isbn UNIQUE (isbn),
  CONSTRAINT ck_livros_quantidade CHECK (quantidade >= 0),
  CONSTRAINT ck_livros_ano CHECK (ano_publicacao IS NULL OR ano_publicacao BETWEEN 1000 AND 2100)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Tabela: usuarios
--  cpf armazenado somente com dígitos (11 caracteres)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id        INT          NOT NULL AUTO_INCREMENT,
  nome      VARCHAR(100) NOT NULL,
  cpf       CHAR(11)     NOT NULL,
  email     VARCHAR(100) NOT NULL,
  telefone  VARCHAR(15)  NULL,
  CONSTRAINT pk_usuarios PRIMARY KEY (id),
  CONSTRAINT uq_usuarios_cpf UNIQUE (cpf),
  CONSTRAINT uq_usuarios_email UNIQUE (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Tabela: emprestimos (associativa entre livros e usuarios)
--  O status "atrasado" é calculado nas consultas da API
--  (status = 'ativo' e data_prevista_devolucao < data atual).
-- ---------------------------------------------------------------------
CREATE TABLE emprestimos (
  id                       INT  NOT NULL AUTO_INCREMENT,
  livro_id                 INT  NOT NULL,
  usuario_id               INT  NOT NULL,
  data_emprestimo          DATE NOT NULL,
  data_prevista_devolucao  DATE NOT NULL,
  data_devolucao           DATE NULL,
  status                   ENUM('ativo','devolvido') NOT NULL DEFAULT 'ativo',
  CONSTRAINT pk_emprestimos PRIMARY KEY (id),
  CONSTRAINT fk_emprestimos_livro FOREIGN KEY (livro_id)
    REFERENCES livros (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_emprestimos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_emprestimos_prevista CHECK (data_prevista_devolucao >= data_emprestimo),
  CONSTRAINT ck_emprestimos_devolucao CHECK (data_devolucao IS NULL OR data_devolucao >= data_emprestimo),
  CONSTRAINT ck_emprestimos_status CHECK (
    (status = 'ativo' AND data_devolucao IS NULL) OR
    (status = 'devolvido' AND data_devolucao IS NOT NULL)
  )
) ENGINE=InnoDB;

CREATE INDEX idx_emprestimos_livro   ON emprestimos (livro_id);
CREATE INDEX idx_emprestimos_usuario ON emprestimos (usuario_id);
CREATE INDEX idx_livros_titulo       ON livros (titulo);

-- =====================================================================
--  Dados para teste
-- =====================================================================

-- quantidade = exemplares disponíveis já descontando os empréstimos ativos abaixo
INSERT INTO livros (titulo, autor, isbn, ano_publicacao, categoria, quantidade) VALUES
  ('Dom Casmurro',                       'Machado de Assis',       '9788535914849', 1899, 'Romance',    2),
  ('O Cortiço',                          'Aluísio Azevedo',        '9788508040308', 1890, 'Romance',    2),
  ('Vidas Secas',                        'Graciliano Ramos',       '9788501112989', 1938, 'Romance',    2),
  ('Memórias Póstumas de Brás Cubas',    'Machado de Assis',       '9788535910663', 1881, 'Romance',    3),
  ('Código Limpo',                       'Robert C. Martin',       '9788576082675', 2009, 'Tecnologia', 4),
  ('Algoritmos: Teoria e Prática',       'Thomas H. Cormen',       '9788535236996', 2012, 'Tecnologia', 2),
  ('Sapiens: Uma Breve História',        'Yuval Noah Harari',      '9788525432186', 2015, 'História',   3),
  ('O Pequeno Príncipe',                 'Antoine de Saint-Exupéry','9788595081512', 1943, 'Infantil',   5),
  ('A Hora da Estrela',                  'Clarice Lispector',      '9788532511010', 1977, 'Romance',    1),
  ('Introdução à Programação com Node.js','Ana Souza',             '9788575228005', 2021, 'Tecnologia', 3);

INSERT INTO usuarios (nome, cpf, email, telefone) VALUES
  ('Maria Silva',      '52998224725', 'maria.silva@email.com',     '47991110001'),
  ('João Pereira',     '11144477735', 'joao.pereira@email.com',    '47991110002'),
  ('Ana Costa',        '12345678909', 'ana.costa@email.com',       '47991110003'),
  ('Carlos Oliveira',  '39053344705', 'carlos.oliveira@email.com', '47991110004'),
  ('Fernanda Lima',    '16899535009', 'fernanda.lima@email.com',   NULL);

-- 2 empréstimos ativos do livro 1, 1 ativo (e atrasado) do livro 2 e 1 já devolvido do livro 3
INSERT INTO emprestimos (livro_id, usuario_id, data_emprestimo, data_prevista_devolucao, data_devolucao, status) VALUES
  (1, 1, DATE_SUB(CURDATE(), INTERVAL 5 DAY),  DATE_ADD(CURDATE(), INTERVAL 9 DAY),  NULL, 'ativo'),
  (2, 2, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 16 DAY), NULL, 'ativo'),
  (3, 3, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY),  DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'devolvido'),
  (1, 4, DATE_SUB(CURDATE(), INTERVAL 2 DAY),  DATE_ADD(CURDATE(), INTERVAL 12 DAY), NULL, 'ativo');
