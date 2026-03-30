# 📌 Planejamento do Sistema de Controle de Entrada de Documentos

## 🎯 1. Objetivo

Desenvolver um sistema web para controle de entrada de documentos em uma instituição pública, garantindo organização, rastreabilidade e facilidade de consulta.

---

## 🧩 2. Descrição do Problema

Atualmente, o controle de documentos é feito por planilhas, o que gera:

* Perda de informações
* Falta de rastreabilidade
* Dificuldade de consulta
* Erros manuais

O sistema proposto irá centralizar e automatizar esse processo.

---

## 👥 3. Organização da Equipe

* Product Owner: (Nome)
* Scrum Master: (Nome)
* Desenvolvedor: (Nome)
* QA/Testes: (Nome)
* Documentação: (Nome)
* Desenvolvedor (opcional): (Nome)

---

## 🏗️ 4. Metodologia de Desenvolvimento

Será utilizada a metodologia ágil Scrum, com:

* Sprints semanais
* Reuniões de planejamento
* Daily meetings (rápidas)
* Revisão ao final de cada sprint

---

## 📋 5. Requisitos Funcionais

O sistema deverá permitir:

* Cadastro de usuários (Administrador e Operador)
* Login com autenticação
* Cadastro de tipos de documentos
* Registro de entrada de documentos com:

  * Protocolo automático
  * Tipo
  * Data de recebimento
  * Remetente
  * Assunto
  * Setor de destino
  * Responsável
  * Observações
  * Anexo (opcional)
* Consulta com filtros:

  * Protocolo
  * Remetente
  * Tipo
  * Período
* Alteração de status:

  * Recebido
  * Em análise
  * Encaminhado
  * Finalizado
* Histórico de movimentações
* Relatórios simples

---

## ⚙️ 6. Requisitos Não Funcionais

* Sistema web responsivo
* Controle de acesso por perfil
* Banco de dados relacional
* Interface amigável
* Versionamento no GitHub
* Registro de logs

---

## 🧱 7. Arquitetura do Sistema

O sistema será dividido em:

* Frontend (Interface do usuário)
* Backend (Regras de negócio)
* Banco de Dados

### Tecnologias sugeridas:

* Frontend: HTML, CSS, JavaScript
* Backend: Node.js
* Banco: MySQL

---

## 🔄 8. Fluxo do Sistema

1. Usuário realiza login
2. Acessa o sistema
3. Cadastra ou consulta documentos
4. Atualiza status dos documentos
5. Sistema registra histórico automaticamente

---

## 📊 9. Cronograma (Exemplo)

| Semana | Atividade                  |
| ------ | -------------------------- |
| 1      | Levantamento de requisitos |
| 2      | Modelagem do sistema       |
| 3      | Desenvolvimento backend    |
| 4      | Desenvolvimento frontend   |
| 5      | Integração                 |
| 6      | Testes                     |
| 7      | Entrega final              |

---

## 🧪 10. Plano de Testes

Serão realizados testes para:

* Login válido e inválido
* Cadastro de usuários
* Cadastro de documentos
* Consulta de documentos
* Alteração de status

---

## 📌 11. Considerações Finais

O sistema visa melhorar significativamente o controle de documentos, garantindo mais segurança, organização e eficiência para a instituição.
