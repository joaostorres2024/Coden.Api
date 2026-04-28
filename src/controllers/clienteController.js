const clienteService = require("../services/clienteService");

async function criarCliente(req, res) {
    try {
        const { estabelecimento_id } = req.user
        const cliente = await clienteService.criarCliente({
            ...req.body,
            estabelecimento_id
        })
        return res.status(201).json({ message: "Cliente criado com sucesso", cliente })
    } catch (err) {
        return res.status(500).json({ erro: err.message })
    }
}

async function listarClientes(req, res) {
    try {
        const { estabelecimento_id } = req.user
        const clientes = await clienteService.listarClientes({ estabelecimento_id })
        return res.json(clientes)
    } catch (err) {
        return res.status(500).json({ erro: err.message })
    }
}

async function buscarCliente(req, res) {
    try {
        const { estabelecimento_id } = req.user
        const id = Number(req.params.id)
        const cliente = await clienteService.buscarCliente({ id, estabelecimento_id })
        return res.json(cliente)
    } catch (err) {
        return res.status(404).json({ erro: err.message })
    }
}

async function atualizarCliente(req, res) {
    try {
        const { estabelecimento_id } = req.user
        const id = Number(req.params.id)
        const cliente = await clienteService.atualizarCliente({
            ...req.body,
            id,
            estabelecimento_id
        })
        return res.json({ message: "Cliente atualizado com sucesso", cliente })
    } catch (err) {
        return res.status(400).json({ erro: err.message })
    }
}

async function deletarCliente(req, res) {
    try {
        const { estabelecimento_id } = req.user
        const id = Number(req.params.id)
        await clienteService.deletarCliente({ id, estabelecimento_id })
        return res.json({ message: "Cliente deletado com sucesso" })
    } catch (err) {
        return res.status(400).json({ erro: err.message })
    }
}

module.exports = {
    criarCliente,
    listarClientes,
    buscarCliente,
    atualizarCliente,
    deletarCliente
}