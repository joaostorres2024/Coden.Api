const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const mlProdutoController = require('../controllers/mlProdutoController');

router.get('/produtos', authMiddleware, mlProdutoController.listarProdutos);
router.get('/produtos/categorias', authMiddleware, mlProdutoController.buscarCategorias);
router.get('/produtos/categorias/:categoryId/atributos', authMiddleware, mlProdutoController.atributoCategoria);
router.get('/produtos/:itemId', authMiddleware, mlProdutoController.buscarProduto);
router.post('/produtos', authMiddleware, mlProdutoController.criarProduto);
router.put('/produtos/:itemId', authMiddleware, mlProdutoController.editarProduto);
router.put('/produtos/:itemId/descricao', authMiddleware, mlProdutoController.editarDescricao);
router.put('/produtos/:itemId/pausar', authMiddleware, mlProdutoController.pausarProduto);
router.put('/produtos/:itemId/ativar', authMiddleware, mlProdutoController.ativarProduto);
router.put('/produtos/:itemId/encerrar', authMiddleware, mlProdutoController.encerrarProduto);
router.put('/produtos/:itemId/estoque', authMiddleware, mlProdutoController.atualizarEstoque);
router.put('/produtos/:itemId/preco', authMiddleware, mlProdutoController.atualizarPreco);

module.exports = router;