const express = require('express')
const router = express.Router()
const itensVendaController = require('../controllers/itensVendaController')
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/vendas/:venda_id/itens', authMiddleware, itensVendaController.listarItensDaVenda)
router.post('/itens-venda', authMiddleware, itensVendaController.adicionarItem)
router.delete('/itens-venda/:id', authMiddleware, itensVendaController.removerItem)

module.exports = router