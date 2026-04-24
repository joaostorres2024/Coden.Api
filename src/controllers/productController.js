const productService = require("../services/productService");

async function registerProduct(req, res) {
    try {
        const { estabelecimento_id } = req.user;
        const {
            nome_produto,
            preco,
            grupo,
            codigo_produto,
            codigo_barras,
            preco_custo,
            margem_percentual,
            estoque_atual,
            estoque_minimo,
            estoque_maximo,
            fornecedor,
            status,
            observacoes
        } = req.body;

        if (!nome_produto || preco == null) {
            return res.status(400).json({
                erro: "nome_produto e preco são obrigatórios"
            });
        }

        const product = await productService.createProduct({
            nome_produto,
            preco,
            grupo,
            estabelecimento_id,
            codigo_produto,
            codigo_barras,
            preco_custo,
            margem_percentual,
            estoque_atual,
            estoque_minimo,
            estoque_maximo,
            fornecedor,
            status,
            observacoes
        });

        return res.status(201).json({
            message: "Produto cadastrado com sucesso",
            product
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: err.message });
    }
}

async function getAllProducts(req, res) {
    try {
        const { estabelecimento_id } = req.user;

        const products = await productService.getAllProducts({ estabelecimento_id });

        return res.json(products);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: err.message });
    }
}

async function getProduct(req, res) {
    try {
        const { id } = req.params;
        const { estabelecimento_id } = req.user;

        const product = await productService.getProduct({ id, estabelecimento_id });

        return res.json(product);

    } catch (err) {
        console.error(err);
        return res.status(404).json({ erro: err.message });
    }
}

async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const { estabelecimento_id } = req.user;
        const {
            nome_produto,
            preco,
            grupo,
            codigo_produto,
            codigo_barras,
            preco_custo,
            margem_percentual,
            estoque_atual,
            estoque_minimo,
            estoque_maximo,
            fornecedor,
            status,
            observacoes
        } = req.body;

        const product = await productService.updateProduct({
            id,
            nome_produto,
            preco,
            grupo,
            estabelecimento_id,
            codigo_produto,
            codigo_barras,
            preco_custo,
            margem_percentual,
            estoque_atual,
            estoque_minimo,
            estoque_maximo,
            fornecedor,
            status,
            observacoes
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

async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        const { estabelecimento_id } = req.user;

        await productService.deleteProduct({ id, estabelecimento_id });

        return res.json({ message: "Produto deletado com sucesso" });

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