require('dotenv').config();
const app = require('./app');
const db = require('./config/database');
const { waitForDatabase } = require('./config/startup');

const PORT = process.env.PORT || 3001;
const DB_CONNECT_ATTEMPTS = Number(process.env.DB_CONNECT_ATTEMPTS) || 10;
const DB_CONNECT_DELAY_MS = Number(process.env.DB_CONNECT_DELAY_MS) || 1000;

async function startServer() {
  await waitForDatabase(db, {
    attempts: DB_CONNECT_ATTEMPTS,
    delayMs: DB_CONNECT_DELAY_MS
  });

  app.listen(PORT, () => {
    console.log(`Servidor SCED rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log('Banco de dados conectado');
  });
}

startServer().catch(error => {
  console.error('Não foi possível conectar ao banco de dados:', error.message);
  process.exitCode = 1;
});
