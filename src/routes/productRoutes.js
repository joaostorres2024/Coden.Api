const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get('/products/relatorio/estoque', authMiddleware, productController.relatorioEstoque);

router.post("/products", authMiddleware, productController.registerProduct);
router.get("/products", authMiddleware, productController.getAllProducts);
router.get("/products/:id", authMiddleware, productController.getProduct);
router.delete("/products/:id", authMiddleware, productController.deleteProduct);
router.put("/products/:id", authMiddleware, productController.updateProduct);

module.exports = router;