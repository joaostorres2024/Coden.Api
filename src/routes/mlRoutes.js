const router = require('express').Router();
const mlController = require('../controllers/mlController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/auth/login', authMiddleware, mlController.login);
router.get('/auth/callback', mlController.callback);
router.get('/status', authMiddleware, mlController.status);
router.delete('/auth/desconectar', authMiddleware, mlController.desconectar);

module.exports = router;