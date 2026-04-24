const productService = require("../services/productService");

// Criar produto
async function registerProduct(req, res) {
    try {
        const { estabelecimento_id } = req.user;
        const { nome, preco, tipo, estoque } = req.body;

        if (!nome || preco == null) {
            return res.status(400).json({
                erro: "nome e preco são obrigatórios"
            });
        }

        const product = await productService.createProduct({
            nome,
            preco,
            tipo,
            estoque,
            estabelecimento_id
        });

        return res.status(201).json({
            message: "Produto cadastrado com sucesso",
            product
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            erro: err.message
        });
    }
}

// Listar produtos
async function getAllProducts(req, res) {
    try {
        const { estabelecimento_id } = req.user;

        const products = await productService.getAllProducts({
            estabelecimento_id
        });

        return res.json(products);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: err.message });
    }
}

// Buscar produto por ID
async function getProduct(req, res) {
    try {
        const { id } = req.params;
        const { estabelecimento_id } = req.user;

        const product = await productService.getProduct({
            id,
            estabelecimento_id
        });

        return res.json(product);

    } catch (err) {
        console.error(err);
        return res.status(404).json({ erro: err.message });
    }
}

// Atualizar produto
async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const { nome, preco, tipo, estoque } = req.body;
        const { estabelecimento_id } = req.user;

        const product = await productService.updateProduct({
            id,
            nome,
            preco,
            tipo,
            estoque,
            estabelecimento_id
        });

        return res.json({
            message: "Produto atualizado com sucesso",
            product
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({ erro: err.message });
    }
}

// Deletar produto
async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        const { estabelecimento_id } = req.user;

        await productService.deleteProduct({
            id,
            estabelecimento_id
        });

        return res.json({
            message: "Produto deletado com sucesso"
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({ erro: err.message });
    }
}

module.exports = {
    registerProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
};