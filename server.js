const express = require("express");
const app = express();
require("dotenv").config();
const cors = require('cors')

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  next()
})

app.use(cors({
  origin: '*',
  credentials: false
}))

app.use(express.json());

// ROTAS
const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const vendasRoutes = require("./src/routes/vendasRoutes");
const clienteRoutes = require("./src/routes/clienteRoutes");
const itensVendaRoutes = require("./src/routes/itensVendaRoutes");

app.use("/auth", authRoutes);
app.use("/api", productRoutes)
app.use("/api", vendasRoutes);
app.use("/api", clienteRoutes);
app.use("/api", itensVendaRoutes);

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
  res.send("API Rodando com Sucesso!");
});

// SERVIDOR POR ÚLTIMO
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Rodando na Porta ${PORT}`);
});
