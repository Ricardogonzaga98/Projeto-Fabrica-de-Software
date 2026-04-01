// Tests para o Sistema de Controle de Entrada de Documentos

const request = require('supertest');
const app = require('../backend/server');

describe('API Tests', () => {
  test('GET /api/health should return status OK', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  test('POST /api/login should handle login', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'password' });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login endpoint');
  });

  test('GET /api/documents should return documents list', async () => {
    const response = await request(app).get('/api/documents');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Documents list');
  });
});