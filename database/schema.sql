-- Sistema de Controle de Entrada de Documentos - Schema MySQL

CREATE DATABASE IF NOT EXISTS sced_db;
USE sced_db;

-- Tabela de usuários
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator') DEFAULT 'operator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de tipos de documento
CREATE TABLE document_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de documentos
CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  protocol VARCHAR(20) UNIQUE NOT NULL,
  type_id INT,
  received_date DATE NOT NULL,
  sender VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  destination_sector VARCHAR(100),
  responsible VARCHAR(100),
  observations TEXT,
  status ENUM('recebido', 'em_analise', 'encaminhado', 'finalizado') DEFAULT 'recebido',
  attachment_path VARCHAR(255),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES document_types(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de histórico de movimentações
CREATE TABLE document_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_id INT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  old_status ENUM('recebido', 'em_analise', 'encaminhado', 'finalizado'),
  new_status ENUM('recebido', 'em_analise', 'encaminhado', 'finalizado'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Inserir dados iniciais
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@sced.com', '$2a$10$example.hash.here', 'admin');

INSERT INTO document_types (name, description) VALUES
('Ofício', 'Documento oficial'),
('Memorando', 'Comunicação interna'),
('Processo', 'Documento processual');