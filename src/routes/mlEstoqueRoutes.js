const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const mlEstoqueController = require('../controllers/mlEstoqueController');

router.get('/estoque/baixos', authMiddleware, mlEstoqueController.estoquesBaixos);
router.get('/estoque/:itemId', authMiddleware, mlEstoqueController.buscarEstoque);
router.put('/estoque/:itemId', authMiddleware, mlEstoqueController.atualizarEstoque);
router.post('/estoque/multiplos', authMiddleware, mlEstoqueController.buscarEstoqueMultiplos);
router.put('/estoque/multiplos', authMiddleware, mlEstoqueController.atualizarEstoqueMultiplos);

module.exports = router;