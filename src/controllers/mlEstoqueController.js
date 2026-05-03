const mlEstoqueService = require('../services/mlEstoqueService');

async function buscarEstoque(req, res) {
  try {
    const estoque = await mlEstoqueService.buscarEstoque(req.user.id, req.params.itemId);
    res.json(estoque);
  } catch (err) {
    console.error('Erro ao buscar estoque ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function atualizarEstoque(req, res) {
  try {
    const { quantidade } = req.body;
    if (quantidade === undefined || quantidade < 0) {
      return res.status(400).json({ error: 'Quantidade inválida' });
    }
    const resultado = await mlEstoqueService.atualizarEstoque(req.user.id, req.params.itemId, quantidade);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao atualizar estoque ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function buscarEstoqueMultiplos(req, res) {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Informe um array de ids' });
    }
    const estoques = await mlEstoqueService.buscarEstoqueMultiplos(req.user.id, ids);
    res.json(estoques);
  } catch (err) {
    console.error('Erro ao buscar estoques ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function estoquesBaixos(req, res) {
  try {
    const { minimo = 5 } = req.query;
    const resultado = await mlEstoqueService.estoquesBaixos(req.user.id, Number(minimo));
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao buscar estoques baixos ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function atualizarEstoqueMultiplos(req, res) {
  try {
    const { itens } = req.body;
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'Informe um array de itens com item_id e quantidade' });
    }
    const resultados = await mlEstoqueService.atualizarEstoqueMultiplos(req.user.id, itens);
    res.json(resultados);
  } catch (err) {
    console.error('Erro ao atualizar estoques ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

module.exports = {
  buscarEstoque,
  atualizarEstoque,
  buscarEstoqueMultiplos,
  estoquesBaixos,
  atualizarEstoqueMultiplos,
};