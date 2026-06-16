const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/reports
router.get('/reports', authenticateToken, async (req, res) => {
  const { status, type, start_date, end_date, format } = req.query;

  try {
    let query = `
      SELECT
        d.protocol,
        dt.name   AS tipo,
        d.sender  AS remetente,
        d.subject AS assunto,
        d.destination_sector AS setor_destino,
        d.responsible        AS responsavel,
        d.status,
        d.received_date AS data_recebimento,
        u.name AS registrado_por,
        d.created_at AS data_registro
      FROM documents d
      LEFT JOIN document_types dt ON d.type_id = dt.id
      LEFT JOIN users u ON d.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status)     { query += ' AND d.status = ?';          params.push(status); }
    if (type)       { query += ' AND d.type_id = ?';         params.push(type); }
    if (start_date) { query += ' AND d.received_date >= ?';  params.push(start_date); }
    if (end_date)   { query += ' AND d.received_date <= ?';  params.push(end_date); }

    query += ' ORDER BY d.received_date DESC, d.protocol';

    const [rows] = await db.promise().query(query, params);

    if (format === 'csv') {
      const cabecalho = [
        'Protocolo', 'Tipo', 'Remetente', 'Assunto',
        'Setor Destino', 'Responsável', 'Status',
        'Data Recebimento', 'Registrado Por', 'Data Registro'
      ].join(';');

      const linhas = rows.map(row => [
        row.protocol,
        row.tipo || '',
        row.remetente,
        `"${(row.assunto || '').replace(/"/g, '""')}"`,
        row.setor_destino || '',
        row.responsavel || '',
        row.status,
        row.data_recebimento ? new Date(row.data_recebimento).toLocaleDateString('pt-BR') : '',
        row.registrado_por || '',
        row.data_registro ? new Date(row.data_registro).toLocaleString('pt-BR') : ''
      ].join(';'));

      const csv = [cabecalho, ...linhas].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio_sced_${Date.now()}.csv"`);
      return res.send('\uFEFF' + csv);
    }

    const totais = {
      total: rows.length,
      por_status: {
        recebido:    rows.filter(r => r.status === 'recebido').length,
        em_analise:  rows.filter(r => r.status === 'em_analise').length,
        encaminhado: rows.filter(r => r.status === 'encaminhado').length,
        finalizado:  rows.filter(r => r.status === 'finalizado').length
      }
    };

    res.json({ totais, documentos: rows });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;