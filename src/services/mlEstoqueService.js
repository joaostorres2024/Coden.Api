const axios = require('axios');
const { mlGet, getAccessToken } = require('./mlService');
const mlConfig = require('../config/mercadolivre');

// Busca estoque de um item
async function buscarEstoque(userId, itemId) {
  const item = await mlGet(userId, `/items/${itemId}`);
  return {
    item_id: itemId,
    titulo: item.title,
    estoque_disponivel: item.available_quantity,
    estoque_vendido: item.sold_quantity,
    status: item.status,
  };
}

// Atualiza estoque de um item
async function atualizarEstoque(userId, itemId, quantidade) {
  const accessToken = await getAccessToken(userId);
  const { data } = await axios.put(
    `${mlConfig.baseUrl}/items/${itemId}`,
    { available_quantity: quantidade },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return {
    item_id: itemId,
    estoque_atualizado: data.available_quantity,
    status: data.status,
  };
}

// Busca estoque de múltiplos itens de uma vez
async function buscarEstoqueMultiplos(userId, itemIds) {
  const chunks = [];
  for (let i = 0; i < itemIds.length; i += 20) {
    chunks.push(itemIds.slice(i, i + 20));
  }

  const estoques = [];
  for (const chunk of chunks) {
    const detalhes = await mlGet(userId, `/items?ids=${chunk.join(',')}`);
    detalhes.forEach(item => {
      if (item.code === 200) {
        estoques.push({
          item_id: item.body.id,
          titulo: item.body.title,
          estoque_disponivel: item.body.available_quantity,
          estoque_vendido: item.body.sold_quantity,
          status: item.body.status,
        });
      }
    });
  }

  return estoques;
}

// Lista todos os itens com estoque baixo (abaixo do mínimo)
async function estoquesBaixos(userId, minimo = 5) {
  const me = await mlGet(userId, '/users/me');
  const sellerId = me.id;

  let offset = 0;
  const limit = 50;
  const baixos = [];

  while (true) {
    const resultado = await mlGet(userId,
      `/users/${sellerId}/items/search?offset=${offset}&limit=${limit}`
    );

    const ids = resultado.results;
    if (!ids || ids.length === 0) break;

    const estoques = await buscarEstoqueMultiplos(userId, ids);
    estoques.forEach(item => {
      if (item.estoque_disponivel <= minimo && item.status === 'active') {
        baixos.push(item);
      }
    });

    if (offset + limit >= resultado.paging?.total) break;
    offset += limit;
  }

  return { total: baixos.length, minimo, itens: baixos };
}

// Atualiza estoque de múltiplos itens de uma vez
async function atualizarEstoqueMultiplos(userId, itens) {
  // itens = [{ item_id: 'MLB123', quantidade: 10 }, ...]
  const resultados = [];

  for (const item of itens) {
    try {
      const resultado = await atualizarEstoque(userId, item.item_id, item.quantidade);
      resultados.push({ ...resultado, sucesso: true });
    } catch (err) {
      resultados.push({
        item_id: item.item_id,
        sucesso: false,
        erro: err.response?.data || err.message,
      });
    }
  }

  return resultados;
}

module.exports = {
  buscarEstoque,
  atualizarEstoque,
  buscarEstoqueMultiplos,
  estoquesBaixos,
  atualizarEstoqueMultiplos,
};