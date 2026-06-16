const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/document-types
router.get('/document-types', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM document_types WHERE active = 1 ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/document-types
router.post('/document-types', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Nome do tipo é obrigatório (mínimo 2 caracteres)' });
  }

  try {
    const [existing] = await db.promise().query(
      'SELECT id FROM document_types WHERE name = ? AND active = 1', [name.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Já existe um tipo de documento com este nome' });
    }

    const [result] = await db.promise().query(
      'INSERT INTO document_types (name, description) VALUES (?, ?)',
      [name.trim(), description || null]
    );

    res.status(201).json({ message: 'Tipo criado com sucesso', id: result.insertId, name: name.trim() });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/document-types/:id
router.put('/document-types/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Nome do tipo é obrigatório (mínimo 2 caracteres)' });
  }

  try {
    const [rows] = await db.promise().query(
      'SELECT id FROM document_types WHERE id = ? AND active = 1', [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de documento não encontrado' });
    }

    await db.promise().query(
      'UPDATE document_types SET name = ?, description = ? WHERE id = ?',
      [name.trim(), description || null, req.params.id]
    );

    res.json({ message: 'Tipo atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/document-types/:id (soft delete)
router.delete('/document-types/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT id FROM document_types WHERE id = ? AND active = 1', [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de documento não encontrado' });
    }

    await db.promise().query(
      'UPDATE document_types SET active = 0 WHERE id = ?', [req.params.id]
    );

    res.json({ message: 'Tipo removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;