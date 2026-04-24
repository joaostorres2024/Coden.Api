const db = require("../config/db");

// Criar venda
async function criarVenda(usuarioId, clienteId) {
    const [result] = await db.query(
        `INSERT INTO vendas (usuario_id, cliente_id)
         VALUES (?, ?)`,
        [usuarioId, clienteId]
    );

    return {
        id: result.insertId,
        message: "Venda criada com sucesso"
    };
}

// Listar
async function listarVendas() {
    const [rows] = await db.query("SELECT * FROM vendas");
    return rows;
}

// Buscar por ID
async function buscarVendaPorId(id) {
    const [rows] = await db.query(
        "SELECT * FROM vendas WHERE id = ?",
        [id]
    );

    if (rows.length === 0) {
        throw new Error("Venda não encontrada");
    }

    return rows[0];
}

// Atualizar status
async function atualizarStatus(id, status) {
    const statusValidos = ["PENDENTE", "PAGO", "CANCELADO"];

    if (!statusValidos.includes(status)) {
        throw new Error("Status inválido");
    }

    const [result] = await db.query(
        "UPDATE vendas SET status = ? WHERE id = ?",
        [status, id]
    );

    if (result.affectedRows === 0) {
        throw new Error("Venda não encontrada");
    }

    return { message: "Status atualizado com sucesso" };
}

// Deletar
async function deletarVenda(id) {
    const [result] = await db.query(
        "DELETE FROM vendas WHERE id = ?",
        [id]
    );

    if (result.affectedRows === 0) {
        throw new Error("Venda não encontrada");
    }

    return { message: "Venda deletada com sucesso" };
}

async function criarVendaComItens(usuario_id, cliente_id, itens) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Criar venda
        const [vendaResult] = await connection.query(
            `INSERT INTO vendas (usuario_id, cliente_id)
             VALUES (?, ?)`,
            [usuario_id, cliente_id]
        );

        const venda_id = vendaResult.insertId;

        let total = 0;

        // 2. Percorrer itens
        for (const item of itens) {

            const { produto_id, quantidade } = item;

            // buscar produto
            const [produtoRows] = await connection.query(
                "SELECT * FROM produtos WHERE id = ?",
                [produto_id]
            );

            const produto = produtoRows[0];

            if (!produto) {
                throw new Error(`Produto ${produto_id} não encontrado`);
            }

            if (produto.estoque < quantidade) {
                throw new Error(`Estoque insuficiente para produto ${produto_id}`);
            }

            const preco = produto.preco;
            const subtotal = preco * quantidade;

            total += subtotal;

            // inserir item
            await connection.query(
                `INSERT INTO itens_venda
                (venda_id, produto_id, quantidade, preco_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?)`,
                [venda_id, produto_id, quantidade, preco, subtotal]
            );

            // atualizar estoque
            await connection.query(
                "UPDATE produtos SET estoque = estoque - ? WHERE id = ?",
                [quantidade, produto_id]
            );
        }

        // 3. Atualizar total da venda
        await connection.query(
            "UPDATE vendas SET total = ? WHERE id = ?",
            [total, venda_id]
        );

        await connection.commit();

        return {
            id: venda_id,
            total,
            message: "Venda criada com itens com sucesso"
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function finalizarVenda(id) {

    // 1. Buscar venda
    const [rows] = await db.query(
        "SELECT * FROM vendas WHERE id = ?",
        [id]
    );

    const venda = rows[0];

    if (!venda) {
        throw new Error("Venda não encontrada");
    }

    // 2. Verificar se já está paga
    if (venda.status === "PAGO") {
        throw new Error("Venda já está finalizada");
    }

    // 3. Verificar se tem itens
    const [itens] = await db.query(
        "SELECT * FROM itens_venda WHERE venda_id = ?",
        [id]
    );

    if (itens.length === 0) {
        throw new Error("Não é possível finalizar uma venda sem itens");
    }

    // 4. Atualizar status
    await db.query(
        "UPDATE vendas SET status = 'PAGO' WHERE id = ?",
        [id]
    );

    return { message: "Venda finalizada com sucesso" };
}

async function cancelarVenda(id) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Buscar venda
        const [vendaRows] = await connection.query(
            "SELECT * FROM vendas WHERE id = ?",
            [id]
        );

        const venda = vendaRows[0];

        if (!venda) {
            throw new Error("Venda não encontrada");
        }

        if (venda.status === "CANCELADO") {
            throw new Error("Venda já está cancelada");
        }

        // 2. Buscar itens
        const [itens] = await connection.query(
            "SELECT * FROM itens_venda WHERE venda_id = ?",
            [id]
        );

        // 3. Devolver estoque de TODOS os itens
        for (const item of itens) {
            await connection.query(
                "UPDATE produtos SET estoque = estoque + ? WHERE id = ?",
                [item.quantidade, item.produto_id]
            );
        }

        // 4. Atualizar venda
        await connection.query(
            "UPDATE vendas SET status = 'CANCELADO', total = 0 WHERE id = ?",
            [id]
        );

        await connection.commit();

        return { message: "Venda cancelada com sucesso" };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
module.exports = {
    criarVenda,
    listarVendas,
    buscarVendaPorId,
    atualizarStatus,
    deletarVenda,
    criarVendaComItens,
    finalizarVenda,
    cancelarVenda
};