const express = require("express");
const router = express.Router();
const itensVendaController = require("../controllers/itensVendaController");

router.post("/itens-venda", itensVendaController.adicionarItem);
router.delete("/itens-venda/:id", itensVendaController.removerItem);

module.exports = router;