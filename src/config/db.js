// db.js — PostgreSQL (Neon) mantendo a interface antiga do mssql:
//   query(sql, params), getPool(), request(), sql (tipos, Request, Transaction)
// Depois de trocar este arquivo:  npm uninstall mssql && npm install pg
const { Pool, types } = require("pg");
require("dotenv").config();

// ---- Tipos: o mssql devolvia numeros e datas em UTC; o pg devolve strings ----
types.setTypeParser(1700, (v) => parseFloat(v)); // numeric/decimal -> number
types.setTypeParser(20, (v) => parseInt(v, 10)); // bigint (COUNT, SUM de int) -> number
types.setTypeParser(1114, (v) => new Date(v.replace(" ", "T") + "Z")); // timestamp -> Date (UTC)
types.setTypeParser(1082, (v) => new Date(v + "T00:00:00Z")); // date -> Date (UTC)

let pool = null;
let poolPromise = null;

function criarPool() {
    const base = process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
              host: process.env.DB_HOST,
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
              port: parseInt(process.env.DB_PORT) || 5432,
          };
    return new Pool({ ...base, ssl: { rejectUnauthorized: false }, max: 10 });
}

// ---- Converte o T-SQL mais comum para PostgreSQL ----
const TIPOS_SQL = /^(int|integer|bigint|smallint|decimal|numeric|float|real|varchar|char|text|date|datetime|timestamp|time|bit|boolean|money)$/i;

function adaptar(texto) {
    let s = texto
        .replace(/\[dbo\]\./gi, "")
        .replace(/\[(\w+)\]/g, "$1")
        .replace(/\bGETDATE\(\)/gi, "NOW()")
        .replace(/\bISNULL\(/gi, "COALESCE(")
        .replace(/\bLEN\(/gi, "LENGTH(")
        .replace(/\bLIKE\b/gi, "ILIKE"); // SQL Server era case-insensitive

    // DATEADD(day, n, NOW()) -> (NOW() + (n) * INTERVAL '1 day')
    s = s.replace(
        /DATEADD\(\s*(day|week|month|year|hour|minute)s?\s*,\s*([^,]+?)\s*,\s*(NOW\(\)|[\w.@]+)\s*\)/gi,
        (m, unit, n, base) => `(${base} + (${n}) * INTERVAL '1 ${unit.toLowerCase()}')`
    );

    // Aliases em camelCase: Postgres coloca em minusculas, entao aspas preservam o nome
    s = s.replace(/\bAS\s+([A-Za-z_]\w*)/g, (m, alias) =>
        /[a-z]/.test(alias) && /[A-Z]/.test(alias) && !TIPOS_SQL.test(alias) ? `AS "${alias}"` : m
    );

    // OUTPUT INSERTED.col -> RETURNING col (no fim)
    let returning = "";
    s = s.replace(/\s+OUTPUT\s+INSERTED\.(\w+|\*)/i, (m, col) => {
        returning = ` RETURNING ${col}`;
        return "";
    });

    // SELECT TOP n -> LIMIT n (no fim)
    let limite = "";
    s = s.replace(/\bSELECT\s+(DISTINCT\s+)?TOP\s*\(?\s*(\d+|@\w+)\s*\)?\s+/i, (m, dist, n) => {
        limite = ` LIMIT ${n}`;
        return `SELECT ${dist || ""}`;
    });

    if (returning || limite) s = s.replace(/;\s*$/, "") + returning + limite;
    return s;
}

// ---- Parametros nomeados (@nome) -> posicionais ($1, $2...) ----
function prepararParametros(texto, params) {
    const ordem = [];
    const sqlFinal = adaptar(texto).replace(/(?<![\w@])@(\w+)/g, (m, nome) => {
        if (!(nome in params)) return m;
        let i = ordem.indexOf(nome);
        if (i < 0) {
            ordem.push(nome);
            i = ordem.length - 1;
        }
        return "$" + (i + 1);
    });
    const valores = ordem.map((n) => {
        const v = params[n];
        if (v === undefined) return null;
        if (v instanceof Date) return v.toISOString().replace("Z", ""); // timestamp em UTC
        return v;
    });
    return { sqlFinal, valores };
}

class Request {
    constructor(tx) {
        this.tx = tx && tx.client !== undefined ? tx : null;
        this.params = {};
    }
    // input(nome, valor)  ou  input(nome, tipo, valor)
    input(nome, ...resto) {
        this.params[nome] = resto.length >= 2 ? resto[1] : resto[0];
        return this;
    }
    async query(texto) {
        const { sqlFinal, valores } = prepararParametros(texto, this.params);
        const executor = this.tx ? this.tx.client : pool;
        const r = await executor.query(sqlFinal, valores);
        const linhas = r.rows || [];
        return { recordset: linhas, recordsets: [linhas], rowsAffected: [r.rowCount] };
    }
}

class Transaction {
    constructor() {
        this.client = null;
    }
    async begin() {
        await getPool();
        this.client = await pool.connect();
        await this.client.query("BEGIN");
        return this;
    }
    async commit() {
        await this.client.query("COMMIT");
        this.client.release();
        this.client = null;
    }
    async rollback() {
        if (!this.client) return;
        try {
            await this.client.query("ROLLBACK");
        } finally {
            this.client.release();
            this.client = null;
        }
    }
    request() {
        return new Request(this);
    }
}

const poolCompat = {
    request: () => new Request(),
    transaction: () => new Transaction(),
    close: () => pool.end(),
};

function getPool() {
    if (!poolPromise) {
        pool = criarPool();
        poolPromise = pool
            .query("SELECT 1")
            .then(() => poolCompat)
            .catch((e) => {
                poolPromise = null;
                throw e;
            });
    }
    return poolPromise;
}

// sql.Int, sql.VarChar(100), sql.MAX etc. viram "no-op"; Request/Transaction sao reais
const sql = new Proxy(
    { Request, Transaction, connect: getPool },
    { get: (alvo, prop) => (prop in alvo ? alvo[prop] : () => prop) }
);

async function query(queryString, params = []) {
    await getPool();
    const request = new Request();
    params.forEach((p, i) => request.input(`param${i}`, p));
    const result = await request.query(queryString);
    return result.recordset;
}

async function request() {
    await getPool();
    return new Request();
}

module.exports = { query, getPool, request, sql, _adaptar: adaptar, _preparar: prepararParametros };