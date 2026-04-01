# 📖 Documentação da API - SCED

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### Health Check
- **GET** `/health`
- Verifica se a API está funcionando

### Autenticação

#### Login
- **POST** `/login`
- Body: `{ "email": "string", "password": "string" }`
- Retorna token JWT

#### Registro
- **POST** `/register`
- Body: `{ "name": "string", "email": "string", "password": "string", "role": "admin|operator" }`

### Documentos

#### Listar Documentos
- **GET** `/documents`
- Headers: `Authorization: Bearer <token>`
- Query params: filtros opcionais

#### Criar Documento
- **POST** `/documents`
- Headers: `Authorization: Bearer <token>`
- Body: dados do documento

#### Tipos de Documento
- **GET** `/document-types`

## Autenticação
A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header Authorization para endpoints protegidos.

## Respostas de Erro
```json
{
  "error": "Mensagem de erro",
  "code": 400
}
```

## Status Codes
- 200: Sucesso
- 201: Criado
- 400: Bad Request
- 401: Não autorizado
- 404: Não encontrado
- 500: Erro interno do servidor