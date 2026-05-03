const mlPedidoService = require('../services/mlPedidoService');

async function listarPedidos(req, res) {
  try {
    const { offset = 0, limit = 50 } = req.query;
    const resultado = await mlPedidoService.listarPedidos(req.user.id, Number(offset), Number(limit));
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao listar pedidos ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function buscarPedido(req, res) {
  try {
    const pedido = await mlPedidoService.buscarPedido(req.user.id, req.params.orderId);
    res.json(pedido);
  } catch (err) {
    console.error('Erro ao buscar pedido ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function itensPedido(req, res) {
  try {
    const itens = await mlPedidoService.itensPedido(req.user.id, req.params.orderId);
    res.json(itens);
  } catch (err) {
    console.error('Erro ao buscar itens ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function compradorPedido(req, res) {
  try {
    const comprador = await mlPedidoService.compradorPedido(req.user.id, req.params.orderId);
    res.json(comprador);
  } catch (err) {
    console.error('Erro ao buscar comprador ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function enderecoEntrega(req, res) {
  try {
    const endereco = await mlPedidoService.enderecoEntrega(req.user.id, req.params.orderId);
    res.json(endereco);
  } catch (err) {
    console.error('Erro ao buscar endereço ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function detalheEnvio(req, res) {
  try {
    const envio = await mlPedidoService.detalheEnvio(req.user.id, req.params.shippingId);
    res.json(envio);
  } catch (err) {
    console.error('Erro ao buscar envio ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function pedidosPorStatus(req, res) {
  try {
    const { offset = 0, limit = 50 } = req.query;
    const resultado = await mlPedidoService.pedidosPorStatus(req.user.id, req.params.status, Number(offset), Number(limit));
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao buscar pedidos por status ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function mensagensPedido(req, res) {
  try {
    const mensagens = await mlPedidoService.mensagensPedido(req.user.id, req.params.orderId);
    res.json(mensagens);
  } catch (err) {
    console.error('Erro ao buscar mensagens ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function enviarMensagem(req, res) {
  try {
    const { mensagem } = req.body;
    const resultado = await mlPedidoService.enviarMensagem(req.user.id, req.params.orderId, mensagem);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao enviar mensagem ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
}

async function notaFiscalPedido(req, res) {
  try {
    const nota = await mlPedidoService.notaFiscalPedido(req.user.id, req.params.orderId);
    res.json(nota);
  } catch (err) {
    console.error('Erro ao buscar nota fiscal ML:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
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