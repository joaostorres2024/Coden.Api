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
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

const db = {
  query: async (query, params = []) => {
    await poolConnect;
    const request = pool.request();
    params.forEach((param, i) => request.input(`p${i}`, param));
    const queryFormatted = query.replace(/\?/g, (_, i) => `@p${i++}`);
    return request.query(queryFormatted);
  }
};

module.exports = db;