# Relatório Final — SCED
## Sistema de Controle de Entrada de Documentos

**Projeto:** Fábrica de Software
**Data:** Junho de 2026

---

## 1. Visão Geral

O SCED é um sistema web para substituir o controle manual de entrada de documentos em instituições públicas. A aplicação permite registrar, rastrear, consultar e emitir relatórios sobre documentos e processos oficiais, com controle de acesso por perfil (admin/operador). Documentos podem ser vinculados a processos, permitindo o agrupamento e rastreamento de múltiplos documentos sob um mesmo processo administrativo.

---

## 2. Arquitetura e Tecnologias

### Stack escolhida

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Backend | Node.js + Express | Leveza, ecossistema npm, fácil criação de APIs REST |
| Banco | MySQL 8 | Relacional, suporte a transações, familiar à equipe |
| Autenticação | JWT | Stateless, escalável, sem sessão no servidor |
| Senha | bcryptjs | Hashing seguro com salt automático |
| Upload | Multer | Middleware padrão para multipart/form-data no Express |
| Frontend | HTML + CSS + JS puro | Sem dependências de framework, fácil manutenção |
| Testes | Jest + Supertest | Padrão Node.js, suporte a mocks, testes HTTP |

### Padrão arquitetural

Cliente (Browser)

│ HTTP/JSON

▼

Express App (app.js)

│

├── Middleware JWT (middleware/auth.js)

│

├── Routes

│    ├── auth.js          → /api/login, /api/register, /api/users

│    ├── documents.js     → /api/documents, /api/documents/:id/...

│    ├── processes.js     → /api/processes, /api/processes/:id/...

│    ├── documentTypes.js → /api/document-types

│    └── reports.js       → /api/reports

│

└── config/database.js   → MySQL (mysql2)

---

## 3. Funcionalidades Implementadas

### Backend
- **Autenticação:** Login com JWT, validação de credenciais, controle de usuário ativo
- **Usuários:** Cadastro restrito a admin, validação de email e senha
- **Documentos:** CRUD completo, geração automática de protocolo (SCED-YYYYMMDD-XXXX), paginação, filtros, upload de anexos (PDF, DOC, DOCX, PNG, JPG — até 10MB), download autenticado de anexos
- **Processos:** CRUD completo, geração automática de protocolo (PROC-YYYYMMDD-XXXX), paginação, filtros, histórico de movimentações, listagem de documentos vinculados
- **Vínculo Documento-Processo:** Documentos podem ser vinculados a um processo no momento do cadastro ou posteriormente, com validação de existência do processo
- **Status:** Fluxo `recebido → em_analise → encaminhado → finalizado` com registro automático no histórico, disponível para documentos e processos
- **Histórico:** Rastreabilidade completa — quem alterou, quando e para qual status, em documentos e processos
- **Tipos de documento:** CRUD com soft delete (campo `active`), compartilhado entre documentos e processos
- **Relatórios:** Filtros combinados, exportação CSV com BOM UTF-8 (compatível com Excel)

### Frontend
- Telas: Login, Dashboard, Listagem de Documentos, Novo Documento, Processos, Novo Processo, Consulta, Relatórios, Administração
- Autenticação persistente via localStorage
- Filtros de busca e paginação dinâmica em documentos e processos
- Modal de detalhes com histórico completo e listagem de documentos vinculados (processos)
- Modal de alteração de status para documentos e processos
- Upload de arquivo no formulário de documento (multipart/form-data)
- Download autenticado de anexo com token JWT via Fetch API + Blob
- Seleção de processo para vincular ao documento no momento do cadastro
- Exportação de CSV via fetch + Blob
- Toast de notificações
- Layout responsivo (mobile/desktop)
- Controle de visibilidade por perfil (admin/operador)

---

## 4. Modelo de Dados

### Tabelas principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema (admin/operador) |
| `document_types` | Tipos de documento compartilhados |
| `documents` | Documentos com protocolo SCED, anexo e vínculo opcional a processo |
| `document_history` | Histórico de movimentações dos documentos |
| `processes` | Processos com protocolo PROC |
| `process_history` | Histórico de movimentações dos processos |

