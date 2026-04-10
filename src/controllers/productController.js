const productService = require("../services/productService");

async function registerProduct(req, res){
    try {
        const { estabelecimento_id } = req.user;

        const product = await productService.createProduct({
            ...req.body,
            estabelecimento_id
        });
        res.status(201).json({
            message: "Produto cadastrado:",
            product
        });
    }
    catch(err){
        console.error(err); 
        res.status(500).send(err.message);
    }
}

async function getAllProducts(req, res){
    try {
        const { estabelecimento_id } = req.user;
        const products = await productService.getAllProducts({estabelecimento_id});
        res.status(200).json(products);
    }
    catch(err){
        console.error(err); 
        res.status(500).send(err.message);
    }  
}

async function getProduct(req, res){
    try {
        const { id } = req.params;
        const product = await productService.getProduct({id});
        res.status(200).json(product);
    }
    catch(err){
        console.error(err); 
        res.status(500).send(err.message);
    }  
}

async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        const { estabelecimento_id } = req.user;

        await productService.deleteProduct({id, estabelecimento_id});
        res.status(200).json({ message: "Produto deletado" });
    }
    catch(err){
        console.error(err); 
        res.status(500).send(err.message);
    }  
}

async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const { nome, preco, tipo} = req.body;
        const { estabelecimento_id} = req.user;

        const product = await productService.updateProduct({id, nome, preco, tipo, estabelecimento_id});
        res.status(200).json({
            message: "Produto editado:",
            product
        });
    }
    catch(err){
        console.error(err); 
        res.status(500).send(err.message);
    }  
}

module.exports = {
    registerProduct,
    getAllProducts,
    getProduct,
    deleteProduct,
    updateProduct
};