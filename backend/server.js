const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

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
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  const validRoles = ['admin', 'operator'];
  const userRole = validRoles.includes(role) ? role : 'operator';

  try {
    // Verificar se email já existe
    const [existing] = await db.promise().query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir usuário
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Document routes
app.get('/api/documents', authenticateToken, async (req, res) => {
  const { protocol, sender, type, status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT d.*, dt.name as type_name, u.name as creator_name
      FROM documents d
      LEFT JOIN document_types dt ON d.type_id = dt.id
      LEFT JOIN users u ON d.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (protocol) {
      query += ' AND d.protocol LIKE ?';
      params.push(`%${protocol}%`);
    }
    if (sender) {
      query += ' AND d.sender LIKE ?';
      params.push(`%${sender}%`);
    }
    if (type) {
      query += ' AND d.type_id = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.promise().query(query, params);

    // Contar total
    const countQuery = query.replace('SELECT d.*, dt.name as type_name, u.name as creator_name', 'SELECT COUNT(*) as total');
    const limitIndex = countQuery.indexOf(' ORDER BY');
    const countQueryClean = countQuery.substring(0, limitIndex);
    const [countResult] = await db.promise().query(countQueryClean, params.slice(0, -2));
    const total = countResult[0].total;

    res.json({
      documents: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/documents/:id/history', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.promise().query(
      `SELECT h.*, u.name as user_name 
       FROM document_history h 
       LEFT JOIN users u ON h.user_id = u.id 
       WHERE h.document_id = ? 
       ORDER BY h.created_at DESC`,
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Document types
app.get('/api/document-types', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM document_types ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar tipos de documento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});