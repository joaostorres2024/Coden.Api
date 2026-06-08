const express = require('express')
const router = express.Router()

const dashboardController = require('../controllers/dashboardController')
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/dashboard',          authMiddleware, dashboardController.dashboard)
router.get('/dashboard/grafico',  authMiddleware, dashboardController.grafico)
router.get('/dashboard/situacao', authMiddleware, dashboardController.situacao)
router.get('/dashboard/financeiro', authMiddleware, dashboardController.financeiro)

module.exports = router