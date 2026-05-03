const axios = require('axios');
const { mlGet, getAccessToken } = require('./mlService');
const mlConfig = require('../config/mercadolivre');

// Lista pedidos do usuário
async function listarPedidos(userId, offset = 0, limit = 50) {
  const me = await mlGet(userId, '/users/me');
  const sellerId = me.id;

  const resultado = await mlGet(userId,
    `/orders/search?seller=${sellerId}&offset=${offset}&limit=${limit}&sort=date_desc`
  );

  return {
    total: resultado.paging?.total || 0,
    offset,
    limit,
    pedidos: resultado.results || [],
  };
}

// Busca um pedido pelo ID
async function buscarPedido(userId, orderId) {
  return await mlGet(userId, `/orders/${orderId}`);
}

// Busca os itens de um pedido
async function itensPedido(userId, orderId) {
  return await mlGet(userId, `/orders/${orderId}/items`);
}

// Busca informações do comprador de um pedido
async function compradorPedido(userId, orderId) {
  const pedido = await buscarPedido(userId, orderId);
  return pedido.buyer || null;
}

// Busca o endereço de entrega de um pedido
async function enderecoEntrega(userId, orderId) {
  const pedido = await buscarPedido(userId, orderId);
  return pedido.shipping || null;
}

// Busca detalhes do envio
async function detalheEnvio(userId, shippingId) {
  return await mlGet(userId, `/shipments/${shippingId}`);
}

// Busca pedidos por status
async function pedidosPorStatus(userId, status, offset = 0, limit = 50) {
  const me = await mlGet(userId, '/users/me');
  const sellerId = me.id;

  const resultado = await mlGet(userId,
    `/orders/search?seller=${sellerId}&order.status=${status}&offset=${offset}&limit=${limit}&sort=date_desc`
  );

  return {
    total: resultado.paging?.total || 0,
    offset,
    limit,
    pedidos: resultado.results || [],
  };
}

// Busca mensagens de um pedido
async function mensagensPedido(userId, orderId) {
  const me = await mlGet(userId, '/users/me');
  return await mlGet(userId, `/messages/packs/${orderId}/sellers/${me.id}`);
}

// Envia mensagem ao comprador
async function enviarMensagem(userId, orderId, mensagem) {
  const accessToken = await getAccessToken(userId);
  const me = await mlGet(userId, '/users/me');

  const { data } = await axios.post(
    `${mlConfig.baseUrl}/messages/packs/${orderId}/sellers/${me.id}`,
    { text: mensagem },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;
}

// Busca nota fiscal de um pedido
async function notaFiscalPedido(userId, orderId) {
  return await mlGet(userId, `/orders/${orderId}/billing_info`);
}

module.exports = {
  listarPedidos,
  buscarPedido,
  itensPedido,
  compradorPedido,
  enderecoEntrega,
  detalheEnvio,
  pedidosPorStatus,
  mensagensPedido,
  enviarMensagem,
  notaFiscalPedido,
};