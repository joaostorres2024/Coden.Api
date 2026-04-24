const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

async function login(email, senha) {
    const [rows] = await db.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [email]
    );

    const user = rows[0];

    if (!user) {
        throw new Error("Usuário não encontrado");
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
        throw new Error("Senha inválida");
    }

    const token = jwt.sign(
    { 
        id: user.id, 
        email: user.email,
        estabelecimento_id: user.estabelecimento_id
    },
    process.env.JWT_SECRET, { expiresIn: "1d" });

        return token;
    }

async function createUser({ nome, email, senha }) {
    const senhaHash = await bcrypt.hash(senha, 10);

    await db.query(
        "INSERT INTO usuarios (nome, email, senha, estabelecimento_id) VALUES (?, ?, ?, ?)",
        [nome, email, senhaHash, 1]
    );
}

module.exports = { login, createUser };