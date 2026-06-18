# 📖 Documentação da API - SCED

## Base URL
```
http://localhost:3001/api
```

---

## Autenticação

Todos os endpoints protegidos exigem o header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Health Check
- **GET** `/health`
- Verifica se a API está funcionando
- Resposta: `{ "status": "OK", "message": "API funcionando", "version": "1.0.0" }`

---

### Autenticação

#### Login
- **POST** `/login`
- Body: `{ "email": "string", "password": "string" }`
- Resposta: `{ "token": "jwt", "user": { "id", "name", "email", "role" } }`

#### Registro
- **POST** `/register`
- 🔒 Requer token (admin)
- Body: `{ "name": "string", "email": "string", "password": "string", "role": "admin|operator" }`

---

### Documentos

#### Listar Documentos
- **GET** `/documents`
- 🔒 Requer token
- Query params: `protocol`, `sender`, `type`, `status`, `start_date`, `end_date`, `page`, `limit`
- Resposta: `{ documents: [...], pagination: { page, limit, total, pages } }`

#### Buscar Documento
- **GET** `/documents/:id`
- 🔒 Requer token

#### Criar Documento (com upload opcional)
- **POST** `/documents`
- 🔒 Requer token
- Content-Type: `multipart/form-data`
- Campos: `type_id`, `received_date`*, `sender`*, `subject`*, `destination_sector`, `responsible`, `observations`, `process_id`, `attachment`
- Campos com * são obrigatórios
- Resposta: `{ "message": "...", "id": 1, "protocol": "SCED-20260617-0001" }`

#### Download de Anexo
- **GET** `/documents/:id/download`
- 🔒 Requer token
- Retorna o arquivo binário para download

#### Alterar Status
- **PUT** `/documents/:id/status`
- 🔒 Requer token
- Body: `{ "status": "recebido|em_analise|encaminhado|finalizado", "notes": "string" }`

#### Histórico do Documento
- **GET** `/documents/:id/history`
- 🔒 Requer token
- Retorna lista de movimentações ordenadas por data

---

### Processos

#### Listar Processos
- **GET** `/processes`
- 🔒 Requer token
- Query params: `protocol`, `sender`, `type`, `status`, `start_date`, `end_date`, `page`, `limit`
- Resposta: `{ processes: [...], pagination: { page, limit, total, pages } }`

#### Buscar Processo
- **GET** `/processes/:id`
- 🔒 Requer token

#### Criar Processo
- **POST** `/processes`
- 🔒 Requer token
- Content-Type: `application/json`
- Body: `{ "type_id", "received_date"*, "sender"*, "subject"*, "destination_sector", "responsible", "observations" }`
- Campos com * são obrigatórios
- Resposta: `{ "message": "...", "id": 1, "protocol": "PROC-20260617-0001" }`

#### Alterar Status do Processo
- **PUT** `/processes/:id/status`
- 🔒 Requer token
- Body: `{ "status": "recebido|em_analise|encaminhado|finalizado", "notes": "string" }`

#### Listar Documentos do Processo
- **GET** `/processes/:id/documents`
- 🔒 Requer token
- Retorna todos os documentos vinculados ao processo

#### Vincular Documento a Processo (pós-cadastro)
- **PUT** `/processes/:id/link-document`
- 🔒 Requer token
- Body: `{ "document_id": 1 }`

#### Histórico do Processo
- **GET** `/processes/:id/history`
- 🔒 Requer token
- Retorna lista de movimentações ordenadas por data

---

### Tipos de Documento

#### Listar Tipos
- **GET** `/document-types`
- 🔒 Requer token

#### Criar Tipo
- **POST** `/document-types`
- 🔒 Requer token (admin)
- Body: `{ "name": "string", "description": "string" }`

#### Remover Tipo
- **DELETE** `/document-types/:id`
- 🔒 Requer token (admin)

---

### Relatórios

#### Gerar Relatório
- **GET** `/reports`
- 🔒 Requer token
- Query params: `status`, `type`, `start_date`, `end_date`, `format`
- Quando `format=csv`: retorna arquivo CSV com BOM UTF-8

---

## Status Codes

| Código | Significado |
|--------|------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos ou faltando |
| 401 | Token ausente ou inválido |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## Respostas de Erro
```json
{
  "error": "Mensagem descritiva do erro"
}
```

---

## Fluxo de Status

```
recebido → em_analise → encaminhado → finalizado
```

Válido tanto para documentos quanto para processos. Cada alteração é registrada automaticamente no histórico com usuário, data e observações opcionais.