const clienteService = require("../services/clienteService");

// Criar cliente
async function criarCliente(req, res) {
    try {
        const { nome, cpf, cnpj, cep } = req.body;

        if (!nome) {
            return res.status(400).json({
                erro: "Nome é obrigatório"
            });
        }

        const result = await clienteService.criarCliente(
            nome,
            cpf,
            cnpj,
            cep
        );

        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ erro: error.message });
    }
}

// Listar
async function listarClientes(req, res) {
    try {
        const clientes = await clienteService.listarClientes();
        return res.json(clientes);
    } catch (error) {
        return res.status(500).json({ erro: error.message });
    }
}

module.exports = {
    criarCliente,
    listarClientes
};