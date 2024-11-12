CREATE DATABASE IF NOT EXISTS siteWeb
DEFAULT CHARSET utf8 COLLATE utf8_general_ci;

USE siteWeb;

-- A tabela “tecnicoResponsavel” mantém detalhes sobre cada técnico, como nome. 
CREATE TABLE IF NOT EXISTS tecnicoResponsavel (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL
) DEFAULT CHARSET = utf8;

-- Inserções na tabela tecnicoResponsavel
INSERT INTO tecnicoResponsavel (nome)
VALUES
('Rafael'),
('Paulina'),
('Isack'),
('Danyel');

-- A tabela “abrirChamado” armazena informações sobre os chamados de suporte abertos, incluindo o usuário que abriu o chamado, a data, o equipamento envolvido, o setor do equipamento, o status da resolução, e qual técnico está responsável pelo chamado.
CREATE TABLE IF NOT EXISTS abrirChamado (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomeUsuario VARCHAR(100),
    datas DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    descricao VARCHAR(300) NOT NULL,
    setor ENUM('Secretaria','Sala 2','Pátio','Sala 5') NOT NULL,
    tiposDoChamado ENUM('Substituição','Formatação','Manutenção','Outros') NOT NULL,
    nivelDeUrgencia ENUM('Crítico','Alto','Médio','Baixo') NOT NULL,
    nomeEquipamento ENUM('Computador','Mouse','Teclado','Alto-falante','Estabilizador') NOT NULL,
    resolucao VARCHAR(50) DEFAULT 'Em andamento',
    FK_tecnicoResponsavelPeloChamado INT,
    FOREIGN KEY (FK_tecnicoResponsavelPeloChamado) REFERENCES tecnicoResponsavel(id)
) DEFAULT CHARSET = utf8;

-- Inserções na tabela abrirChamado
INSERT INTO abrirChamado (nomeUsuario, datas, email, descricao, setor, tiposDoChamado, nivelDeUrgencia, nomeEquipamento, FK_tecnicoResponsavelPeloChamado)
VALUES
('João Silva', '2024-06-16', 'joao@example.com', 'Computador lento', 'Secretaria', 'Manutenção', 'Médio', 'Computador', 1),
('Maria Santos', '2024-06-17', 'maria@example.com', 'Problemas com mouse', 'Sala 2', 'Manutenção', 'Baixo', 'Mouse', 2),
('Carlos Oliveira', '2024-06-18', 'carlos@example.com', 'Problemas de rede', 'Pátio', 'Manutenção', 'Alto', 'Estabilizador', 3),
('Ana Souza', '2024-06-19', 'ana@example.com', 'Formatação necessária', 'Sala 5', 'Formatação', 'Médio', 'Computador', 4),
('Pedro Lima', '2024-06-20', 'pedro@example.com', 'Problemas com teclado', 'Secretaria', 'Manutenção', 'Baixo', 'Teclado', 1),
('Mariana Santos', '2024-06-21', 'mariana@example.com', 'Alto-falante com ruídos', 'Sala 2', 'Manutenção', 'Alto', 'Alto-falante', 2),
('Paulo Oliveira', '2024-06-22', 'paulo@example.com', 'Computador travando', 'Pátio', 'Substituição', 'Crítico', 'Computador', 3),
('Beatriz Silva', '2024-06-23', 'beatriz@example.com', 'Problemas com mouse', 'Secretaria', 'Manutenção', 'Médio', 'Mouse', 4),
('Fernanda Costa', '2024-06-24', 'fernanda@example.com', 'Teclado com teclas falhando', 'Sala 5', 'Manutenção', 'Alto', 'Teclado', 1),
('Lucas Oliveira', '2024-06-25', 'lucas@example.com', 'Problemas de rede', 'Secretaria', 'Outros', 'Médio', 'Computador', 2),
('Camila Martins', '2024-06-26', 'camila@example.com', 'Alto-falante sem som', 'Pátio', 'Manutenção', 'Baixo', 'Alto-falante', 3),
('Gustavo Santos', '2024-06-27', 'gustavo@example.com', 'Estabilizador com curto-circuito', 'Sala 2', 'Manutenção', 'Alto', 'Estabilizador', 4),
('Renata Lima', '2024-06-28', 'renata@example.com', 'Computador lento', 'Secretaria', 'Formatação', 'Médio', 'Computador', 1),
('Thiago Silva', '2024-06-29', 'thiago@example.com', 'Problemas de acesso à rede', 'Sala 5', 'Manutenção', 'Alto', 'Estabilizador', 2),
('Juliana Costa', '2024-06-30', 'juliana@example.com', 'Problemas com mouse', 'Secretaria', 'Manutenção', 'Baixo', 'Mouse', 3);

