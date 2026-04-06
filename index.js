require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração básica de CORS para conectar com o front
app.use(cors({
    origin: process.env.FRONTEND_URL, // Permite conexões apenas deste endereço
    credentials: true
}));

app.get('/', (req, res) => {
    res.send('API Conectada');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
