/**
 * SCED - Testes automatizados
 * T28.1 - Testar fluxos principais
 * T28.2 - Testar cenários de erro
 * T29.1 - Corrigir bugs nos testes originais
 * T29.2 - Mocks de banco, bcrypt e JWT
 */

const request = require('supertest');

// ============================================================
// MOCKS — devem vir antes de qualquer require do app
// ============================================================

jest.mock('../config/database', () => {
  const mockQuery = jest.fn();
  return {
    promise: () => ({ query: mockQuery }),
    _mockQuery: mockQuery
  };
});

jest.mock('bcryptjs', () => ({
  hash:    jest.fn().mockResolvedValue('$2a$10$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

jest.mock('jsonwebtoken', () => ({
  sign:   jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn((token, secret, cb) => {
    if (token === 'valid-token') {
      cb(null, { id: 1, email: 'admin@sced.com', role: 'admin', name: 'Admin' });
    } else {
      cb(new Error('invalid token'));
    }
  })
}));

// ============================================================
// IMPORTS — após os mocks
// ============================================================
const app      = require('../app');
const db       = require('../config/database');
const mockQuery = db._mockQuery;
const AUTH_TOKEN = 'valid-token';

// ============================================================
// HEALTH CHECK
// ============================================================
describe('Health Check', () => {
  test('GET /api/health → 200 com status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.message).toBeDefined();
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers.etag).toBeUndefined();
  });
});

describe('Validação JSON', () => {
  test('deve retornar JSON quando o corpo da requisição for inválido', async () => {
    const res = await request(app)
      .post('/api/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');

    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.error).toBe('JSON inválido');
  });
});

// ============================================================
// T20 — LOGIN
// ============================================================
describe('POST /api/login', () => {
  beforeEach(() => mockQuery.mockReset());

  test('T28.1 — deve retornar token com credenciais válidas', async () => {
    mockQuery.mockResolvedValueOnce([[{
      id: 1, name: 'Admin', email: 'admin@sced.com',
      password: '$2a$10$hash', role: 'admin', active: 1
    }]]);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'admin@sced.com', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('admin@sced.com');
    expect(res.body.user.role).toBe('admin');
  });

  test('T28.2 — deve retornar 400 quando campos estão ausentes', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'admin@sced.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/obrigatório/i);
  });

  test('T28.2 — deve retornar 401 para usuário inexistente', async () => {
    mockQuery.mockResolvedValueOnce([[]]);
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'naoexiste@sced.com', password: '123456' });
    expect(res.status).toBe(401);
  });

  test('T28.2 — deve retornar 401 para senha incorreta', async () => {
    const bcrypt = require('bcryptjs');
    bcrypt.compare.mockResolvedValueOnce(false);
    mockQuery.mockResolvedValueOnce([[{
      id: 1, email: 'admin@sced.com', password: '$2a$10$hash',
      role: 'admin', active: 1, name: 'Admin'
    }]]);
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'admin@sced.com', password: 'errada' });
    expect(res.status).toBe(401);
  });
});

// ============================================================
// T21 — CADASTRO DE USUÁRIOS
// ============================================================
describe('POST /api/register', () => {
  beforeEach(() => mockQuery.mockReset());

  test('T28.1 — deve cadastrar usuário com dados válidos', async () => {
    mockQuery.mockResolvedValueOnce([[]]); // email não existe
    mockQuery.mockResolvedValueOnce([{ insertId: 2 }]);

    const res = await request(app)
      .post('/api/register')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ name: 'Novo Operador', email: 'op@sced.com', password: '123456', role: 'operator' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('op@sced.com');
  });

  test('T28.2 — deve retornar 400 quando nome está ausente', async () => {
    const res = await request(app)
      .post('/api/register')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ email: 'op@sced.com', password: '123456' });
    expect(res.status).toBe(400);
  });

  test('T28.2 — deve retornar 409 para email duplicado', async () => {
    mockQuery.mockResolvedValueOnce([[{ id: 1 }]]);
    const res = await request(app)
      .post('/api/register')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ name: 'Outro', email: 'admin@sced.com', password: '123456' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/já cadastrado/i);
  });

  test('T28.2 — deve retornar 401 sem token', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Hack', email: 'h@x.com', password: '123456' });
    expect(res.status).toBe(401);
  });

  test('T28.2 — deve retornar 400 para senha com menos de 6 caracteres', async () => {
    const res = await request(app)
      .post('/api/register')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ name: 'Teste', email: 'teste@sced.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/senha/i);
  });
});

