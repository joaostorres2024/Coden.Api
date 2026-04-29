const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/clientes", authMiddleware, clienteController.criarCliente);
router.get("/clientes", authMiddleware, clienteController.listarClientes);
router.get('/clientes/proximo-codigo', authMiddleware, clienteController.proximoCodigoCliente);
router.get("/clientes/:id", authMiddleware, clienteController.buscarCliente);
router.put("/clientes/:id", authMiddleware, clienteController.atualizarCliente);
router.delete("/clientes/:id", authMiddleware, clienteController.deletarCliente);

module.exports = router;