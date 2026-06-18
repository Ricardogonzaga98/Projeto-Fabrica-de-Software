const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Gera protocolo único: PROC-YYYYMMDD-XXXX
async function gerarProtocolo() {
  const hoje = new Date();
  const ano  = hoje.getFullYear();
  const mes  = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia  = String(hoje.getDate()).padStart(2, '0');
  const prefixoData = `${ano}${mes}${dia}`;

  const [rows] = await db.promise().query(
    'SELECT COUNT(*) as total FROM processes WHERE protocol LIKE ?',
    [`PROC-${prefixoData}-%`]
  );

  const sequencial = String(rows[0].total + 1).padStart(4, '0');
  return `PROC-${prefixoData}-${sequencial}`;
}

// GET /api/processes
router.get('/processes', authenticateToken, async (req, res) => {
  const { protocol, sender, type, status, start_date, end_date, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let query = `
      SELECT p.*, dt.name AS type_name, u.name AS creator_name
      FROM processes p
      LEFT JOIN document_types dt ON p.type_id = dt.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (protocol)   { query += ' AND p.protocol LIKE ?';      params.push(`%${protocol}%`); }
    if (sender)     { query += ' AND p.sender LIKE ?';        params.push(`%${sender}%`); }
    if (type)       { query += ' AND p.type_id = ?';          params.push(type); }
    if (status)     { query += ' AND p.status = ?';           params.push(status); }
    if (start_date) { query += ' AND p.received_date >= ?';   params.push(start_date); }
    if (end_date)   { query += ' AND p.received_date <= ?';   params.push(end_date); }

    const countQuery = `SELECT COUNT(*) AS total FROM processes p LEFT JOIN document_types dt ON p.type_id = dt.id WHERE 1=1${query.split('WHERE 1=1')[1]}`;

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows]        = await db.promise().query(query, params);
    const [countResult] = await db.promise().query(countQuery, params.slice(0, -2));
    const total         = countResult[0].total;

    res.json({
      processes: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar processos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/processes/:id
router.get('/processes/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT p.*, dt.name AS type_name, u.name AS creator_name
       FROM processes p
       LEFT JOIN document_types dt ON p.type_id = dt.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar processo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/processes/:id/documents
router.get('/processes/:id/documents', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT d.*, dt.name AS type_name, u.name AS creator_name
       FROM documents d
       LEFT JOIN document_types dt ON d.type_id = dt.id
       LEFT JOIN users u ON d.created_by = u.id
       WHERE d.process_id = ?
       ORDER BY d.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar documentos do processo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/processes
router.post('/processes', authenticateToken, async (req, res) => {
  const { type_id, received_date, sender, subject, destination_sector, responsible, observations } = req.body;

  if (!received_date || !sender || !subject) {
    return res.status(400).json({ error: 'Campos obrigatórios: data de recebimento, remetente e assunto' });
  }
  if (sender.trim().length < 3) {
    return res.status(400).json({ error: 'Remetente deve ter no mínimo 3 caracteres' });
  }
  if (subject.trim().length < 5) {
    return res.status(400).json({ error: 'Assunto deve ter no mínimo 5 caracteres' });
  }

  try {
    const protocol = await gerarProtocolo();

    const [result] = await db.promise().query(
      `INSERT INTO processes
        (protocol, type_id, received_date, sender, subject, destination_sector, responsible, observations, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [protocol, type_id || null, received_date, sender.trim(), subject.trim(),
       destination_sector || null, responsible || null, observations || null, req.user.id]
    );

    await db.promise().query(
      `INSERT INTO process_history (process_id, user_id, action, new_status, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [result.insertId, req.user.id, 'Processo registrado', 'recebido', 'Entrada inicial do processo']
    );

    res.status(201).json({ message: 'Processo registrado com sucesso', id: result.insertId, protocol });
  } catch (error) {
    console.error('Erro ao criar processo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/processes/:id/status
router.put('/processes/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const statusValidos = ['recebido', 'em_analise', 'encaminhado', 'finalizado'];

  if (!status || !statusValidos.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Valores aceitos: ${statusValidos.join(', ')}` });
  }

  try {
    const [rows] = await db.promise().query(
      'SELECT id, status FROM processes WHERE id = ?', [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    const oldStatus = rows[0].status;

    if (oldStatus === status) {
      return res.status(400).json({ error: 'O processo já possui este status' });
    }

    await db.promise().query('UPDATE processes SET status = ? WHERE id = ?', [status, id]);

    await db.promise().query(
      `INSERT INTO process_history (process_id, user_id, action, old_status, new_status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, 'Alteração de status', oldStatus, status, notes || null]
    );

    res.json({ message: 'Status atualizado com sucesso', old_status: oldStatus, new_status: status });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/processes/:id/link-document
router.put('/processes/:id/link-document', authenticateToken, async (req, res) => {
  const { document_id } = req.body;

  if (!document_id) {
    return res.status(400).json({ error: 'document_id é obrigatório' });
  }

  try {
    const [doc] = await db.promise().query(
      'SELECT id FROM documents WHERE id = ?', [document_id]
    );

    if (doc.length === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    await db.promise().query(
      'UPDATE documents SET process_id = ? WHERE id = ?',
      [req.params.id, document_id]
    );

    res.json({ message: 'Documento vinculado ao processo com sucesso' });
  } catch (error) {
    console.error('Erro ao vincular documento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/processes/:id/history
router.get('/processes/:id/history', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT h.*, u.name AS user_name
       FROM process_history h
       LEFT JOIN users u ON h.user_id = u.id
       WHERE h.process_id = ?
       ORDER BY h.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;