// ============================================================
// T22 — DOCUMENTOS
// ============================================================
describe('POST /api/documents', () => {
  beforeEach(() => mockQuery.mockReset());

  test('T28.1 — deve criar documento e retornar protocolo', async () => {
    mockQuery.mockResolvedValueOnce([[{ last_sequence: 0 }]]); // sequência para protocolo
    mockQuery.mockResolvedValueOnce([{ insertId: 10 }]); // INSERT documento
    mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);  // INSERT histórico

    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({
        received_date: '2025-06-01',
        sender: 'Ministério da Fazenda',
        subject: 'Solicitação de informações fiscais'
      });

    expect(res.status).toBe(201);
    expect(res.body.protocol).toMatch(/^SCED-\d{8}-\d{4}$/);
    expect(res.body.id).toBe(10);
  });

  test('deve tentar um novo protocolo quando houver colisão', async () => {
    const duplicateError = Object.assign(new Error('Duplicate entry'), {
      code: 'ER_DUP_ENTRY',
      errno: 1062
    });

    mockQuery.mockResolvedValueOnce([[{ last_sequence: 0 }]]);
    mockQuery.mockRejectedValueOnce(duplicateError);
    mockQuery.mockResolvedValueOnce([[{ last_sequence: 1 }]]);
    mockQuery.mockResolvedValueOnce([{ insertId: 11 }]);
    mockQuery.mockResolvedValueOnce([{ insertId: 2 }]);

    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({
        received_date: '2025-06-01',
        sender: 'Secretaria de Administração',
        subject: 'Documento enviado simultaneamente'
      });

    expect(res.status).toBe(201);
    expect(res.body.protocol).toMatch(/-0002$/);
    expect(res.body.id).toBe(11);
  });

  test('T28.2 — deve retornar 400 sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ sender: 'Alguém' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/obrigatório/i);
  });

  test('T28.2 — deve retornar 401 sem token', async () => {
    const res = await request(app)
      .post('/api/documents')
      .send({ received_date: '2025-06-01', sender: 'X', subject: 'Assunto Y' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/documents', () => {
  beforeEach(() => mockQuery.mockReset());

  test('T28.1 — deve retornar lista paginada de documentos', async () => {
    const fakeDocs = [{
      id: 1, protocol: 'SCED-20250601-0001', sender: 'MF',
      subject: 'Ofício teste', status: 'recebido',
      type_name: 'Ofício', received_date: '2025-06-01', creator_name: 'Admin'
    }];
    mockQuery.mockResolvedValueOnce([fakeDocs]);
    mockQuery.mockResolvedValueOnce([[{ total: 1 }]]);

    const res = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.documents)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  test('T28.2 — deve retornar 401 sem token', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(401);
  });
});

// ============================================================
// T23 — ALTERAÇÃO DE STATUS
// ============================================================
describe('PUT /api/documents/:id/status', () => {
  beforeEach(() => mockQuery.mockReset());

  test('T28.1 — deve atualizar status e registrar histórico', async () => {
    mockQuery.mockResolvedValueOnce([[{ id: 1, status: 'recebido' }]]);
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    mockQuery.mockResolvedValueOnce([{ insertId: 5 }]);

    const res = await request(app)
      .put('/api/documents/1/status')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ status: 'em_analise', notes: 'Em avaliação técnica' });

    expect(res.status).toBe(200);
    expect(res.body.old_status).toBe('recebido');
    expect(res.body.new_status).toBe('em_analise');
  });

  test('T28.2 — deve retornar 400 para status inválido', async () => {
    const res = await request(app)
      .put('/api/documents/1/status')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ status: 'status_invalido' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/inválido/i);
  });

  test('T28.2 — deve retornar 404 para documento inexistente', async () => {
    mockQuery.mockResolvedValueOnce([[]]);
    const res = await request(app)
      .put('/api/documents/999/status')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ status: 'finalizado' });
    expect(res.status).toBe(404);
  });

  test('T28.2 — deve retornar 400 ao definir o mesmo status atual', async () => {
    mockQuery.mockResolvedValueOnce([[{ id: 1, status: 'recebido' }]]);
    const res = await request(app)
      .put('/api/documents/1/status')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ status: 'recebido' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/já possui/i);
  });
});

