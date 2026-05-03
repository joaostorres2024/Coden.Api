const mlProdutoService = require('../services/mlProdutoService');

async function listarProdutos(req, res) {
  try {
    const { offset = 0, limit = 50 } = req.query;
    const resultado = await mlProdutoService.listarProdutos(req.user.id, Number(offset), Number(limit));
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao listar produtos ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function buscarProduto(req, res) {
  try {
    const produto = await mlProdutoService.buscarProduto(req.user.id, req.params.itemId);
    res.json(produto);
  } catch (err) {
    console.error('Erro ao buscar produto ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function editarProduto(req, res) {
  try {
    const resultado = await mlProdutoService.editarProduto(req.user.id, req.params.itemId, req.body);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao editar produto ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function editarDescricao(req, res) {
  try {
    const { descricao } = req.body;
    const resultado = await mlProdutoService.editarDescricao(req.user.id, req.params.itemId, descricao);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao editar descrição ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function pausarProduto(req, res) {
  try {
    const resultado = await mlProdutoService.pausarProduto(req.user.id, req.params.itemId);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao pausar produto ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function ativarProduto(req, res) {
  try {
    const resultado = await mlProdutoService.ativarProduto(req.user.id, req.params.itemId);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao ativar produto ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function encerrarProduto(req, res) {
  try {
    const resultado = await mlProdutoService.encerrarProduto(req.user.id, req.params.itemId);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao encerrar produto ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function atualizarEstoque(req, res) {
  try {
    const { quantidade } = req.body;
    const resultado = await mlProdutoService.atualizarEstoque(req.user.id, req.params.itemId, quantidade);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao atualizar estoque ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function atualizarPreco(req, res) {
  try {
    const { preco } = req.body;
    const resultado = await mlProdutoService.atualizarPreco(req.user.id, req.params.itemId, preco);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao atualizar preço ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function criarProduto(req, res) {
  try {
    const resultado = await mlProdutoService.criarProduto(req.user.id, req.body);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao criar produto ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function buscarCategorias(req, res) {
  try {
    const { q } = req.query;
    const resultado = await mlProdutoService.buscarCategorias(req.user.id, q);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao buscar categorias ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function atributoCategoria(req, res) {
  try {
    const resultado = await mlProdutoService.atributoCategoria(req.user.id, req.params.categoryId);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao buscar atributos ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

module.exports = {
  listarProdutos,
  buscarProduto,
  editarProduto,
  editarDescricao,
  pausarProduto,
  ativarProduto,
  encerrarProduto,
  atualizarEstoque,
  atualizarPreco,
  criarProduto,
  buscarCategorias,
  atributoCategoria,
};