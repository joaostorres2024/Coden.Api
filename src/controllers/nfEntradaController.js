const nfEntradaService = require("../services/nfEntradaService");

async function criarNota(req, res) {
  try {
    const { estabelecimento_id } = req.user;

    const nota = await nfEntradaService.criarNota({
      ...req.body,
      estabelecimento_id
    });

    return res.status(201).json({
      message: "Nota criada com sucesso",
      nota
    });
  } catch (error) {
    return res.status(400).json({ erro: error.message });
  }
}

async function listarNotas(req, res) {
  try {
    const { estabelecimento_id } = req.user;

    const notas = await nfEntradaService.listarNotas({
      estabelecimento_id
    });

    return res.json(notas);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function buscarNota(req, res) {
  try {
    const { estabelecimento_id } = req.user;
    const id = Number(req.params.id);

    const nota = await nfEntradaService.buscarNota({
      id,
      estabelecimento_id
    });

    return res.json(nota);
  } catch (error) {
    return res.status(404).json({ erro: error.message });
  }
}

async function cancelarNota(req, res) {
  try {
    const { estabelecimento_id } = req.user;
    const id = Number(req.params.id);

    const nota = await nfEntradaService.cancelarNota({
      id,
      estabelecimento_id
    });

    return res.json({
      message: "Nota cancelada com sucesso",
      nota
    });
  } catch (error) {
    return res.status(400).json({ erro: error.message });
  }
}

module.exports = {
  criarNota,
  listarNotas,
  buscarNota,
  cancelarNota
};