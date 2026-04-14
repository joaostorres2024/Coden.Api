const db = require("../config/db");

async function createProduct({nome, preco, tipo, estabelecimento_id}) {

    if (!nome || nome.trim() === "") {
        throw new Error("Nome é obrigatório");
    }

    if (preco == null || preco <= 0) {
        throw new Error("Preço deve ser maior que zero");
    }

    if (tipo !== "produto" && tipo !== "servico") {
        throw new Error("Tipo inválido");
    }

    const [rows] = await db.query(
        "SELECT id FROM estabelecimentos WHERE id = ?",
        [estabelecimento_id]
    );

    if (rows.length === 0) {
        throw new Error("Estabelecimento não encontrado");
    }

    await db.query(
        "INSERT INTO produtos (nome, preco, tipo, estabelecimento_id) VALUES (?, ?, ?, ?)",
        [nome, preco, tipo, estabelecimento_id]
    );

    return { message: "Produto criado com sucesso" };
}

async function deleteProduct({id, estabelecimento_id}) {

    const [result] = await db.query(
        "DELETE FROM produtos WHERE id = ? AND estabelecimento_id = ?",
        [id, estabelecimento_id]
    );

    if(result.affectedRows === 0){
        throw new Error("Produto não encontrado ou não pertence a você");
    }
}

async function updateProduct({ nome, preco, tipo, id }) {

    if (!nome || nome.trim() === "") {
        throw new Error("Nome é obrigatório");
    }

    if (preco == null || preco <= 0) {
        throw new Error("Preço deve ser maior que zero");
    }

    if (tipo !== "produto" && tipo !== "servico") {
        throw new Error("Tipo inválido");
    }

    const [result] = await db.query(
        "UPDATE produtos SET nome = ?, preco = ?, tipo = ? WHERE id = ?",
        [nome, preco, tipo, id]
    );

    if (result.affectedRows === 0) {
        throw new Error("Produto não encontrado");
    }

    return {
        message: "Produto editado com sucesso"
    };
}

async function getProduct({id}) {

    const [rows] = await db.query(
        "SELECT * FROM produtos WHERE id = ?",
        [id]
    );

    if(rows.length === 0){
        throw new Error("Produto não encontrado");
    }

    return rows[0];
}

async function getAllProducts({estabelecimento_id}) {

    const [rows] = await db.query(
        "SELECT * FROM produtos WHERE estabelecimento_id = ?",
        [estabelecimento_id]
    );

    return rows;
}

module.exports = {
    createProduct,
    getAllProducts,
    getProduct,
    deleteProduct,
    updateProduct
};