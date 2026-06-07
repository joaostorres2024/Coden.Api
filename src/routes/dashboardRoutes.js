const express = require('express')

const router = express.Router()

const dashboardController =
require('../controllers/dashboardController')

const auth =
require('../middlewares/authMiddleware')

router.get(
  '/',
  auth,
  dashboardController.dashboard
)

router.get(
  '/grafico',
  auth,
  dashboardController.grafico
)

router.get(
  '/situacao',
  auth,
  dashboardController.situacao
)

module.exports = router