# Diagrama de Casos de Uso — SCED
## Sistema de Controle de Entrada de Documentos

**Projeto:** Fábrica de Software
**Data:** Junho de 2026

---

## Atores

| Ator | Descrição |
|------|-----------|
| **Administrador** | Usuário com acesso total ao sistema |
| **Operador** | Usuário com acesso restrito a operações do dia a dia |

---

## Casos de Uso

### UC01 — Realizar Login
- **Ator:** Administrador, Operador
- **Descrição:** O usuário informa e-mail e senha para acessar o sistema
- **Pré-condição:** Usuário cadastrado e ativo no sistema
- **Pós-condição:** Token JWT gerado e sessão iniciada
- **Fluxo principal:** Usuário informa credenciais → sistema valida → token gerado → dashboard exibido
- **Fluxo alternativo:** Credenciais inválidas → mensagem de erro exibida

---

### UC02 — Cadastrar Documento
- **Ator:** Administrador, Operador
- **Descrição:** Registra um novo documento com protocolo gerado automaticamente
- **Pré-condição:** Usuário autenticado
- **Pós-condição:** Documento registrado com protocolo SCED-YYYYMMDD-XXXX e status "Recebido"
- **Fluxo principal:** Usuário preenche formulário → seleciona tipo, remetente, assunto, data → anexa arquivo (opcional) → vincula a processo (opcional) → confirma
- **Fluxo alternativo:** Campos obrigatórios não preenchidos → erro de validação

---

### UC03 — Consultar Documentos
- **Ator:** Administrador, Operador
- **Descrição:** Busca documentos com filtros combinados
- **Pré-condição:** Usuário autenticado
- **Pós-condição:** Lista de documentos exibida conforme filtros
- **Filtros disponíveis:** Protocolo, remetente, tipo, status, período

---

### UC04 — Visualizar Detalhes do Documento
- **Ator:** Administrador, Operador
- **Descrição:** Exibe todas as informações de um documento, incluindo histórico de movimentações e anexo
- **Pré-condição:** Usuário autenticado, documento existente
- **Pós-condição:** Modal com detalhes exibido

---

### UC05 — Alterar Status do Documento
- **Ator:** Administrador, Operador
- **Descrição:** Atualiza o status do documento e registra a alteração no histórico
- **Pré-condição:** Usuário autenticado, documento existente
- **Pós-condição:** Status atualizado, movimentação registrada no histórico
- **Fluxo de status:** Recebido → Em Análise → Encaminhado → Finalizado

---

### UC06 — Baixar Anexo do Documento
- **Ator:** Administrador, Operador
- **Descrição:** Faz download do arquivo anexado ao documento
- **Pré-condição:** Usuário autenticado, documento com anexo
- **Pós-condição:** Arquivo baixado pelo navegador

---

### UC07 — Cadastrar Processo
- **Ator:** Administrador, Operador
- **Descrição:** Registra um novo processo com protocolo gerado automaticamente
- **Pré-condição:** Usuário autenticado
- **Pós-condição:** Processo registrado com protocolo PROC-YYYYMMDD-XXXX e status "Recebido"
- **Fluxo principal:** Usuário preenche formulário → confirma → protocolo gerado

---

### UC08 — Consultar Processos
- **Ator:** Administrador, Operador
- **Descrição:** Busca processos com filtros combinados
- **Pré-condição:** Usuário autenticado
- **Filtros disponíveis:** Protocolo, remetente, tipo, status, período

---

### UC09 — Vincular Documento a Processo
- **Ator:** Administrador, Operador
- **Descrição:** Associa um documento existente a um processo
- **Pré-condição:** Usuário autenticado, documento e processo existentes
- **Pós-condição:** Documento vinculado ao processo
- **Quando:** No momento do cadastro do documento ou posteriormente

---

### UC10 — Gerar Relatório
- **Ator:** Administrador, Operador
- **Descrição:** Gera relatório de documentos com filtros e opção de exportação CSV
- **Pré-condição:** Usuário autenticado
- **Pós-condição:** Relatório exibido na tela ou arquivo CSV baixado

---

### UC11 — Gerenciar Tipos de Documento
- **Ator:** Administrador
- **Descrição:** Cria, lista e remove tipos de documento utilizados no cadastro
- **Pré-condição:** Usuário autenticado como administrador
- **Pós-condição:** Tipo criado ou removido

---

### UC12 — Gerenciar Usuários
- **Ator:** Administrador
- **Descrição:** Cadastra novos usuários com perfil admin ou operador
- **Pré-condição:** Usuário autenticado como administrador
- **Pós-condição:** Novo usuário cadastrado e apto a realizar login

---

## Diagrama Textual de Relacionamento

```
                        ┌─────────────────────────────────────┐
                        │            Sistema SCED              │
                        │                                      │
                        │  UC01 Realizar Login                 │
  ┌───────────┐         │  UC02 Cadastrar Documento            │
  │           │─────────│  UC03 Consultar Documentos           │
  │ Operador  │         │  UC04 Visualizar Detalhes            │
  │           │─────────│  UC05 Alterar Status Documento       │
  └───────────┘         │  UC06 Baixar Anexo                   │
                        │  UC07 Cadastrar Processo             │
                        │  UC08 Consultar Processos            │
                        │  UC09 Vincular Documento a Processo  │
  ┌───────────┐         │  UC10 Gerar Relatório                │
  │           │─────────│                                      │
  │   Admin   │         │  UC11 Gerenciar Tipos (admin only)   │
  │           │─────────│  UC12 Gerenciar Usuários (admin only)│
  └───────────┘         │                                      │
    (herda tudo         └─────────────────────────────────────┘
     do Operador)
```
