const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/recuperar-senha/solicitar", authMiddleware, authController.solicitarCodigo);
router.post("/recuperar-senha/validar", authMiddleware, authController.validarCodigo);
router.post("/recuperar-senha/redefinir", authMiddleware, authController.redefinirSenha);

module.exports = router;
