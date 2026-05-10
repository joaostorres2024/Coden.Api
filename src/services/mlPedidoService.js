const axios = require('axios');
const { mlGet, getAccessToken } = require('./mlService');
const mlConfig = require('../config/mercadoLivre');

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

async function buscarPedido(userId, orderId) {
  return await mlGet(userId, `/orders/${orderId}`);
}

async function itensPedido(userId, orderId) {
  return await mlGet(userId, `/orders/${orderId}/items`);
}

async function compradorPedido(userId, orderId) {
  const pedido = await buscarPedido(userId, orderId);
  return pedido.buyer || null;
}

async function enderecoEntrega(userId, orderId) {
  const pedido = await buscarPedido(userId, orderId);
  return pedido.shipping || null;
}

async function detalheEnvio(userId, shippingId) {
  return await mlGet(userId, `/shipments/${shippingId}`);
}

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

async function mensagensPedido(userId, orderId) {
  const me = await mlGet(userId, '/users/me');
  return await mlGet(userId, `/messages/packs/${orderId}/sellers/${me.id}`);
}

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