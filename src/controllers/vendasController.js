const vendasService = require('../services/vendasService')

async function criarVendaComItens(req, res) {
  try {
    const { cliente_id, itens, forma_pagamento, desconto, observacoes } = req.body
    const estabelecimento_id = req.user.estabelecimento_id
    const result = await vendasService.criarVendaComItens(estabelecimento_id, cliente_id, itens || [], forma_pagamento || 'pendente', desconto, observacoes)
    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function listarVendas(req, res) {
  try {
    const estabelecimento_id = req.user.estabelecimento_id
    const vendas = await vendasService.listarVendas(estabelecimento_id)
    res.json(vendas)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function buscarVendaPorId(req, res) {
  try {
    const estabelecimento_id = req.user.estabelecimento_id
    const venda = await vendasService.buscarVendaPorId(Number(req.params.id), estabelecimento_id)
    res.json(venda)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

async function cancelarVenda(req, res) {
  try {
    const estabelecimento_id = req.user.estabelecimento_id
    const result = await vendasService.cancelarVenda(Number(req.params.id), estabelecimento_id)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function finalizarVenda(req, res) {
  try {
    const { forma_pagamento } = req.body
    const estabelecimento_id = req.user.estabelecimento_id
    await vendasService.finalizarVenda(Number(req.params.id), forma_pagamento, estabelecimento_id)
    res.json({ message: 'Venda finalizada com sucesso!' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = { criarVendaComItens, listarVendas, buscarVendaPorId, cancelarVenda, finalizarVenda }