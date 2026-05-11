const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get('/products/relatorio/estoque', authMiddleware, productController.relatorioEstoque);
router.get('/products/relatorio/estoque/pdf', authMiddleware, productController.relatorioEstoquePDF);

router.post("/products", authMiddleware, productController.registerProduct);
router.get("/products", authMiddleware, productController.getAllProducts);

router.get("/products/:id", authMiddleware, productController.getProduct);
router.put("/products/:id", authMiddleware, productController.updateProduct);
router.delete('/products/:id', authMiddleware, productController.deletarProduto);

module.exports = router;