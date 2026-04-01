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
  const newDocumentBtn = document.getElementById('new-document-btn');
  const newDocumentSection = document.getElementById('new-document-section');
  const newDocumentForm = document.getElementById('new-document-form');
  const docTypeSelect = document.getElementById('doc-type');

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
  newDocumentForm.addEventListener('submit', handleNewDocument);

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
        loadDocuments();
      } else {
        alert('Erro no login: ' + (data.error || data.message));
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
        alert('Erro no registro: ' + (data.error || data.message));
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

      const data = await response.json();
      if (response.ok) {
        displayDocuments(data.documents);
      } else {
        alert('Erro ao carregar documentos: ' + (data.error || data.message));
      }
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
        <td>${doc.type_name || 'N/A'}</td>
        <td>${doc.sender}</td>
        <td>${doc.subject}</td>
        <td>${doc.status}</td>
        <td>
          <button onclick="viewDocument(${doc.id})">Ver</button>
          <button onclick="editStatus(${doc.id})">Editar Status</button>
        </td>
      `;
      documentsTbody.appendChild(row);
    });
  }

  async function loadDocumentTypes() {
    try {
      const response = await fetch(`${API_BASE}/document-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const types = await response.json();
      if (response.ok) {
        docTypeSelect.innerHTML = '<option value="">Selecione o tipo</option>';
        types.forEach(type => {
          const option = document.createElement('option');
          option.value = type.id;
          option.textContent = type.name;
          docTypeSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar tipos:', error);
    }
  }

  async function handleNewDocument(e) {
    e.preventDefault();
    const formData = {
      type_id: document.getElementById('doc-type').value,
      received_date: document.getElementById('doc-date').value,
      sender: document.getElementById('doc-sender').value,
      subject: document.getElementById('doc-subject').value,
      destination_sector: document.getElementById('doc-sector').value,
      responsible: document.getElementById('doc-responsible').value,
      observations: document.getElementById('doc-observations').value
    };

    try {
      const response = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Documento criado com sucesso! Protocolo: ${data.protocol}`);
        cancelNewDocument();
        loadDocuments();
      } else {
        alert('Erro: ' + (data.error || data.message));
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  // Funções globais para botões na tabela
  window.viewDocument = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/documents/${id}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const history = await response.json();
      if (response.ok) {
        alert(`Histórico do documento ${id}:\n${history.map(h => `${h.created_at}: ${h.action} - ${h.new_status}`).join('\n')}`);
      } else {
        alert('Erro ao carregar histórico');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  window.editStatus = async (id) => {
    const newStatus = prompt('Novo status (recebido, em_analise, encaminhado, finalizado):');
    if (!newStatus) return;

    try {
      const response = await fetch(`${API_BASE}/documents/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Status atualizado!');
        loadDocuments();
      } else {
        alert('Erro: ' + (data.error || data.message));
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  window.cancelNewDocument = cancelNewDocument;
});