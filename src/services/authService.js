const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query, sql } = require("../config/db");

async function login(email, senha) {
    const rows = await query(
        "SELECT * FROM usuarios WHERE email = @param0",
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
            nome: user.nome,
            estabelecimento_id: user.estabelecimento_id
        },
        process.env.JWT_SECRET, 
        { expiresIn: "1d" }
    );

    return token;
}

async function createUser({ nome, email, senha }) {
    const senhaHash = await bcrypt.hash(senha, 10)

    const rows = await query(
        "INSERT INTO estabelecimentos (nome) OUTPUT INSERTED.id VALUES (@param0)",
        [nome + ' - Estabelecimento']
    )
    const estabelecimento_id = rows[0].id

    await query(
        "INSERT INTO usuarios (nome, email, senha, estabelecimento_id) VALUES (@param0, @param1, @param2, @param3)",
        [nome, email, senhaHash, estabelecimento_id]
    )
}

module.exports = { login, createUser };