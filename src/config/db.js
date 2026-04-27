const sql = require("mssql");
require("dotenv").config();

let poolPromise = null;

function getPool() {
    if (!poolPromise) {
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
        poolPromise = sql.connect(config);
    }
    return poolPromise;
}

async function query(queryString, params = []) {
    const pool = await getPool();
    const request = pool.request();
    params.forEach((p, i) => request.input(`param${i}`, p));
    const result = await request.query(queryString);
    return result.recordset;
}

async function request() {
    const pool = await getPool();
    return pool.request();
}

module.exports = { query, getPool, request, sql };