const express = require('express')
const router = express.Router()
const nfEntradaController = require('../controllers/nfEntradaController')
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/nf-entrada', authMiddleware, nfEntradaController.criar)
router.get('/nf-entrada', authMiddleware, nfEntradaController.listar)
router.get('/nf-entrada/:id', authMiddleware, nfEntradaController.buscar)

module.exports = router