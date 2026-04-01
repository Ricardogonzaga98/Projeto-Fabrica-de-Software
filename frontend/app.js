// Sistema de Controle de Entrada de Documentos - Frontend JavaScript

const API_BASE = 'http://localhost:3001/api';

document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const documentsBtn = document.getElementById('documents-btn');
  const newDocumentBtn = document.getElementById('new-document-btn');
  const documentsTbody = document.getElementById('documents-tbody');

  // Estado da aplicação
  let currentUser = null;
  let token = localStorage.getItem('token');

  // Verificar se usuário está logado
  if (token) {
    showDashboard();
  }

  // Event listeners
  loginBtn.addEventListener('click', showLogin);
  registerBtn.addEventListener('click', showRegister);
  logoutBtn.addEventListener('click', logout);
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  documentsBtn.addEventListener('click', showDocuments);
  newDocumentBtn.addEventListener('click', showNewDocumentForm);

  // Funções de navegação
  function showLogin() {
    hideAllSections();
    loginSection.classList.remove('hidden');
  }

  function showRegister() {
    hideAllSections();
    registerSection.classList.remove('hidden');
  }

  function showDashboard() {
    hideAllSections();
    dashboard.classList.remove('hidden');
    loadDocuments();
  }

  function hideAllSections() {
    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    dashboard.classList.add('hidden');
  }

  // Funções de autenticação
  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        token = data.token;
        localStorage.setItem('token', token);
        currentUser = data.user;
        showDashboard();
      } else {
        alert('Erro no login: ' + data.message);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao fazer login');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Usuário registrado com sucesso!');
        showLogin();
      } else {
        alert('Erro no registro: ' + data.message);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao registrar usuário');
    }
  }

  function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    hideAllSections();
    loginSection.classList.remove('hidden');
  }

  // Funções de documentos
  async function loadDocuments() {
    try {
      const response = await fetch(`${API_BASE}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const documents = await response.json();
      displayDocuments(documents);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  }

  function displayDocuments(documents) {
    documentsTbody.innerHTML = '';
    documents.forEach(doc => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${doc.protocol}</td>
        <td>${doc.type}</td>
        <td>${doc.sender}</td>
        <td>${doc.subject}</td>
        <td>${doc.status}</td>
        <td>
          <button onclick="viewDocument(${doc.id})">Ver</button>
          <button onclick="editDocument(${doc.id})">Editar</button>
        </td>
      `;
      documentsTbody.appendChild(row);
    });
  }

  function showDocuments() {
    // Já está na seção de documentos
  }

  function showNewDocumentForm() {
    // Implementar formulário de novo documento
    alert('Funcionalidade de novo documento em desenvolvimento');
  }

  // Funções globais para botões na tabela
  window.viewDocument = (id) => {
    alert(`Visualizar documento ${id}`);
  };

  window.editDocument = (id) => {
    alert(`Editar documento ${id}`);
  };
});