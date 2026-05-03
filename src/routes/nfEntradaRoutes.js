const express = require("express");
const router = express.Router();
const nfEntradaController = require("../controllers/nfEntradaController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/nf-entrada", authMiddleware, nfEntradaController.criarNota);
router.get("/nf-entrada", authMiddleware, nfEntradaController.listarNotas);
router.get("/nf-entrada/:id", authMiddleware, nfEntradaController.buscarNota);
router.delete("/nf-entrada/:id", authMiddleware, nfEntradaController.cancelarNota);

module.exports = router;