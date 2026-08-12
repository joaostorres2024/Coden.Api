const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", authMiddleware, authController.register);
router.post("/login", authMiddleware, authController.login);

router.post("/recuperar-senha/solicitar", authMiddleware, authController.solicitarCodigo);
router.post("/recuperar-senha/validar", authMiddleware, authController.validarCodigo);
router.post("/recuperar-senha/redefinir", authMiddleware, authController.redefinirSenha);

module.exports = router;