// ============================================================
// TIPOS DE DOCUMENTO
// ============================================================
describe('GET /api/document-types', () => {
  beforeEach(() => mockQuery.mockReset());

  test('T28.1 — deve retornar lista de tipos ativos', async () => {
    mockQuery.mockResolvedValueOnce([[
      { id: 1, name: 'Ofício', description: 'Documento oficial', active: 1 }
    ]]);
    const res = await request(app)
      .get('/api/document-types')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Ofício');
  });
});

describe('POST /api/document-types', () => {
  beforeEach(() => mockQuery.mockReset());

  test('T28.1 — deve criar tipo de documento (admin)', async () => {
    mockQuery.mockResolvedValueOnce([[]]); // não existe
    mockQuery.mockResolvedValueOnce([{ insertId: 6 }]);

    const res = await request(app)
      .post('/api/document-types')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ name: 'Decreto', description: 'Ato normativo' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Decreto');
  });

  test('T28.2 — deve retornar 409 para nome duplicado', async () => {
    mockQuery.mockResolvedValueOnce([[{ id: 1 }]]);
    const res = await request(app)
      .post('/api/document-types')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ name: 'Ofício' });
    expect(res.status).toBe(409);
  });

  test('T28.2 — deve retornar 400 sem nome', async () => {
    const res = await request(app)
      .post('/api/document-types')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ description: 'sem nome' });
    expect(res.status).toBe(400);
  });
});

// ============================================================
// RELATÓRIOS
// ============================================================
describe('GET /api/reports', () => {
  beforeEach(() => mockQuery.mockReset());

  test('T28.1 — deve retornar relatório com totais por status', async () => {
    mockQuery.mockResolvedValueOnce([[
      { protocol: 'SCED-20250601-0001', tipo: 'Ofício', remetente: 'MF', assunto: 'Teste',
        status: 'recebido', data_recebimento: '2025-06-01', registrado_por: 'Admin',
        data_registro: '2025-06-01', setor_destino: '', responsavel: '' },
      { protocol: 'SCED-20250601-0002', tipo: 'Memorando', remetente: 'RH', assunto: 'Comunicado',
        status: 'finalizado', data_recebimento: '2025-06-01', registrado_por: 'Admin',
        data_registro: '2025-06-01', setor_destino: '', responsavel: '' }
    ]]);

    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body.totais.total).toBe(2);
    expect(res.body.totais.por_status.recebido).toBe(1);
    expect(res.body.totais.por_status.finalizado).toBe(1);
    expect(Array.isArray(res.body.documentos)).toBe(true);
  });

  test('T28.1 — deve exportar CSV com cabeçalho correto', async () => {
    mockQuery.mockResolvedValueOnce([[{
      protocol: 'SCED-20250601-0001', tipo: 'Ofício', remetente: 'MF',
      assunto: 'Teste', status: 'recebido', data_recebimento: '2025-06-01',
      registrado_por: 'Admin', data_registro: '2025-06-01',
      setor_destino: '', responsavel: ''
    }]]);

    const res = await request(app)
      .get('/api/reports?format=csv')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('Protocolo');
    expect(res.text).toContain('SCED-20250601-0001');
  });

  test('T28.2 — deve retornar 401 sem token', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(401);
  });
});
