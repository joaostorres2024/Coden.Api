const express = require('express')
const router = express.Router()
const grupoController = require('../controllers/grupoController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/grupos',authMiddleware, grupoController.listarGrupos)
router.post('/grupos', authMiddleware, grupoController.criarGrupo)
router.put('/grupos/:id',authMiddleware, grupoController.atualizarGrupo)
router.delete('/grupos/:id', authMiddleware, grupoController.deletarGrupo)

module.exports = router