const express = require('express')
const router = express.Router()
const estabelecimentoController = require('../controllers/estabelecimentoController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/estabelecimento', authMiddleware, estabelecimentoController.buscar)
router.put('/estabelecimento', authMiddleware, estabelecimentoController.atualizar)
router.get('/estabelecimentos', authMiddleware, estabelecimentoController.listar)

module.exports = router