-- Inserção sem resolução padrão
INSERT INTO abrirChamado (nomeUsuario, datas, email, descricao, setor, tiposDoChamado, nivelDeUrgencia, nomeEquipamento, resolucao, FK_tecnicoResponsavelPeloChamado)
VALUES ('José Oliveira', '2024-06-16', 'jose@example.com', 'Computador não liga', 'Secretaria', 'Substituição', 'Crítico', 'Computador', 'Não Concluído', 1),
('Maria da Silva', '2024-06-17', 'maria@example.com', 'Problemas com teclado', 'Sala 2', 'Manutenção', 'Médio', 'Teclado', 'Concluído', 2),
('Carlos Ferreira', '2024-06-18', 'carlos@example.com', 'Problemas de rede', 'Pátio', 'Manutenção', 'Alto', 'Estabilizador', 'Não Concluído', 3),
('Ana Paula', '2024-06-19', 'ana@example.com', 'Computador lento', 'Sala 5', 'Manutenção', 'Baixo', 'Computador', 'Concluído', 4),
('Mariana Santos', '2024-06-20', 'mariana@example.com', 'Alto-falante com ruídos', 'Secretaria', 'Manutenção', 'Médio', 'Alto-falante', 'Concluído', 1);

-- Tabela de usuários mantém o nome, email e senha do usuário
CREATE TABLE IF NOT EXISTS usuario(
	id INT PRIMARY KEY AUTO_INCREMENT,
    nomeUsuario VARCHAR(100) not null,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) not null
);

INSERT INTO usuario (nomeUsuario, email, password) 
VALUES('Paulina Vitória', 'paulina.costa.tecnico@gmail.com', '123456789');

SELECT * FROM usuario;

 SELECT abrirChamado.*, tecnicoResponsavel.nome AS nomeTecnicoResponsavel
  FROM abrirChamado
  JOIN tecnicoResponsavel ON abrirChamado.FK_tecnicoResponsavelPeloChamado = tecnicoResponsavel.id
  WHERE 1=1;

-- Selecionar os chamados com os nomes dos técnicos responsáveis:
SELECT ac.id, ac.nomeUsuario, ac.descricao, ac.setor, ac.nivelDeUrgencia, ac.nomeEquipamento, ac.resolucao, tr.nome AS tecnicoResponsavel
FROM abrirChamado ac
INNER JOIN tecnicoResponsavel tr ON ac.FK_tecnicoResponsavelPeloChamado = tr.id;

-- Selecionar os chamados do setor "Secretaria" com nível de urgência "Médio" e resolução seja "Concluído":
SELECT ac.id, ac.nomeUsuario, ac.descricao, ac.nivelDeUrgencia, ac.nomeEquipamento, ac.resolucao
FROM abrirChamado ac
INNER JOIN tecnicoResponsavel tr ON ac.FK_tecnicoResponsavelPeloChamado = tr.id
WHERE ac.setor = 'Secretaria'
AND ac.nivelDeUrgencia = 'Médio'
AND ac.resolucao = 'Concluído';

-- Contar quantos chamados estão em andamento (resolucao = 'Não Concluído'):
SELECT COUNT(*) AS chamados_não_concluídos FROM abrirChamado WHERE resolucao = 'Não Concluído';

# ========================================================= COM JOIN===================================================

-- Selecionar todos os chamados com os nomes dos técnicos responsáveis:
SELECT ac.id, ac.nomeUsuario, ac.descricao, ac.setor, ac.nivelDeUrgencia, ac.nomeEquipamento, tr.nome AS tecnicoResponsavel
FROM abrirChamado ac
INNER JOIN tecnicoResponsavel tr ON ac.FK_tecnicoResponsavelPeloChamado = tr.id;

-- Selecionar os chamados com nível de urgência "Alto" e os respectivos técnicos responsáveis:
SELECT ac.id, ac.nomeUsuario, ac.descricao, ac.setor, ac.nivelDeUrgencia, ac.nomeEquipamento, tr.nome AS tecnicoResponsavel
FROM abrirChamado ac
INNER JOIN tecnicoResponsavel tr ON ac.FK_tecnicoResponsavelPeloChamado = tr.id
WHERE ac.nivelDeUrgencia = 'Alto';

-- Contar quantos chamados foram atribuídos a cada técnico:
SELECT tr.nome AS tecnicoResponsavel, COUNT(ac.id) AS totalChamados
FROM tecnicoResponsavel tr
INNER JOIN abrirChamado ac ON tr.id = ac.FK_tecnicoResponsavelPeloChamado
GROUP BY tr.nome;

-- Selecionar os chamados do setor "Secretaria" com suas resoluções:
SELECT ac.id, ac.nomeUsuario, ac.descricao, ac.setor, ac.nivelDeUrgencia, ac.nomeEquipamento, ac.resolucao
FROM abrirChamado ac
WHERE ac.setor = 'Secretaria';

-- Selecionar os chamados que estão "Em andamento" e seus respectivos técnicos responsáveis:
SELECT ac.id, ac.nomeUsuario, ac.descricao, ac.setor, ac.nivelDeUrgencia, ac.nomeEquipamento, tr.nome AS tecnicoResponsavel
FROM abrirChamado ac
INNER JOIN tecnicoResponsavel tr ON ac.FK_tecnicoResponsavelPeloChamado = tr.id
WHERE ac.resolucao = 'Em andamento';

