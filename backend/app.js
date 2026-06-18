const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const logger = require('./middleware/logger');

const app = express();

app.set('etag', false);
app.use(cors());
app.use(express.json());
app.use(logger);
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const authRoutes         = require('./routes/auth');
const documentRoutes     = require('./routes/documents');
const documentTypeRoutes = require('./routes/documentTypes');
const reportRoutes       = require('./routes/reports');
const processRoutes = require('./routes/processes');

app.use('/api', processRoutes);
app.use('/api', authRoutes);
app.use('/api', documentRoutes);
app.use('/api', documentTypeRoutes);
app.use('/api', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando', version: '1.0.0' });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  next(error);
});

// Serve o frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

module.exports = app;
