                Projeto de Software  Sistema de Controle de Entrada de Documentos (SCED)
Nome : Luiz Ricardo Gonzaga Araujo  
Nome : João Nilton Ramos Filho
Nome : Matheus Gangini 
Nome : Adler Koneski
Nome : Guilherme 
Nome : Kaio Terra
Nome : Isaque Bersalim

# 📌 Sistema de Controle de Entrada de Documentos

## 📖 Descrição

Sistema web desenvolvido para gerenciar a entrada de documentos em uma instituição pública, substituindo o controle manual por planilhas.

## 🎯 Objetivo

Garantir rastreabilidade, organização e consulta eficiente dos documentos recebidos.

## ⚙️ Funcionalidades

* Cadastro de usuários (Admin e Operador)
* Login com autenticação
* Cadastro de tipos de documentos
* Registro de entrada de documentos
* Consulta com filtros
* Alteração de status
* Histórico de movimentação
* Relatórios

## 🛠️ Tecnologias

* Node.js
* Express
* MySQL
* HTML, CSS, JavaScript

## ▶️ Como rodar o projeto

### Backend

```bash
cd backend
npm install
# Configure o banco de dados MySQL e execute o schema.sql
npm start
```

### Frontend

```bash
cd frontend
# Abra o index.html no navegador ou use um servidor local
```

## 🧪 Testes

```bash
cd backend
npm test
```

## 📚 Documentação

* [Planejamento](docs/planejamento.md)
* [API Documentation](docs/api.md) (em desenvolvimento)

## 🔧 Tecnologias Utilizadas

* **Backend**: Node.js, Express.js, MySQL, JWT, bcrypt
* **Frontend**: HTML5, CSS3, JavaScript (ES6+)
* **Banco de Dados**: MySQL
* **Testes**: Jest, Supertest
* **Linting**: ESLint

## 📋 Pré-requisitos

* Node.js (v14+)
* MySQL Server
* Navegador web moderno

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
cd frontend
npm install
npm start
```

## 🗄️ Banco de Dados

O script está em:

```
/database/script.sql
```

## 📌 Requisitos Não Funcionais

* Responsivo
* Controle de acesso
* Logs
* Versionamento no GitHub

## 👥 Equipe

Luiz Ricardo - Product Owner
João Nilton - Scrum Master
Adler koneski- Desenvolvedor
Isaque  - Responsável por QA/Testes
Matheus Boleta - Responsável por Documentação
Kaio - Desenvolvedor
Guilherme - Desenvolver 
