const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const mlPedidoController = require('../controllers/mlPedidoController');

router.get('/pedidos', authMiddleware, mlPedidoController.listarPedidos);
router.get('/pedidos/status/:status', authMiddleware, mlPedidoController.pedidosPorStatus);
router.get('/pedidos/:orderId', authMiddleware, mlPedidoController.buscarPedido);
router.get('/pedidos/:orderId/itens', authMiddleware, mlPedidoController.itensPedido);
router.get('/pedidos/:orderId/comprador', authMiddleware, mlPedidoController.compradorPedido);
router.get('/pedidos/:orderId/entrega', authMiddleware, mlPedidoController.enderecoEntrega);
router.get('/pedidos/:orderId/mensagens', authMiddleware, mlPedidoController.mensagensPedido);
router.get('/pedidos/:orderId/nota-fiscal', authMiddleware, mlPedidoController.notaFiscalPedido);
router.get('/envios/:shippingId', authMiddleware, mlPedidoController.detalheEnvio);
router.post('/pedidos/:orderId/mensagens', authMiddleware, mlPedidoController.enviarMensagem);

module.exports = router;