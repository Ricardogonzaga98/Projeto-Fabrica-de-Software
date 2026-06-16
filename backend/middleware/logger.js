const fs   = require('fs');
const path = require('path');

// Garante que a pasta logs/ existe
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFile = path.join(logDir, 'sced.log');

/**
 * Middleware de log por requisição (RNF06).
 * Registra: data/hora, método, rota, status HTTP, tempo de resposta e IP.
 * Grava em backend/logs/sced.log e também no console.
 */
function logger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms - ${req.ip}\n`;

    console.log(line.trim());
    fs.appendFile(logFile, line, err => {
      if (err) console.error('Erro ao gravar log:', err);
    });
  });

  next();
}

module.exports = logger;