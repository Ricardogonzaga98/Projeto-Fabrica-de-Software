# Modelo Entidade-Relacionamento — SCED
## Sistema de Controle de Entrada de Documentos

**Projeto:** Fábrica de Software
**Data:** Junho de 2026

---

## Entidades e Atributos

### USERS (Usuários)
| Atributo | Tipo | Restrição | Descrição |
|----------|------|-----------|-----------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| name | VARCHAR(100) | NOT NULL | Nome completo |
| email | VARCHAR(100) | UNIQUE, NOT NULL | E-mail de acesso |
| password | VARCHAR(255) | NOT NULL | Senha criptografada (bcrypt) |
| role | ENUM | NOT NULL | Perfil: admin ou operator |
| active | TINYINT(1) | DEFAULT 1 | Usuário ativo/inativo |
| created_at | TIMESTAMP | DEFAULT NOW | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE | Data de atualização |

---

### DOCUMENT_TYPES (Tipos de Documento)
| Atributo | Tipo | Restrição | Descrição |
|----------|------|-----------|-----------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Nome do tipo |
| description | TEXT | — | Descrição opcional |
| active | TINYINT(1) | DEFAULT 1 | Soft delete |
| created_at | TIMESTAMP | DEFAULT NOW | Data de criação |

---

### PROCESSES (Processos)
| Atributo | Tipo | Restrição | Descrição |
|----------|------|-----------|-----------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| protocol | VARCHAR(20) | UNIQUE, NOT NULL | Protocolo: PROC-YYYYMMDD-XXXX |
| type_id | INT | FK → document_types | Tipo do processo |
| received_date | DATE | NOT NULL | Data de recebimento |
| sender | VARCHAR(100) | NOT NULL | Remetente |
| subject | VARCHAR(255) | NOT NULL | Assunto |
| destination_sector | VARCHAR(100) | — | Setor de destino |
| responsible | VARCHAR(100) | — | Responsável |
| observations | TEXT | — | Observações |
| status | ENUM | DEFAULT 'recebido' | Status atual |
| created_by | INT | FK → users | Usuário que cadastrou |
| created_at | TIMESTAMP | DEFAULT NOW | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE | Data de atualização |

---

### DOCUMENTS (Documentos)
| Atributo | Tipo | Restrição | Descrição |
|----------|------|-----------|-----------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| protocol | VARCHAR(20) | UNIQUE, NOT NULL | Protocolo: SCED-YYYYMMDD-XXXX |
| type_id | INT | FK → document_types | Tipo do documento |
| process_id | INT | FK → processes (nullable) | Processo vinculado (opcional) |
| received_date | DATE | NOT NULL | Data de recebimento |
| sender | VARCHAR(100) | NOT NULL | Remetente |
| subject | VARCHAR(255) | NOT NULL | Assunto |
| destination_sector | VARCHAR(100) | — | Setor de destino |
| responsible | VARCHAR(100) | — | Responsável |
| observations | TEXT | — | Observações |
| attachment_path | VARCHAR(255) | — | Nome do arquivo anexado |
| status | ENUM | DEFAULT 'recebido' | Status atual |
| created_by | INT | FK → users | Usuário que cadastrou |
| created_at | TIMESTAMP | DEFAULT NOW | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE | Data de atualização |

---

### DOCUMENT_HISTORY (Histórico de Documentos)
| Atributo | Tipo | Restrição | Descrição |
|----------|------|-----------|-----------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| document_id | INT | FK → documents | Documento relacionado |
| user_id | INT | FK → users | Usuário que realizou a ação |
| action | VARCHAR(100) | NOT NULL | Descrição da ação |
| old_status | VARCHAR(50) | — | Status anterior |
| new_status | VARCHAR(50) | — | Novo status |
| notes | TEXT | — | Observações da alteração |
| created_at | TIMESTAMP | DEFAULT NOW | Data e hora da movimentação |

---

### PROCESS_HISTORY (Histórico de Processos)
| Atributo | Tipo | Restrição | Descrição |
|----------|------|-----------|-----------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| process_id | INT | FK → processes | Processo relacionado |
| user_id | INT | FK → users | Usuário que realizou a ação |
| action | VARCHAR(100) | NOT NULL | Descrição da ação |
| old_status | VARCHAR(50) | — | Status anterior |
| new_status | VARCHAR(50) | — | Novo status |
| notes | TEXT | — | Observações da alteração |
| created_at | TIMESTAMP | DEFAULT NOW | Data e hora da movimentação |

---

## Relacionamentos

| Relacionamento | Cardinalidade | Descrição |
|---------------|---------------|-----------|
| USERS → DOCUMENTS | 1:N | Um usuário cadastra N documentos |
| USERS → PROCESSES | 1:N | Um usuário cadastra N processos |
| USERS → DOCUMENT_HISTORY | 1:N | Um usuário realiza N movimentações |
| USERS → PROCESS_HISTORY | 1:N | Um usuário realiza N movimentações |
| DOCUMENT_TYPES → DOCUMENTS | 1:N | Um tipo pertence a N documentos |
| DOCUMENT_TYPES → PROCESSES | 1:N | Um tipo pertence a N processos |
| PROCESSES → DOCUMENTS | 1:N | Um processo agrupa N documentos (opcional) |
| DOCUMENTS → DOCUMENT_HISTORY | 1:N | Um documento possui N registros de histórico |
| PROCESSES → PROCESS_HISTORY | 1:N | Um processo possui N registros de histórico |

---

## Diagrama Textual (MER)

```
┌─────────────┐          ┌──────────────────┐
│    USERS    │          │  DOCUMENT_TYPES  │
│─────────────│          │──────────────────│
│ PK id       │          │ PK id            │
│ name        │          │ name             │
│ email       │          │ description      │
│ password    │          │ active           │
│ role        │          └────────┬─────────┘
│ active      │                   │ 1
└──────┬──────┘                   │
       │ 1                        │ N
       │                    ┌─────┴──────────────────────────┐
       │ N                  │                                │
       │              ┌─────▼──────┐              ┌──────────▼──┐
       ├──────────────│  PROCESSES │              │  DOCUMENTS  │
       │              │────────────│  1        N  │─────────────│
       │              │ PK id      │◄─────────────│ PK id       │
       │              │ protocol   │              │ protocol    │
       │              │ FK type_id │              │ FK type_id  │
       │              │ FK created │              │ FK process_id│
       │              │ sender     │              │ FK created  │
       │              │ subject    │              │ sender      │
       │              │ status     │              │ subject     │
       │              └─────┬──────┘              │ status      │
       │                    │ 1                   │ attachment  │
       │                    │ N                   └──────┬──────┘
       │              ┌─────▼──────────┐                │ 1
       ├──────────────│PROCESS_HISTORY │                │ N
       │              │────────────────│         ┌──────▼──────────┐
       │              │ PK id          │         │DOCUMENT_HISTORY │
       └──────────────│ FK process_id  │         │─────────────────│
                      │ FK user_id     │         │ PK id           │
                      │ action         │         │ FK document_id  │
                      │ old_status     │         │ FK user_id      │
                      │ new_status     │         │ action          │
                      │ notes          │         │ old_status      │
                      └────────────────┘         │ new_status      │
                                                 │ notes           │
                                                 └─────────────────┘
```
