const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sced_db'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando' });
});

// User authentication routes
app.post('/api/login', (req, res) => {
  // Implementar login
  res.json({ message: 'Login endpoint' });
});

app.post('/api/register', (req, res) => {
  // Implementar registro
  res.json({ message: 'Register endpoint' });
});

// Document routes
app.get('/api/documents', (req, res) => {
  // Implementar listagem de documentos
  res.json({ message: 'Documents list' });
});

app.post('/api/documents', (req, res) => {
  // Implementar criação de documento
  res.json({ message: 'Document created' });
});

// Document types
app.get('/api/document-types', (req, res) => {
  // Implementar tipos de documento
  res.json({ message: 'Document types' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});