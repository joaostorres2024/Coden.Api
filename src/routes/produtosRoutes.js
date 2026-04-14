const express = require("express");
const router = express.Router();
const produtosController = require("../controllers/produtosController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/products", authMiddleware, produtosController.registerProduct);
router.get("/products", authMiddleware, produtosController.getAllProducts);
router.get("/products/:id", authMiddleware, produtosController.getProduct);
router.delete("/products/:id", authMiddleware, produtosController.deleteProduct);
router.put("/products/:id", authMiddleware, produtosController.updateProduct);

module.exports = router;