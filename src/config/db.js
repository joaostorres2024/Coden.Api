const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Conectado ao SQL Server (Azure)');
    return pool;
  })
  .catch(err => {
    console.error('❌ Erro ao conectar no banco:', err);
    process.exit(1);
  });

module.exports = { sql, poolPromise };