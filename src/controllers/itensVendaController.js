const itensVendaService = require('../services/itensVendaService')

async function adicionarItem(req, res) {
  try {
    const { venda_id, produto_id, quantidade, desconto } = req.body
    const estabelecimento_id = req.user.estabelecimento_id
    if (!venda_id || !produto_id || !quantidade) return res.status(400).json({ error: 'Informe venda_id, produto_id e quantidade' })
    const result = await itensVendaService.adicionarItem(venda_id, produto_id, quantidade, desconto, estabelecimento_id)
    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function removerItem(req, res) {
  try {
    const estabelecimento_id = req.user.estabelecimento_id
    const result = await itensVendaService.removerItem(Number(req.params.id), estabelecimento_id)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function listarItensDaVenda(req, res) {
  try {
    const estabelecimento_id = req.user.estabelecimento_id
    const itens = await itensVendaService.listarItensDaVenda(Number(req.params.venda_id), estabelecimento_id)
    res.json(itens)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = { adicionarItem, removerItem, listarItensDaVenda }