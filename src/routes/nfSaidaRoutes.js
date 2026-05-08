const express = require('express')
const router = express.Router()
const nfSaidaController = require('../controllers/nfSaidaController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.post('/nf-saida', authMiddleware, nfSaidaController.gerarNfSaida)
router.get('/nf-saida', authMiddleware, nfSaidaController.listarNfSaida)
router.get('/nf-saida/:id', authMiddleware, nfSaidaController.buscarNfSaida)
router.get('/nf-saida/:id/pdf', authMiddleware, nfSaidaController.gerarPDF)

module.exports = router