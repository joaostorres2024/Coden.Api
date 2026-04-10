const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

// ROTAS
const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");

app.use("/auth", authRoutes);
app.use(productRoutes);

// TESTE DE CONEXÃO
const db = require("./src/config/db");

async function testarConexao() {
    try {
        await db.query("SELECT 1");
        console.log("Banco conectado");
    } catch (err) {
        console.error("Erro ao conectar ", err);
    }
}

testarConexao();

// ROTA BASE
app.get("/", (req, res) => {
  res.send("API de vendas rodando 🚀");
});

// SERVIDOR POR ÚLTIMO
app.listen(3000, () => {
  console.log("rodando porta 3000");
});