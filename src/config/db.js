const sql = require("mssql");
require("dotenv").config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

const poolPromise = sql.connect(config);

async function query(queryString, params = []) {
    const pool = await poolPromise;
    const request = pool.request();
    params.forEach((p, i) => request.input(`param${i}`, p));
    const result = await request.query(queryString);
    return result.recordset;
}

module.exports = { query, poolPromise, sql };