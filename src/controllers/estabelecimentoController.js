const estabelecimentoService = require('../services/estabelecimentoService')

async function buscar(req, res) {
  try {
    const result = await estabelecimentoService.buscarEstabelecimento(req.user.estabelecimento_id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function atualizar(req, res) {
  try {
    const result = await estabelecimentoService.atualizarEstabelecimento(req.user.estabelecimento_id, req.body)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function listar(req, res) {
  try {
    const { nome, cnpj, cep } = req.query
    const result = await estabelecimentoService.listarEstabelecimentos({ nome, cnpj, cep })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { buscar, atualizar, listar }