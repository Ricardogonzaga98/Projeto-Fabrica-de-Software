-- =============================================================
-- SCED - Sistema de Controle de Entrada de Documentos
-- Schema MySQL - Versão 1.0
-- =============================================================

CREATE DATABASE IF NOT EXISTS sced_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sced_db;

-- -------------------------------------------------------------
-- T19.1 - Tabela de usuários
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)                  NOT NULL,
  email        VARCHAR(100)                  UNIQUE NOT NULL,
  password     VARCHAR(255)                  NOT NULL,
  role         ENUM('admin', 'operator')     DEFAULT 'operator',
  active       TINYINT(1)                    DEFAULT 1,
  created_at   TIMESTAMP                     DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP                     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- Tabela de tipos de documento
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_types (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  description  TEXT,
  active       TINYINT(1)    DEFAULT 1,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- T22 - Tabela de documentos
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  protocol            VARCHAR(20)                                                   UNIQUE NOT NULL,
  type_id             INT,
  received_date       DATE                                                          NOT NULL,
  sender              VARCHAR(100)                                                  NOT NULL,
  subject             VARCHAR(255)                                                  NOT NULL,
  destination_sector  VARCHAR(100),
  responsible         VARCHAR(100),
  observations        TEXT,
  status              ENUM('recebido','em_analise','encaminhado','finalizado')      DEFAULT 'recebido',
  attachment_path     VARCHAR(255),
  created_by          INT,
  created_at          TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id)    REFERENCES document_types(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)          ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- T23.1 - Tabela de histórico de movimentações
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_history (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  document_id  INT,
  user_id      INT,
  action       VARCHAR(100)  NOT NULL,
  old_status   ENUM('recebido','em_analise','encaminhado','finalizado'),
  new_status   ENUM('recebido','em_analise','encaminhado','finalizado'),
  notes        TEXT,
  created_at   TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE SET NULL
);

-- =============================================================
-- SEED - Dados iniciais
-- =============================================================

-- Usuário administrador padrão
-- Senha: admin123 (hash bcrypt real)
INSERT INTO users (name, email, password, role) VALUES
  ('Administrador', 'admin@sced.com', '$2a$10$cBqJaqsQTpzdoujhT5Nm0esbxLZHnMw71G53953ID.gXTdTRu9oyy', 'admin')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Tipos de documento padrão
INSERT INTO document_types (name, description) VALUES
  ('Ofício',        'Documento oficial externo'),
  ('Memorando',     'Comunicação interna entre setores'),
  ('Processo',      'Documento processual com tramitação'),
  ('Requerimento',  'Solicitação formal de cidadão ou servidor'),
  ('Contrato',      'Instrumento contratual')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- -------------------------------------------------------------
-- Tabela de processos
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS processes (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  protocol            VARCHAR(20)                                                   UNIQUE NOT NULL,
  type_id             INT,
  received_date       DATE                                                          NOT NULL,
  sender              VARCHAR(100)                                                  NOT NULL,
  subject             VARCHAR(255)                                                  NOT NULL,
  destination_sector  VARCHAR(100),
  responsible         VARCHAR(100),
  observations        TEXT,
  status              ENUM('recebido','em_analise','encaminhado','finalizado')      DEFAULT 'recebido',
  created_by          INT,
  created_at          TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id)    REFERENCES document_types(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)          ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- Tabela de histórico de processos
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS process_history (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  process_id   INT           NOT NULL,
  user_id      INT,
  action       VARCHAR(100)  NOT NULL,
  old_status   VARCHAR(50),
  new_status   VARCHAR(50),
  notes        TEXT,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)     ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- Vínculo entre documentos e processos
-- -------------------------------------------------------------
ALTER TABLE documents ADD COLUMN IF NOT EXISTS process_id INT DEFAULT NULL;
ALTER TABLE documents ADD COLUMN process_id INT DEFAULT NULL;
ALTER TABLE documents ADD CONSTRAINT fk_document_process
  FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE SET NULL;