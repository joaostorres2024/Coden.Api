const authService = require("../services/authService");

async function register(req, res) {
    try {
        await authService.createUser(req.body);
        res.status(201).send("Usuário criado");
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
}

async function login(req, res) {
    try {
        const { usuario, senha } = req.body;
        const token = await authService.login(usuario, senha);

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
}

async function solicitarCodigo(req, res) {
    try {
        const { usuario } = req.body;

        if (!usuario) {
            return res.status(400).send("Usuário é obrigatório");
        }

        await authService.solicitarCodigoRecuperacao(usuario);

        // resposta genérica sempre, existindo o usuário ou não (evita enumeration)
        res.send("Se o usuário existir, um código foi enviado ao e-mail cadastrado.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao solicitar código");
    }
}

async function validarCodigo(req, res) {
    try {
        const { usuario, codigo } = req.body;

        if (!usuario || !codigo) {
            return res.status(400).send("Usuário e código são obrigatórios");
        }

        const valido = await authService.validarCodigoRecuperacao(usuario, codigo);
        res.json({ valido });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao validar código");
    }
}

async function redefinirSenha(req, res) {
    try {
        const { usuario, codigo, novaSenha } = req.body;

        if (!usuario || !codigo || !novaSenha) {
            return res.status(400).send("Campos obrigatórios ausentes");
        }

        if (novaSenha.length < 6) {
            return res.status(400).send("A senha deve ter ao menos 6 caracteres");
        }

        await authService.redefinirSenha(usuario, codigo, novaSenha);
        res.send("Senha redefinida com sucesso");
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
}

module.exports = {
    register,
    login,
    solicitarCodigo,
    validarCodigo,
    redefinirSenha
};
