                Projeto de Software  Sistema de Controle de Entrada de Documentos (SCED)
Nome : Luiz Ricardo Gonzaga Araujo  
Nome : Matheus Gangini 
Nome : Adler Koneski
Nome : Guilherme 
Nome : Kaio Terra

# SCED — Sistema de Controle de Entrada de Documentos

Sistema web para controle e rastreamento de documentos oficiais, desenvolvido como projeto da Fábrica de Software.

## 🏗️ Arquitetura
sced/

├── backend/

│   ├── app.js               # Aplicação Express (exportável para testes)

│   ├── server.js            # Ponto de entrada (inicia o servidor)

│   ├── config/

│   │   └── database.js      # Conexão MySQL

│   ├── middleware/

│   │   └── auth.js          # JWT: authenticateToken, requireAdmin

│   ├── routes/

│   │   ├── auth.js          # Login, registro, usuários

│   │   ├── documents.js     # CRUD de documentos + histórico

│   │   ├── documentTypes.js # CRUD de tipos de documento

│   │   └── reports.js       # Relatórios + exportação CSV

│   └── tests/

│       └── api.test.js      # 26 testes automatizados

├── frontend/

│   ├── index.html           # Estrutura completa (todas as telas)

│   ├── styles.css           # Estilos responsivos com variáveis CSS

│   └── app.js               # Lógica: autenticação, CRUD, relatórios

├── database/

│   └── schema.sql           # Schema MySQL + seed inicial

└── docs/                    # Documentação do projeto

## 🚀 Como executar

### Pré-requisitos
- Node.js 18+
- MySQL 8+

### 1. Banco de dados
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais do MySQL
npm install
npm run dev     # desenvolvimento
npm start       # produção
```

### 3. Frontend
Com o backend em execução, acesse `http://localhost:3001`.
O frontend é servido pelo próprio Express e usa a API no mesmo endereço.

### 4. Testes
```bash
cd backend
npm test               # roda os 26 testes
npm run test:coverage  # com cobertura
```

## 🔑 Credenciais padrão

| Campo  | Valor           |
|--------|-----------------|
| E-mail | admin@sced.com  |
| Senha  | admin123        |
| Perfil | Administrador   |

> ⚠️ Altere a senha do admin após o primeiro acesso em produção.

## 📡 Endpoints da API

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/api/health` | Público | Status da API |
| POST | `/api/login` | Público | Autenticação JWT |
| GET | `/api/me` | Autenticado | Dados do usuário logado |
| POST | `/api/register` | Admin | Cadastrar usuário |
| GET | `/api/users` | Admin | Listar usuários |
| GET | `/api/documents` | Autenticado | Listar com filtros e paginação |
| POST | `/api/documents` | Autenticado | Criar documento (gera protocolo) |
| GET | `/api/documents/:id` | Autenticado | Detalhe do documento |
| PUT | `/api/documents/:id/status` | Autenticado | Alterar status |
| GET | `/api/documents/:id/history` | Autenticado | Histórico de movimentações |
| GET | `/api/document-types` | Autenticado | Listar tipos |
| POST | `/api/document-types` | Admin | Criar tipo |
| PUT | `/api/document-types/:id` | Admin | Editar tipo |
| DELETE | `/api/document-types/:id` | Admin | Desativar tipo |
| GET | `/api/reports` | Autenticado | Relatório JSON ou CSV |

### Protocolo automático
Formato: `SCED-YYYYMMDD-XXXX` — ex: `SCED-20250616-0042`

### Fluxo de status
`recebido` → `em_analise` → `encaminhado` → `finalizado`

## 🧪 Testes — 26 casos cobertos

| Suite | Testes |
|-------|--------|
| Health Check | 1 |
| POST /api/login | 4 |
| POST /api/register | 5 |
| POST /api/documents | 3 |
| GET /api/documents | 2 |
| PUT /api/documents/:id/status | 4 |
| GET /api/document-types | 1 |
| POST /api/document-types | 3 |
| GET /api/reports | 3 |

## 📋 Issues implementadas

| Issue | Título | Status |
|-------|--------|--------|
| T16 (#19) | Configurar ambiente de desenvolvimento | ✅ Fechada |
| T18 (#21) | Conectar o banco de dados | ✅ Fechada |
| T19 (#22) | Criar model de usuários | ✅ Fechada |
| T20 (#23) | Implementar login | ✅ Fechada |
| T21 (#24) | Cadastro do usuário | ✅ Fechada |
| T22 (#25) | Cadastro do documento | ✅ Fechada |
| T23 (#26) | Regras de negócio | ✅ Fechada |
| T24 (#27) | Tela de login | ✅ Fechada |
| T25 (#28) | Tela de cadastro | ✅ Fechada |
| T26 (#29) | Tela de registro de documentos | ✅ Fechada |
| T27 (#30) | Tela de consulta | ✅ Fechada |
| T28 (#31) | Testar funcionalidades principais | ✅ Fechada |
| T29 (#32) | Corrigir bugs | ✅ Fechada |
| T30 (#33) | Validar sistema completo | ✅ Fechada |
| T31 (#34) | Criar relatório final | ✅ Fechada |

## 🛠️ Tecnologias

- **Backend:** Node.js, Express 4, mysql2, bcryptjs, jsonwebtoken, dotenv
- **Frontend:** HTML5, CSS3, JavaScript ES6+ (sem frameworks)
- **Banco:** MySQL 8
- **Testes:** Jest 29, Supertest
