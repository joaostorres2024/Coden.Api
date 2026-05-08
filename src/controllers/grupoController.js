const grupoService = require('../services/grupoService')

async function listarGrupos(req, res) {
  try {
    const grupos = await grupoService.listarGrupos(req.user.estabelecimento_id)
    res.json(grupos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function criarGrupo(req, res) {
  try {
    const { nome } = req.body
    if (!nome) return res.status(400).json({ error: 'Nome do grupo obrigatório' })
    const grupo = await grupoService.criarGrupo(nome, req.user.estabelecimento_id)
    res.status(201).json(grupo)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function atualizarGrupo(req, res) {
  try {
    const { nome } = req.body
    const result = await grupoService.atualizarGrupo(Number(req.params.id), nome, req.user.estabelecimento_id)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function deletarGrupo(req, res) {
  try {
    const result = await grupoService.deletarGrupo(Number(req.params.id), req.user.estabelecimento_id)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = { listarGrupos, criarGrupo, atualizarGrupo, deletarGrupo }