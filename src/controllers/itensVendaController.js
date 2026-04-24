const itensVendaService = require("../services/itensVendaService");

// Adicionar item
async function adicionarItem(req, res) {
    try {
        const { venda_id, produto_id, quantidade } = req.body;

        if (venda_id == null || produto_id == null || quantidade == null) {
            return res.status(400).json({
                erro: "venda_id, produto_id e quantidade são obrigatórios"
            });
        }

        const result = await itensVendaService.adicionarItem(
            venda_id,
            produto_id,
            quantidade
        );

        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ erro: error.message });
    }
}

// Remover item
async function removerItem(req, res) {
    try {
        const { id } = req.params;

        const result = await itensVendaService.removerItem(id);

        return res.json(result);
    } catch (error) {
        return res.status(400).json({ erro: error.message });
    }
}

module.exports = {
    adicionarItem,
    removerItem
};