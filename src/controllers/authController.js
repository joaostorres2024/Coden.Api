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
        const { email, senha } = req.body;
        const token = await authService.login(email, senha);

        res.json({ token });
    } catch (err) {
        console.error(err); 
        res.status(400).send(err.message);
    }
}

module.exports = { register, login };