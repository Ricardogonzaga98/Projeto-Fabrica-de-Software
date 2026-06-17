const API = '/api';

// Estado global
let token       = localStorage.getItem('sced_token');
let currentUser = JSON.parse(localStorage.getItem('sced_user') || 'null');
let currentPage = 1;
let currentFilters = {};
let documentTypes  = [];

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  if (token && currentUser) {
    initApp();
  } else {
    showPage('login');
  }

  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('new-document-form').addEventListener('submit', handleNewDocument);
  document.getElementById('register-form').addEventListener('submit', handleRegister);

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => goToPage(btn.dataset.page));
  });

  document.getElementById('logout-btn').addEventListener('click', logout);
});

function initApp() {
  document.getElementById('header').classList.remove('hidden');
  document.getElementById('sidebar').classList.remove('hidden');
  document.getElementById('main').classList.add('with-sidebar');
  document.getElementById('header-user-name').textContent = currentUser.name;
  document.getElementById('header-user-role').textContent =
    currentUser.role === 'admin' ? 'Administrador' : 'Operador';

  if (currentUser.role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
  }

  loadDocumentTypes().then(() => {
    goToPage('dashboard');
  });
}

// ============================================================
// NAVEGAÇÃO
// ============================================================
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById(`page-${name}`);
  if (target) target.classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.page === name);
  });
}

function goToPage(name) {
  showPage(name);
  if (name === 'dashboard')    loadDashboard();
  if (name === 'documents')    loadDocuments();
  if (name === 'new-document') prepareNewDocumentForm();
  if (name === 'consult')      populateConsultSelects();
  if (name === 'reports')      populateReportSelects();
  if (name === 'admin')        loadAdminPage();
}

// ============================================================
// LOGIN / LOGOUT
// ============================================================
async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.getElementById('login-submit');

  errEl.classList.add('hidden');

  if (!email || !password) {
    errEl.textContent = 'Preencha e-mail e senha.';
    errEl.classList.remove('hidden');
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Entrando...';

  try {
    const res  = await apiFetch('/login', 'POST', { email, password }, false);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro no login');

    token       = data.token;
    currentUser = data.user;
    localStorage.setItem('sced_token', token);
    localStorage.setItem('sced_user', JSON.stringify(currentUser));
    initApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Entrar';
  }
}

function logout() {
  token       = null;
  currentUser = null;
  localStorage.removeItem('sced_token');
  localStorage.removeItem('sced_user');
  document.getElementById('header').classList.add('hidden');
  document.getElementById('sidebar').classList.add('hidden');
  document.getElementById('main').classList.remove('with-sidebar');
  document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
  showPage('login');
}

// ============================================================
// DASHBOARD
// ============================================================
async function loadDashboard() {
  try {
    const res  = await apiFetch('/reports');
    const data = await res.json();
    if (!res.ok) return;

    document.getElementById('stat-total').textContent      = data.totais.total;
    document.getElementById('stat-recebido').textContent   = data.totais.por_status.recebido;
    document.getElementById('stat-analise').textContent    = data.totais.por_status.em_analise;
    document.getElementById('stat-finalizado').textContent = data.totais.por_status.finalizado;

    const recentes = data.documentos.slice(0, 5);
    const wrap = document.getElementById('dashboard-table-wrap');
    wrap.innerHTML = recentes.length === 0
      ? '<p style="color:var(--text-muted)">Nenhum documento registrado ainda.</p>'
      : buildDocTable(recentes);
  } catch (e) { console.error('Erro dashboard:', e); }
}

// ============================================================
// DOCUMENTOS
// ============================================================
async function loadDocuments(page = 1) {
  currentPage = page;
  const params = new URLSearchParams({ page, limit: 10, ...currentFilters });

  try {
    const res  = await apiFetch(`/documents?${params}`);
    const data = await res.json();
    if (!res.ok) return;

    const tbody = document.getElementById('documents-tbody');
    const empty = document.getElementById('documents-empty');
    tbody.innerHTML = '';

    if (data.documents.length === 0) {
      empty.classList.remove('hidden');
      document.getElementById('pagination').innerHTML = '';
      return;
    }
    empty.classList.add('hidden');
    tbody.innerHTML = buildDocRows(data.documents);
    buildPagination(data.pagination, loadDocuments);
  } catch (e) { console.error('Erro ao carregar documentos:', e); }
}