# ========================================================= COM JOIN e outras condições ===================================================

-- Selecionar os chamados atribuídos ao técnico "Rafael" e que estão "Em andamento":
SELECT ac.id, ac.nomeUsuario, ac.descricao, ac.setor, ac.nivelDeUrgencia, ac.nomeEquipamento, ac.resolucao
FROM abrirChamado ac
INNER JOIN tecnicoResponsavel tr ON ac.FK_tecnicoResponsavelPeloChamado = tr.id
WHERE tr.nome = 'Rafael'
AND ac.resolucao = 'Em andamento';

-- Contar quantos chamados foram atribuídos a cada técnico e ordenar pelo número de chamados em ordem decrescente:
SELECT tr.nome AS tecnicoResponsavel, COUNT(ac.id) AS totalChamados
FROM tecnicoResponsavel tr
LEFT JOIN abrirChamado ac ON tr.id = ac.FK_tecnicoResponsavelPeloChamado
GROUP BY tr.nome
ORDER BY totalChamados DESC;

-- Selecionar os chamados do tipo "Substituição" ou "Manutenção" e ordenar por data atual descendentemente:
SELECT ac.nomeUsuario AS Usuário,ac.tiposDoChamado AS Chamados, ac.descricao, ac.setor, ac.nivelDeUrgencia AS Urgência, ac.nomeEquipamento AS Equipamento, ac.resolucao
FROM abrirChamado ac
WHERE ac.tiposDoChamado IN ('Substituição', 'Manutenção')
ORDER BY ac.datas DESC;

-- Selecionar os chamados do setor "Secretaria" com nível de urgência "Alto" e que estão atribuídos ao técnico "Isack":
SELECT ac.id, ac.nomeUsuario, ac.descricao, ac.setor, ac.nivelDeUrgencia, ac.nomeEquipamento, tr.nome AS tecnicoResponsavel
FROM abrirChamado ac
INNER JOIN tecnicoResponsavel tr ON ac.FK_tecnicoResponsavelPeloChamado = tr.id
WHERE ac.setor = 'Secretaria'
AND ac.nivelDeUrgencia = 'Baixo'
AND tr.nome = 'Isack';

-- Selecionar os chamados com descrição que contenha a palavra "problema" e que estão atribuídos a algum técnico:
SELECT ac.nomeUsuario, ac.descricao, ac.setor, ac.nivelDeUrgencia, ac.nomeEquipamento, tr.nome AS tecnicoResponsavel
FROM abrirChamado ac
INNER JOIN tecnicoResponsavel tr ON ac.FK_tecnicoResponsavelPeloChamado = tr.id
WHERE ac.descricao LIKE '%problema%'
AND ac.FK_tecnicoResponsavelPeloChamado IS NOT NULL;

# ========================================================= SEM JOIN===================================================

-- Contar quantos chamados existem por setor:
SELECT setor, COUNT(*) AS totalChamados
FROM abrirChamado
GROUP BY setor;

-- Selecionar os chamados com nível de urgência "Crítico":
SELECT * FROM abrirChamado WHERE nivelDeUrgencia = 'Crítico';

-- Selecionar os chamados abertos do tipo "Manutenção":
SELECT * FROM abrirChamado WHERE tiposDoChamado = 'Manutenção';

-- Selecionar os chamados ordenados por data atual decrescente:
SELECT * FROM abrirChamado ORDER BY datas DESC;

-- Selecionar os chamados com nível de urgência "Alto" e que ainda não foram resolvidos (resolução = 'Em andamento'):
SELECT * FROM abrirChamado WHERE nivelDeUrgencia = 'Alto' AND resolucao = 'Em andamento';

-- Contar quantos chamados estão atribuídos ao setor "Sala 2":
SELECT COUNT(*) AS QTD_Chamados_Sala_2 FROM abrirChamado WHERE setor = 'Sala 2';

-- Selecionar todos os chamados abertos na data atual:
SELECT * FROM abrirChamado WHERE datas = CURDATE();

# ======== UPDATE =========

-- Atualização no campo de resolução na tabela de chamados que tem o email 'joao@example.com' como condição
SELECT * FROM abrirChamado WHERE email = 'joao@example.com';
UPDATE abrirChamado SET resolucao = 'Concluído' WHERE email = 'joao@example.com';

-- Atualização no campo de resolução na tabela de chamados que tem como responsável pelo o chamado o email 'ana@example.com' e pertença a sala 5 
SELECT * FROM abrirChamado WHERE email = 'ana@example.com' AND setor = 'Sala 5';
UPDATE abrirChamado SET resolucao = 'Concluído' WHERE email = 'ana@example.com' AND setor = 'Sala 5';

-- Remoção dos registros que tenha a resolução concluída
SELECT * FROM abrirChamado WHERE resolucao = 'Concluído';
DELETE FROM abrirChamado WHERE resolucao = 'Concluído';