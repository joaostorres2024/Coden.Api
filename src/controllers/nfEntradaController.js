const nfEntradaService = require('../services/nfEntradaService')

async function criar(req, res) {
  try {
    const estabelecimento_id = req.user.estabelecimento_id
    const result = await nfEntradaService.criarNfEntrada({ estabelecimento_id, ...req.body })
    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function listar(req, res) {
  try {
    const result = await nfEntradaService.listarNfEntrada(req.user.estabelecimento_id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function buscar(req, res) {
  try {
    const result = await nfEntradaService.buscarNfEntrada(Number(req.params.id), req.user.estabelecimento_id)
    res.json(result)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

module.exports = { criar, listar, buscar }