const axios = require('axios');
const { mlGet, getAccessToken } = require('./mlService');
const mlConfig = require('../config/mercadoLivre');

// Busca o seller_id do usuário no ML
async function getSellerid(userId) {
  const me = await mlGet(userId, '/users/me');
  return me.id;
}

async function listarProdutos(userId, offset = 0, limit = 50) {
  const sellerId = await getSellerid(userId);
  console.log('Seller ID:', sellerId);

  const resultado = await mlGet(userId, `/users/${sellerId}/items/search?offset=${offset}&limit=${limit}`);
  console.log('Resultado busca:', JSON.stringify(resultado));

  const ids = resultado.results;
  if (!ids || ids.length === 0) return { total: 0, produtos: [] };

  console.log('IDs encontrados:', ids);

  const produtos = [];
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20);
    const detalhes = await mlGet(userId, `/items?ids=${chunk.join(',')}`);
    console.log('Detalhes chunk:', JSON.stringify(detalhes));
    detalhes.forEach(item => {
      if (item.code === 200) produtos.push(item.body);
    });
  }

  return { total: resultado.paging?.total || produtos.length, offset, limit, produtos };
}
// Busca um produto pelo ID ML
async function buscarProduto(userId, itemId) {
  return await mlGet(userId, `/items/${itemId}`);
}

// Edita campos de um produto (título, preço, descrição, etc)
async function editarProduto(userId, itemId, campos) {
  const accessToken = await getAccessToken(userId);
  const { data } = await axios.put(`${mlConfig.baseUrl}/items/${itemId}`, campos, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

// Edita a descrição de um produto
async function editarDescricao(userId, itemId, descricao) {
  const accessToken = await getAccessToken(userId);
  const { data } = await axios.put(`${mlConfig.baseUrl}/items/${itemId}/description`, 
    { plain_text: descricao },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;
}

// Pausa um anúncio
async function pausarProduto(userId, itemId) {
  return await editarProduto(userId, itemId, { status: 'paused' });
}

// Reativa um anúncio pausado
async function ativarProduto(userId, itemId) {
  return await editarProduto(userId, itemId, { status: 'active' });
}

// Fecha/encerra um anúncio
async function encerrarProduto(userId, itemId) {
  return await editarProduto(userId, itemId, { status: 'closed' });
}

// Atualiza o estoque de um produto
async function atualizarEstoque(userId, itemId, quantidade) {
  return await editarProduto(userId, itemId, { available_quantity: quantidade });
}

// Atualiza o preço de um produto
async function atualizarPreco(userId, itemId, preco) {
  return await editarProduto(userId, itemId, { price: preco });
}

// Cria um novo anúncio
async function criarProduto(userId, produto) {
  const accessToken = await getAccessToken(userId);
  const { data } = await axios.post(`${mlConfig.baseUrl}/items`, produto, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

// Busca categorias do ML
async function buscarCategorias(userId, query) {
  return await mlGet(userId, `/sites/MLB/domain_discovery/search?q=${encodeURIComponent(query)}&limit=10`);
}

// Busca atributos obrigatórios de uma categoria
async function atributoCategoria(userId, categoryId) {
  return await mlGet(userId, `/categories/${categoryId}/attributes`);
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