### Relacionamentos
- Um processo pode ter N documentos vinculados (`documents.process_id → processes.id`)
- Um documento pode existir sem processo (vínculo opcional)
- Documentos e processos compartilham os mesmos tipos (`document_types`)

---

## 5. Decisões Técnicas

### Separação app.js / server.js
O `server.js` original tinha tudo junto, impossibilitando testes com Supertest. A solução foi separar a aplicação Express (`app.js`, exportável) do servidor (`server.js`, apenas inicia a escuta).

### Geração de protocolo
- Documentos: `SCED-YYYYMMDD-XXXX` com sequencial diário via MAX do último sequencial
- Processos: `PROC-YYYYMMDD-XXXX` com mesma lógica, namespaces separados para evitar colisão
- Sistema de retry (até 5 tentativas) em caso de colisão de protocolo por concorrência

### Upload de anexos com Multer
O Multer intercepta requisições `multipart/form-data`, salva o arquivo em disco na pasta `uploads/` com nome único baseado em timestamp, e registra apenas o nome do arquivo no banco. O download é feito via rota autenticada que serve o arquivo com `res.download()`.

### Soft delete em tipos de documento
O campo `active = 0` preserva a integridade referencial dos documentos já cadastrados com aquele tipo, ao invés de deletar fisicamente.

### Hash real no seed
O seed original tinha um placeholder inválido. Foi substituído por hash bcrypt real da senha `admin123`.

### Mocks nos testes
`jest.mock()` para mysql2, bcryptjs e jsonwebtoken elimina dependência de banco real, tornando os testes rápidos e executáveis em qualquer ambiente.

---

## 6. Bugs Corrigidos (T29)

| Bug | Origem | Correção |
|-----|--------|----------|
| Testes quebravam ao importar app | `server.js` não exportava o app | Criado `app.js` exportável |
| Hash de senha inválido no seed | Placeholder no schema.sql | Hash bcrypt real gerado |
| Variáveis DOM inexistentes | Frontend referenciava IDs errados | HTML reconstruído com IDs corretos |
| Testes sem mock de banco | Conexão real falhava | `jest.mock('../config/database')` |
| CSV sem BOM | Excel não reconhecia UTF-8 | Adicionado `'\uFEFF'` no início |

---

## 7. Cobertura de Testes — 26 testes, 0 falhas

| Suite | Fluxos principais | Cenários de erro |
|-------|:-----------------:|:----------------:|
| Health | 1 | — |
| Login | 1 | 3 |
| Register | 1 | 4 |
| POST /documents | 1 | 2 |
| GET /documents | 1 | 1 |
| PUT status | 1 | 3 |
| GET types | 1 | — |
| POST types | 1 | 2 |
| Reports | 2 | 1 |

---

## 8. Pendências e Sugestões Futuras

| Item | Prioridade | Observação |
|------|-----------|------------|
| Notificações por e-mail | Baixa | Avisar responsável ao alterar status |
| Rate limiting no login | Alta | Proteger contra brute force |
| HTTPS em produção | Alta | Configurar certificado TLS |
| Testes E2E | Média | Playwright ou Cypress para complementar |
| Testes para rotas de processos | Média | Cobrir os novos endpoints com Jest + Supertest |
| Desvincular documento de processo | Baixa | Permitir remover vínculo sem excluir documento |

---

## 9. Aprendizados

- Separar `app.js` de `server.js` é fundamental para testabilidade e deve ser feito desde o início
- Mocks bem estruturados permitem testar todos os endpoints sem banco de dados real
- Variáveis CSS facilitam manutenção e personalização visual
- Soft delete preserva integridade histórica e é preferível ao delete físico em sistemas de controle
- A geração de protocolo único por data garante rastreabilidade mesmo em re-importações
- Upload de arquivos requer tratamento especial no frontend (FormData em vez de JSON) e no backend (Multer para multipart)
- Relacionamentos opcionais (nullable foreign keys) permitem flexibilidade sem comprometer a integridade referencial