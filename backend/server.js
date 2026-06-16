const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 3001;

db.promise().query('SELECT 1')
  .then(() => {
    console.log('Conectado ao banco de dados MySQL');
    app.listen(PORT, () => {
      console.log(`Servidor SCED rodando na porta ${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    process.exit(1);
  });