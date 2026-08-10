const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { query, sql } = require("../config/db");
const { enviarCodigoRecuperacao } = require("./emailService");

async function login(usuario, senha) {
    const rows = await query(
        "SELECT * FROM usuarios WHERE usuario = @param0",
        [usuario]
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
            usuario: user.usuario,
            nome: user.nome,
            estabelecimento_id: user.estabelecimento_id
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return token;
}

async function createUser({ nome, usuario, senha }) {
    const senhaHash = await bcrypt.hash(senha, 10)

    const rows = await query(
        "INSERT INTO estabelecimentos (nome) OUTPUT INSERTED.id VALUES (@param0)",
        [nome + ' - Estabelecimento']
    )
    const estabelecimento_id = rows[0].id

    await query(
        "INSERT INTO usuarios (nome, usuario, senha, estabelecimento_id) VALUES (@param0, @param1, @param2, @param3)",
        [nome, usuario, senhaHash, estabelecimento_id]
    )
}

// --- Recuperação de senha ---

async function solicitarCodigoRecuperacao(usuario) {
    const rows = await query(
        `SELECT u.id, u.estabelecimento_id, e.email
         FROM usuarios u
         INNER JOIN estabelecimentos e ON e.id = u.estabelecimento_id
         WHERE u.usuario = @param0`,
        [usuario]
    );

    const user = rows[0];

    // Não revela se o usuário existe ou não — resposta genérica sempre no controller
    if (!user) return;

    if (!user.email) {
        throw new Error("Estabelecimento sem e-mail cadastrado");
    }

    const codigo = crypto.randomInt(100000, 999999).toString(); // 6 dígitos
    const expira = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await query(
        "UPDATE usuarios SET reset_codigo = @param0, reset_expira = @param1 WHERE id = @param2",
        [codigo, expira, user.id]
    );

    await enviarCodigoRecuperacao(user.email, codigo);
}

async function validarCodigoRecuperacao(usuario, codigo) {
    const rows = await query(
        "SELECT id, reset_codigo, reset_expira FROM usuarios WHERE usuario = @param0",
        [usuario]
    );

    const user = rows[0];
    if (!user || !user.reset_codigo) return false;

    const expirado = !user.reset_expira || new Date(user.reset_expira) < new Date();
    if (expirado) return false;

    return user.reset_codigo === codigo;
}

async function redefinirSenha(usuario, codigo, novaSenha) {
    const valido = await validarCodigoRecuperacao(usuario, codigo);

    if (!valido) {
        throw new Error("Código inválido ou expirado");
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await query(
        `UPDATE usuarios
         SET senha = @param0, reset_codigo = NULL, reset_expira = NULL
         WHERE usuario = @param1`,
        [senhaHash, usuario]
    );
}

module.exports = {
    login,
    createUser,
    solicitarCodigoRecuperacao,
    validarCodigoRecuperacao,
    redefinirSenha
};
