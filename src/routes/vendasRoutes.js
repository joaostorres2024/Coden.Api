const express = require('express')
const router = express.Router()
const vendasController = require('../controllers/vendasController')
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/vendas', authMiddleware, vendasController.criarVendaComItens)
router.get('/vendas', authMiddleware, vendasController.listarVendas)
router.get('/vendas/:id', authMiddleware, vendasController.buscarVendaPorId)
router.patch('/vendas/:id/cancelar', authMiddleware, vendasController.cancelarVenda)
router.patch('/vendas/:id/finalizar', authMiddleware, vendasController.finalizarVenda)

module.exports = router