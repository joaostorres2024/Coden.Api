const vendasService = require("../services/vendasService");

// Criar venda
async function criarVenda(req, res) {
    try {
        const usuarioId = req.body.usuario_id;
        const clienteId = req.body.cliente_id;

        if (usuarioId == null || clienteId == null) {
            return res.status(400).json({
                erro: "usuario_id e cliente_id são obrigatórios"
            });
        }

        const result = await vendasService.criarVenda(
            usuarioId,
            clienteId
        );

        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ erro: error.message });
    }
}

// Listar
async function listarVendas(req, res) {
    try {
        const vendas = await vendasService.listarVendas();
        return res.json(vendas);
    } catch (error) {
        return res.status(500).json({ erro: error.message });
    }
}

// Buscar por ID
async function buscarVendaPorId(req, res) {
    try {
        const { id } = req.params;
        const venda = await vendasService.buscarVendaPorId(id);
        return res.json(venda);
    } catch (error) {
        return res.status(404).json({ erro: error.message });
    }
}

// Atualizar status
async function atualizarStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await vendasService.atualizarStatus(id, status);
        return res.json(result);
    } catch (error) {
        return res.status(400).json({ erro: error.message });
    }
}

// Deletar
async function deletarVenda(req, res) {
    try {
        const { id } = req.params;
        const result = await vendasService.deletarVenda(id);
        return res.json(result);
    } catch (error) {
        return res.status(404).json({ erro: error.message });
    }
}

async function criarVendaComItens(req, res) {
    try {
        const { usuario_id, cliente_id, itens } = req.body;

        if (!usuario_id || !cliente_id || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({
                erro: "usuario_id, cliente_id e itens são obrigatórios"
            });
        }

        const result = await vendasService.criarVendaComItens(
            usuario_id,
            cliente_id,
            itens
        );

        return res.status(201).json(result);

    } catch (error) {
        return res.status(400).json({ erro: error.message });
    }
}

async function finalizarVenda(req, res) {
    try {
        const { id } = req.params;

        const result = await vendasService.finalizarVenda(id);

        return res.json(result);

    } catch (error) {
        return res.status(400).json({ erro: error.message });
    }
}

async function cancelarVenda(req, res) {
    try {
        const { id } = req.params;

        const result = await vendasService.cancelarVenda(id);

        return res.json(result);

    } catch (error) {
        return res.status(400).json({ erro: error.message });
    }
}

module.exports = {
    criarVenda,
    listarVendas,
    buscarVendaPorId,
    atualizarStatus,
    deletarVenda,
    criarVendaComItens,
    finalizarVenda,
    cancelarVenda
};