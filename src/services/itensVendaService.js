const db = require("../config/db");

// Adicionar item
async function adicionarItem(venda_id, produto_id, quantidade) {

    // 🔒 BLOQUEIO
    const [vendaRows] = await db.query(
        "SELECT status FROM vendas WHERE id = ?",
        [venda_id]
    );

    const venda = vendaRows[0];

    if (!venda) throw new Error("Venda não encontrada");

    if (venda.status === "PAGO") {
        throw new Error("Não é possível alterar uma venda finalizada");
    }

    if (venda.status === "PAGO" || venda.status === "CANCELADO") {
        throw new Error("Não é possível alterar essa venda");
    }
    // produto
    const [produtoRows] = await db.query(
        "SELECT * FROM produtos WHERE id = ?",
        [produto_id]
    );

    const produto = produtoRows[0];

    if (!produto) throw new Error("Produto não encontrado");

    if (produto.estoque < quantidade) {
        throw new Error("Estoque insuficiente");
    }

    const preco = produto.preco;
    const subtotal = preco * quantidade;

    // inserir item
    await db.query(
        `INSERT INTO itens_venda 
        (venda_id, produto_id, quantidade, preco_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)`,
        [venda_id, produto_id, quantidade, preco, subtotal]
    );

    // atualizar estoque
    await db.query(
        "UPDATE produtos SET estoque = estoque - ? WHERE id = ?",
        [quantidade, produto_id]
    );

    // atualizar total da venda
    await db.query(
        `UPDATE vendas 
         SET total = (
            SELECT IFNULL(SUM(subtotal), 0)
            FROM itens_venda
            WHERE venda_id = ?
         )
         WHERE id = ?`,
        [venda_id, venda_id]
    );

    return { message: "Item adicionado com sucesso" };
}

// Remover item
async function removerItem(item_id) {

    const [rows] = await db.query(
        "SELECT * FROM itens_venda WHERE id = ?",
        [item_id]
    );

    const item = rows[0];

    if (!item) throw new Error("Item não encontrado");

    const [vendaRows] = await db.query(
    "SELECT status FROM vendas WHERE id = ?",
    [item.venda_id]
    );

    const venda = vendaRows[0];

    if (venda.status === "PAGO") {
        throw new Error("Não é possível alterar uma venda finalizada");
    }
    if (venda.status === "PAGO" || venda.status === "CANCELADO") {
        throw new Error("Não é possível alterar essa venda");
    }

    const { produto_id, quantidade, venda_id } = item;

    // devolver estoque
    await db.query(
        "UPDATE produtos SET estoque = estoque + ? WHERE id = ?",
        [quantidade, produto_id]
    );

    // deletar item
    await db.query(
        "DELETE FROM itens_venda WHERE id = ?",
        [item_id]
    );

    // atualizar total
    await db.query(
        `UPDATE vendas 
         SET total = (
            SELECT IFNULL(SUM(subtotal), 0)
            FROM itens_venda
            WHERE venda_id = ?
         )
         WHERE id = ?`,
        [venda_id, venda_id]
    );

    return { message: "Item removido com sucesso" };
}

module.exports = {
    adicionarItem,
    removerItem
};