function applyFilters() {
  currentFilters = {};
  const protocol = document.getElementById('filter-protocol').value.trim();
  const sender   = document.getElementById('filter-sender').value.trim();
  const type     = document.getElementById('filter-type').value;
  const status   = document.getElementById('filter-status').value;
  if (protocol) currentFilters.protocol = protocol;
  if (sender)   currentFilters.sender   = sender;
  if (type)     currentFilters.type     = type;
  if (status)   currentFilters.status   = status;
  loadDocuments(1);
}

function clearFilters() {
  document.getElementById('filter-protocol').value = '';
  document.getElementById('filter-sender').value   = '';
  document.getElementById('filter-type').value     = '';
  document.getElementById('filter-status').value   = '';
  currentFilters = {};
  loadDocuments(1);
}

// ============================================================
// NOVO DOCUMENTO
// ============================================================
async function prepareNewDocumentForm() {
  const sel = document.getElementById('doc-type');
  sel.innerHTML = '<option value="">Selecione o tipo</option>';
  documentTypes.forEach(t => {
    sel.insertAdjacentHTML('beforeend', `<option value="${t.id}">${t.name}</option>`);
  });
  document.getElementById('doc-date').value = new Date().toISOString().split('T')[0];
}

async function handleNewDocument(e) {
  e.preventDefault();
  const errEl = document.getElementById('new-doc-error');
  const sucEl = document.getElementById('new-doc-success');
  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');

  const payload = {
    type_id:            document.getElementById('doc-type').value || null,
    received_date:      document.getElementById('doc-date').value,
    sender:             document.getElementById('doc-sender').value.trim(),
    subject:            document.getElementById('doc-subject').value.trim(),
    destination_sector: document.getElementById('doc-sector').value.trim(),
    responsible:        document.getElementById('doc-responsible').value.trim(),
    observations:       document.getElementById('doc-observations').value.trim()
  };

  try {
    const res  = await apiFetch('/documents', 'POST', payload);
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Erro ao registrar documento';
      errEl.classList.remove('hidden');
      return;
    }
    sucEl.textContent = `✅ Documento registrado! Protocolo: ${data.protocol}`;
    sucEl.classList.remove('hidden');
    resetNewDocumentForm();
    showToast(`Protocolo gerado: ${data.protocol}`, 'success');
  } catch (err) {
    errEl.textContent = 'Erro de comunicação com o servidor';
    errEl.classList.remove('hidden');
  }
}

function resetNewDocumentForm() {
  document.getElementById('new-document-form').reset();
  document.getElementById('doc-date').value = new Date().toISOString().split('T')[0];
}

// ============================================================
// CONSULTA
// ============================================================
function populateConsultSelects() {
  const sel = document.getElementById('consult-type');
  sel.innerHTML = '<option value="">Todos</option>';
  documentTypes.forEach(t => {
    sel.insertAdjacentHTML('beforeend', `<option value="${t.id}">${t.name}</option>`);
  });
}

