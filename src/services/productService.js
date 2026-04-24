const db = require("../config/db");

// Criar produto
async function createProduct(data) {
    const { nome, preco, tipo, estoque, estabelecimento_id } = data;

    const [result] = await db.query(
        `INSERT INTO produtos (nome, preco, tipo, estoque, estabelecimento_id)
         VALUES (?, ?, ?, ?, ?)`,
        [nome, preco, tipo, estoque, estabelecimento_id]
    );

    return { id: result.insertId, nome, preco, tipo, estoque };
}

// Listar
async function getAllProducts({ estabelecimento_id }) {
    const [rows] = await db.query(
        "SELECT * FROM produtos WHERE estabelecimento_id = ?",
        [estabelecimento_id]
    );

    return rows;
}

// Buscar
async function getProduct({ id, estabelecimento_id }) {
    const [rows] = await db.query(
        "SELECT * FROM produtos WHERE id = ? AND estabelecimento_id = ?",
        [id, estabelecimento_id]
    );

    if (rows.length === 0) {
        throw new Error("Produto não encontrado");
    }

    return rows[0];
}

// Atualizar
async function updateProduct(data) {
    const { id, nome, preco, tipo, estoque, estabelecimento_id } = data;

    const [result] = await db.query(
        `UPDATE produtos 
         SET nome = ?, preco = ?, tipo = ?, estoque = ?
         WHERE id = ? AND estabelecimento_id = ?`,
        [nome, preco, tipo, estoque, id, estabelecimento_id]
    );

    if (result.affectedRows === 0) {
        throw new Error("Produto não encontrado");
    }

    return { id, nome, preco, tipo, estoque };
}

// Deletar
async function deleteProduct({ id, estabelecimento_id }) {
    const [result] = await db.query(
        "DELETE FROM produtos WHERE id = ? AND estabelecimento_id = ?",
        [id, estabelecimento_id]
    );

    if (result.affectedRows === 0) {
        throw new Error("Produto não encontrado");
    }
}

module.exports = {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
};