const express = require("express");
const router = express.Router();
const vendasController = require("../controllers/vendasController");

router.post("/vendas", vendasController.criarVenda);
router.get("/vendas", vendasController.listarVendas);
router.get("/vendas/:id", vendasController.buscarVendaPorId);
router.patch("/vendas/:id/status", vendasController.atualizarStatus);
router.delete("/vendas/:id", vendasController.deletarVenda);
router.post("/vendas-com-itens", vendasController.criarVendaComItens);
router.patch("/vendas/:id/finalizar", vendasController.finalizarVenda);
router.patch("/vendas/:id/cancelar", vendasController.cancelarVenda);

module.exports = router;