async function runConsult() {
  const params = new URLSearchParams();
  const protocol = document.getElementById('consult-protocol').value.trim();
  const sender   = document.getElementById('consult-sender').value.trim();
  const type     = document.getElementById('consult-type').value;
  const status   = document.getElementById('consult-status').value;
  const start    = document.getElementById('consult-start').value;
  const end      = document.getElementById('consult-end').value;

  if (protocol) params.append('protocol', protocol);
  if (sender)   params.append('sender', sender);
  if (type)     params.append('type', type);
  if (status)   params.append('status', status);
  if (start)    params.append('start_date', start);
  if (end)      params.append('end_date', end);
  params.append('limit', 50);

  try {
    const res  = await apiFetch(`/documents?${params}`);
    const data = await res.json();
    const tbody = document.getElementById('consult-tbody');
    const empty = document.getElementById('consult-empty');
    tbody.innerHTML = '';

    if (!res.ok || data.documents.length === 0) {
      empty.textContent = 'Nenhum documento encontrado com os filtros aplicados.';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    tbody.innerHTML = buildDocRows(data.documents);
  } catch (e) { console.error('Erro na consulta:', e); }
}

function clearConsult() {
  ['consult-protocol', 'consult-sender', 'consult-start', 'consult-end']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('consult-type').value   = '';
  document.getElementById('consult-status').value = '';
  document.getElementById('consult-tbody').innerHTML = '';
  const empty = document.getElementById('consult-empty');
  empty.textContent = 'Use os filtros acima para consultar documentos.';
  empty.classList.remove('hidden');
}

// ============================================================
// RELATÓRIOS
// ============================================================
function populateReportSelects() {
  const sel = document.getElementById('report-type');
  sel.innerHTML = '<option value="">Todos</option>';
  documentTypes.forEach(t => {
    sel.insertAdjacentHTML('beforeend', `<option value="${t.id}">${t.name}</option>`);
  });
}

function buildReportParams() {
  const params = new URLSearchParams();
  const status = document.getElementById('report-status').value;
  const type   = document.getElementById('report-type').value;
  const start  = document.getElementById('report-start').value;
  const end    = document.getElementById('report-end').value;
  if (status) params.append('status', status);
  if (type)   params.append('type', type);
  if (start)  params.append('start_date', start);
  if (end)    params.append('end_date', end);
  return params;
}

async function generateReport() {
  try {
    const res  = await apiFetch(`/reports?${buildReportParams()}`);
    const data = await res.json();
    if (!res.ok) return;

    document.getElementById('rep-total').textContent      = data.totais.total;
    document.getElementById('rep-recebido').textContent   = data.totais.por_status.recebido;
    document.getElementById('rep-analise').textContent    = data.totais.por_status.em_analise;
    document.getElementById('rep-finalizado').textContent = data.totais.por_status.finalizado;
    document.getElementById('report-summary').classList.remove('hidden');

    const tbody = document.getElementById('report-tbody');
    const table = document.getElementById('report-table');
    tbody.innerHTML = data.documentos.map(d => `
      <tr>
        <td><code>${d.protocol}</code></td>
        <td>${d.tipo || '–'}</td>
        <td>${d.remetente}</td>
        <td>${d.assunto}</td>
        <td>${buildBadge(d.status)}</td>
        <td>${formatDate(d.data_recebimento)}</td>
      </tr>`).join('');
    table.classList.remove('hidden');
  } catch (e) { console.error('Erro ao gerar relatório:', e); }
}

async function exportCSV() {
  const params = buildReportParams();
  params.append('format', 'csv');

  try {
    const res = await fetch(`${API}/reports?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) { showToast('Erro ao exportar CSV', 'error'); return; }

    const blob    = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = blobUrl;
    a.download    = `relatorio_sced_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    showToast('CSV exportado com sucesso!', 'success');
  } catch (e) { showToast('Erro ao exportar CSV', 'error'); }
}

// ============================================================
// MODAL DETALHES
// ============================================================
async function viewDocument(id) {
  try {
    const [resDoc, resHist] = await Promise.all([
      apiFetch(`/documents/${id}`),
      apiFetch(`/documents/${id}/history`)
    ]);
    const doc  = await resDoc.json();
    const hist = await resHist.json();

    document.getElementById('modal-title').textContent = `Documento — ${doc.protocol}`;
    document.getElementById('modal-body').innerHTML = `
      <div class="detail-grid">
        <div class="detail-field"><label>Protocolo</label><p><strong>${doc.protocol}</strong></p></div>
        <div class="detail-field"><label>Status</label><p>${buildBadge(doc.status)}</p></div>
        <div class="detail-field"><label>Tipo</label><p>${doc.type_name || '–'}</p></div>
        <div class="detail-field"><label>Data de Recebimento</label><p>${formatDate(doc.received_date)}</p></div>
        <div class="detail-field"><label>Remetente</label><p>${doc.sender}</p></div>
        <div class="detail-field"><label>Setor de Destino</label><p>${doc.destination_sector || '–'}</p></div>
        <div class="detail-field"><label>Responsável</label><p>${doc.responsible || '–'}</p></div>
        <div class="detail-field"><label>Registrado por</label><p>${doc.creator_name || '–'}</p></div>
      </div>
      <div style="margin-top:1rem">
        <label><strong>Assunto</strong></label>
        <p style="margin-top:.3rem">${doc.subject}</p>
      </div>
      ${doc.observations ? `<div style="margin-top:.75rem"><label><strong>Observações</strong></label><p style="margin-top:.3rem;color:var(--text-muted)">${doc.observations}</p></div>` : ''}
      <hr style="margin:1.25rem 0;border-color:var(--border)">
      <h4 style="margin-bottom:.75rem">Histórico de Movimentações</h4>
      ${hist.length === 0
        ? '<p style="color:var(--text-muted)">Sem histórico.</p>'
        : hist.map(h => `
          <div class="history-item">
            <div class="hi-action">${h.action}${h.old_status
              ? ` — <span style="color:var(--text-muted)">${labelStatus(h.old_status)}</span> → ${buildBadge(h.new_status)}`
              : ''}</div>
            <div class="hi-meta">Por <strong>${h.user_name || 'Sistema'}</strong> em ${formatDateTime(h.created_at)}${h.notes ? ` · ${h.notes}` : ''}</div>
          </div>`).join('')
      }`;
    document.getElementById('modal-overlay').classList.remove('hidden');
  } catch (e) { console.error('Erro ao buscar detalhes:', e); }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ============================================================
// MODAL STATUS
// ============================================================
function openStatusModal(id, protocol, currentStatus) {
  document.getElementById('status-doc-id').value       = id;
  document.getElementById('status-doc-protocol').value = protocol;
  document.getElementById('status-new').value          = currentStatus;
  document.getElementById('status-notes').value        = '';
  document.getElementById('status-error').classList.add('hidden');
  document.getElementById('status-modal-overlay').classList.remove('hidden');
}

function closeStatusModal() {
  document.getElementById('status-modal-overlay').classList.add('hidden');
}

async function confirmStatusChange() {
  const id     = document.getElementById('status-doc-id').value;
  const status = document.getElementById('status-new').value;
  const notes  = document.getElementById('status-notes').value.trim();
  const errEl  = document.getElementById('status-error');
  errEl.classList.add('hidden');

  try {
    const res  = await apiFetch(`/documents/${id}/status`, 'PUT', { status, notes });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Erro ao atualizar status';
      errEl.classList.remove('hidden');
      return;
    }
    closeStatusModal();
    showToast('Status atualizado com sucesso!', 'success');
    const activePage = document.querySelector('.nav-item.active')?.dataset.page;
    if (activePage === 'documents') loadDocuments(currentPage);
    if (activePage === 'consult')   runConsult();
    if (activePage === 'dashboard') loadDashboard();
  } catch (e) {
    errEl.textContent = 'Erro de comunicação com o servidor';
    errEl.classList.remove('hidden');
  }
}

// ============================================================
// ADMINISTRAÇÃO
// ============================================================
async function loadAdminPage() {
  await loadDocumentTypes();
  renderTypesList();
}

async function loadDocumentTypes() {
  try {
    const res = await apiFetch('/document-types');
    if (res.ok) documentTypes = await res.json();
  } catch (e) { console.error('Erro ao carregar tipos:', e); }
}

function renderTypesList() {
  const ul = document.getElementById('types-list');
  if (!ul) return;
  ul.innerHTML = documentTypes.map(t => `
    <li>
      <span>${t.name}${t.description
        ? ` <small style="color:var(--text-muted)">— ${t.description}</small>`
        : ''}</span>
      ${currentUser.role === 'admin'
        ? `<button class="btn btn-danger btn-sm" onclick="deleteDocumentType(${t.id})">Remover</button>`
        : ''}
    </li>`).join('');
}

async function createDocumentType() {
  const name  = document.getElementById('new-type-name').value.trim();
  const desc  = document.getElementById('new-type-desc').value.trim();
  const errEl = document.getElementById('admin-types-error');
  errEl.classList.add('hidden');

  if (!name) {
    errEl.textContent = 'Informe o nome do tipo.';
    errEl.classList.remove('hidden');
    return;
  }

  try {
    const res  = await apiFetch('/document-types', 'POST', { name, description: desc });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error;
      errEl.classList.remove('hidden');
      return;
    }
    document.getElementById('new-type-name').value = '';
    document.getElementById('new-type-desc').value = '';
    await loadDocumentTypes();
    renderTypesList();
    showToast('Tipo de documento criado!', 'success');
  } catch (e) {
    errEl.textContent = 'Erro ao criar tipo';
    errEl.classList.remove('hidden');
  }
}

async function deleteDocumentType(id) {
  if (!confirm('Remover este tipo de documento?')) return;
  try {
    const res = await apiFetch(`/document-types/${id}`, 'DELETE');
    if (res.ok) {
      await loadDocumentTypes();
      renderTypesList();
      showToast('Tipo removido.', 'success');
    }
  } catch (e) { showToast('Erro ao remover tipo', 'error'); }
}

async function handleRegister(e) {
  e.preventDefault();
  const errEl = document.getElementById('register-error');
  const sucEl = document.getElementById('register-success');
  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');

  const payload = {
    name:     document.getElementById('reg-name').value.trim(),
    email:    document.getElementById('reg-email').value.trim(),
    password: document.getElementById('reg-password').value,
    role:     document.getElementById('reg-role').value
  };

  try {
    const res  = await apiFetch('/register', 'POST', payload);
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Erro ao cadastrar usuário';
      errEl.classList.remove('hidden');
      return;
    }
    sucEl.textContent = `Usuário "${data.name}" cadastrado com sucesso!`;
    sucEl.classList.remove('hidden');
    document.getElementById('register-form').reset();
    showToast('Usuário cadastrado!', 'success');
  } catch (err) {
    errEl.textContent = 'Erro de comunicação com o servidor';
    errEl.classList.remove('hidden');
  }
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function buildDocTable(docs) {
  return `<div class="table-wrap"><table>
    <thead><tr>
      <th>Protocolo</th><th>Tipo</th><th>Remetente</th>
      <th>Assunto</th><th>Status</th><th>Data</th>
    </tr></thead>
    <tbody>${buildDocRows(docs, false)}</tbody>
  </table></div>`;
}

function buildDocRows(docs, withActions = true) {
  return docs.map(doc => `
    <tr>
      <td><code>${doc.protocol || ''}</code></td>
      <td>${doc.type_name || doc.tipo || '–'}</td>
      <td>${doc.sender || doc.remetente || '–'}</td>
      <td title="${doc.subject || doc.assunto || ''}">${truncate(doc.subject || doc.assunto || '', 40)}</td>
      <td>${buildBadge(doc.status)}</td>
      <td>${formatDate(doc.received_date || doc.data_recebimento)}</td>
      ${withActions ? `<td>
        <button class="btn btn-sm btn-secondary" onclick="viewDocument(${doc.id})">👁 Ver</button>
        <button class="btn btn-sm btn-primary" onclick="openStatusModal(${doc.id},'${doc.protocol || ''}','${doc.status}')">✎ Status</button>
      </td>` : ''}
    </tr>`).join('');
}

function buildPagination(pag, loadFn) {
  const container = document.getElementById('pagination');
  if (!container || pag.pages <= 1) { if (container) container.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="${loadFn.name}(${pag.page - 1})" ${pag.page <= 1 ? 'disabled' : ''}>‹ Ant</button>`;
  for (let i = 1; i <= pag.pages; i++) {
    if (i === 1 || i === pag.pages || Math.abs(i - pag.page) <= 2) {
      html += `<button class="page-btn ${i === pag.page ? 'active' : ''}" onclick="${loadFn.name}(${i})">${i}</button>`;
    } else if (Math.abs(i - pag.page) === 3) {
      html += `<span style="padding:.35rem .4rem;color:var(--text-muted)">…</span>`;
    }
  }
  html += `<button class="page-btn" onclick="${loadFn.name}(${pag.page + 1})" ${pag.page >= pag.pages ? 'disabled' : ''}>Prox ›</button>`;
  container.innerHTML = html;
}

function buildBadge(status) {
  return `<span class="badge badge-${status}">${labelStatus(status)}</span>`;
}

function labelStatus(s) {
  const m = { recebido: 'Recebido', em_analise: 'Em Análise', encaminhado: 'Encaminhado', finalizado: 'Finalizado' };
  return m[s] || s;
}

function formatDate(d) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatDateTime(d) {
  if (!d) return '–';
  return new Date(d).toLocaleString('pt-BR');
}

function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n) + '…' : str;
}

let toastTimer;
function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

// ============================================================
// API HELPER
// ============================================================
async function apiFetch(path, method = 'GET', body = null, withAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (withAuth && token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API}${path}`, opts);

  if (res.status === 401 || res.status === 403) {
    logout();
    throw new Error('Sessão expirada');
  }
  return res;
}

// Expor funções para uso inline no HTML
window.goToPage            = goToPage;
window.applyFilters        = applyFilters;
window.clearFilters        = clearFilters;
window.runConsult          = runConsult;
window.clearConsult        = clearConsult;
window.generateReport      = generateReport;
window.exportCSV           = exportCSV;
window.viewDocument        = viewDocument;
window.openStatusModal     = openStatusModal;
window.closeModal          = closeModal;
window.closeStatusModal    = closeStatusModal;
window.confirmStatusChange = confirmStatusChange;
window.createDocumentType  = createDocumentType;
window.deleteDocumentType  = deleteDocumentType;
window.resetNewDocumentForm = resetNewDocumentForm;
