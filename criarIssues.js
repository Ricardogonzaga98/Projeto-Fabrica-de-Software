const fetch = require('node-fetch');

const TOKEN = 'SEU_TOKEN';
const REPO = 'Ricardogonzaga98/Projeto-Fabrica-de-Software';

const issues = [
  {
    title: 'Implementar login de usuário',
    body: 'Criar autenticação com email e senha'
  },
  {
    title: 'Criar cadastro de usuário',
    body: 'Desenvolver formulário e backend'
  },
  {
    title: 'Configurar banco de dados',
    body: 'Criar estrutura inicial'
  },
  {
    title: 'Desenvolver API',
    body: 'Criar endpoints principais'
  },
  {
    title: 'Criar interface do sistema',
    body: 'Desenvolver frontend'
  }
];

async function criarIssues() {
  for (const issue of issues) {
    await fetch(`https://api.github.com/repos/${REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(issue)
    });

    console.log(`Issue criada: ${issue.title}`);
  }
}

criarIssues();