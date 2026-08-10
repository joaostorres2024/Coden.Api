const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/recuperar-senha/solicitar", authController.solicitarCodigo);
router.post("/recuperar-senha/validar", authController.validarCodigo);
router.post("/recuperar-senha/redefinir", authController.redefinirSenha);

module.exports = router;
