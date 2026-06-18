# Documento de Visão — SCED
## Sistema de Controle de Entrada de Documentos

**Projeto:** Fábrica de Software
**Data:** Junho de 2026
**Versão:** 1.0

---

## 1. Introdução

Este documento descreve a visão geral do Sistema de Controle de Entrada de Documentos (SCED), desenvolvido como projeto da disciplina Fábrica de Software. Seu objetivo é estabelecer o problema identificado, os usuários envolvidos, as principais funcionalidades e as restrições do sistema.

---

## 2. Problema Identificado

Atualmente, o controle de entrada de documentos na instituição é realizado por meio de planilhas e registros manuais, apresentando as seguintes limitações:

| Problema | Impacto |
|----------|---------|
| Possibilidade de perda de documentos | Comprometimento da confiabilidade |
| Falta de rastreabilidade das movimentações | Dificuldade em auditar processos |
| Dificuldade na busca de informações | Baixa eficiência operacional |
| Ausência de padronização nos registros | Inconsistência dos dados |
| Suscetibilidade a erros humanos | Retrabalho e falhas de comunicação |
| Baixa eficiência no acompanhamento | Atrasos nos processos internos |

---

## 3. Posicionamento do Produto

O SCED é um sistema web desenvolvido para substituir o controle manual de documentos em instituições públicas. Ele centraliza e automatiza o registro, acompanhamento e consulta de documentos e processos administrativos, oferecendo rastreabilidade completa e controle de acesso por perfil de usuário.

---

## 4. Usuários e Partes Interessadas

### Partes interessadas

| Parte | Interesse |
|-------|-----------|
| Instituição pública | Organização e eficiência no controle documental |
| Equipe de desenvolvimento | Entrega de um sistema funcional e bem documentado |
| Professor orientador | Avaliação da aplicação de boas práticas de engenharia de software |

### Perfis de usuário

| Perfil | Descrição | Permissões |
|--------|-----------|------------|
| Administrador | Gestor do sistema | Acesso total: cadastros, relatórios, administração de usuários e tipos |
| Operador | Usuário comum | Registro e consulta de documentos e processos, alteração de status |

---

## 5. Visão Geral do Produto

### 5.1 Perspectiva do produto

O SCED é uma aplicação web acessível via navegador, sem necessidade de instalação pelo usuário final. O sistema opera com backend Node.js + Express, banco de dados MySQL e frontend em HTML/CSS/JavaScript puro.

### 5.2 Principais funcionalidades

| Funcionalidade | Descrição |
|---------------|-----------|
| Autenticação | Login seguro com JWT e senhas criptografadas com bcrypt |
| Cadastro de documentos | Registro com protocolo automático (SCED-YYYYMMDD-XXXX), upload de anexo |
| Cadastro de processos | Registro com protocolo automático (PROC-YYYYMMDD-XXXX) |
| Vínculo documento-processo | N documentos podem ser vinculados a um processo |
| Controle de status | Fluxo: Recebido → Em Análise → Encaminhado → Finalizado |
| Histórico de movimentação | Rastreabilidade completa de alterações com usuário e data |
| Consulta com filtros | Busca por protocolo, remetente, tipo, status e período |
| Relatórios | Geração com filtros e exportação em CSV |
| Administração | Gestão de usuários e tipos de documento |

### 5.3 Suposições e dependências

- O sistema requer acesso a um servidor com Node.js e MySQL instalados
- O acesso é realizado via navegador moderno (Chrome, Edge, Firefox)
- A instituição é responsável pelo gerenciamento de backups do banco de dados

---

## 6. Restrições

- O sistema não realiza integração com sistemas externos
- Não há assinatura digital de documentos
- Não há notificações por e-mail ou SMS
- Não há aplicativo mobile
- Não há geração automática de documentos em PDF
- O sistema não utiliza inteligência artificial

---

## 7. Requisitos de Qualidade

| Atributo | Descrição |
|----------|-----------|
| Segurança | Autenticação JWT, senhas com hash bcrypt, controle de acesso por perfil |
| Desempenho | Respostas em até 2 segundos para operações comuns |
| Usabilidade | Interface simples, intuitiva e responsiva (mobile/desktop) |
| Confiabilidade | Protocolo único garantido por sequencial diário com retry automático |
| Manutenibilidade | Código separado em camadas (rotas, middleware, config), documentado |

---

## 8. Resultado Esperado

Um sistema web confiável, organizado e eficiente, capaz de substituir o controle manual de documentos, garantindo rastreabilidade, padronização e segurança das informações institucionais.
