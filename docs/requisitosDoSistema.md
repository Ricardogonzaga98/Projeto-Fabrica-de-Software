📋 Requisitos do Sistema

📌 Requisitos Funcionais

👤 Usuários e Autenticação
O sistema deve permitir o cadastro de usuários com os perfis:
- Administrador;
- Operador;
O sistema deve permitir login com autenticação (usuário e senha);
O sistema deve controlar o nível de acesso conforme o perfil do usuário;

📄 Tipos de Documentos
O sistema deve permitir cadastrar tipos de documentos;
O sistema deve permitir editar tipos de documentos;
O sistema deve permitir excluir tipos de documentos;
O sistema deve listar todos os tipos cadastrados;

📥 Registro de Entrada de Documentos
O sistema deve permitir registrar a entrada de documentos;
Cada documento deve conter:
- Número de protocolo (único);
- Tipo de documento;
- Data de entrada;
- Remetente;
- Descrição;
O sistema deve gerar automaticamente um identificador único para cada documento;

🔍 Consulta de Documentos
O sistema deve permitir consultar documentos com filtros:
Data;
Tipo de documento;
Status;
Remetente;
O sistema deve exibir os resultados em formato de lista ou tabela;

🔄 Alteração de Status
O sistema deve permitir alterar o status do documento:
- Recebido;
- Em análise;
- Finalizado;
O sistema deve registrar a data da alteração;

📜 Histórico de Movimentação
O sistema deve manter o histórico de alterações dos documentos;
O sistema deve registrar:
- Usuário responsável;
- Data e hora da alteração;
- Tipo de alteração realizada;

📊 Relatórios
O sistema deve gerar relatórios com base em:
- Período;
- Tipo de documento;
- Status;
O sistema deve permitir exportação de relatórios (ex: PDF ou CSV);

-----------------------//-----\\------------------------------

⚙️ Requisitos Não Funcionais

🔐 Segurança
O sistema deve garantir autenticação segura dos usuários;
As senhas devem ser armazenadas de forma criptografada;
O acesso às funcionalidades deve ser controlado por perfil;

⚡ Desempenho
O sistema deve responder às requisições em até 2 segundos;
O sistema deve suportar múltiplos usuários simultâneos;

💾 Banco de Dados
O sistema deve utilizar o SGBD MySQL;
O sistema deve garantir integridade dos dados;
Não deve haver duplicidade de número de protocolo;

🌐 Plataforma
O sistema deve ser acessível via navegador web;
Deve ser compatível com navegadores modernos (Chrome, Edge, Firefox);

🛠️ Tecnologias Utilizadas
- Node.js;
- Express;
- MySQL;
- HTML, CSS e JavaScript;

📈 Escalabilidade
O sistema deve suportar aumento no volume de dados sem perda significativa de desempenho;

🧾 Usabilidade
O sistema deve possuir interface simples e intuitiva;
Deve facilitar a navegação e a busca por informações;

🔄 Disponibilidade
O sistema deve estar disponível durante o horário de funcionamento da instituição;
O sistema deve possuir mecanismos de backup dos dados;