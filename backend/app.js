const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const logger = require('./middleware/logger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

const authRoutes         = require('./routes/auth');
const documentRoutes     = require('./routes/documents');
const documentTypeRoutes = require('./routes/documentTypes');
const reportRoutes       = require('./routes/reports');

app.use('/api', authRoutes);
app.use('/api', documentRoutes);
app.use('/api', documentTypeRoutes);
app.use('/api', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando', version: '1.0.0' });
});

// Serve o frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

module.exports = app;