const express = require("express");
const app = express();
require("dotenv").config();

const cors = require('cors')

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}))

app.use(express.json());

// ROTAS
const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/produtosRoutes");

app.use("/auth", authRoutes);
app.use(productRoutes);

// TESTE DE CONEXÃO
const { poolPromise } = require("./src/config/db");

async function testarConexao() {
    try {
        const pool = await poolPromise;
        await pool.request().query("SELECT 1 as test");
        console.log("Banco conectado com Sucesso!");
    } catch (err) {
        console.error("Erro ao conectar ", err);
    }
}

testarConexao();

// ROTA BASE
app.get("/", (req, res) => {
  res.send("API Rodando com Sucesso!");
});

// SERVIDOR POR ÚLTIMO
app.listen(3000, () => {
  console.log("API Rodando na Porta 3000");
});