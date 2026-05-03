const sql = require("mssql");
const pool = require("../config/db"); // seu pool

async function criarNota(data) {
    const transaction = new sql.Transaction(await pool);

    try {
        await transaction.begin();

        const request = new sql.Request(transaction);

        let totalNota = 0;

        // 1️⃣ Criar nota
        const notaResult = await request
            .input("numero_nf", data.numero_nf)
            .input("serie", data.serie)
            .input("data_emissao", data.data_emissao)
            .input("fornecedor", data.fornecedor)
            .input("estabelecimento_id", data.estabelecimento_id)
            .query(`
                INSERT INTO nf_entrada
                (numero_nf, serie, data_emissao, data_entrada, fornecedor, valor_total, estabelecimento_id)
                OUTPUT INSERTED.id
                VALUES (@numero_nf, @serie, @data_emissao, GETDATE(), @fornecedor, 0, @estabelecimento_id)
            `);

        const notaId = notaResult.recordset[0].id;

        // 2️⃣ Loop itens
        for (const item of data.itens) {

            const itemRequest = new sql.Request(transaction);

            const produtoResult = await itemRequest
                .input("produto_id", item.produto_id)
                .input("estabelecimento_id", data.estabelecimento_id)
                .query(`
                    SELECT * FROM produtos 
                    WHERE id = @produto_id AND estabelecimento_id = @estabelecimento_id
                `);

            if (produtoResult.recordset.length === 0) {
                throw new Error(`Produto ${item.produto_id} não encontrado`);
            }

            const produto = produtoResult.recordset[0];

            const valor_total = item.quantidade * item.valor_unitario;
            totalNota += valor_total;

            // inserir item
            await itemRequest
                .input("nf_entrada_id", notaId)
                .input("produto_id", item.produto_id)
                .input("nome_produto", produto.nome_produto)
                .input("codigo_produto", produto.codigo_produto)
                .input("quantidade", item.quantidade)
                .input("valor_unitario", item.valor_unitario)
                .input("valor_total", valor_total)
                .input("preco_venda", item.preco_venda)
                .query(`
                    INSERT INTO nf_entrada_itens
                    (nf_entrada_id, produto_id, nome_produto, codigo_produto, quantidade, valor_unitario, valor_total, preco_venda)
                    VALUES
                    (@nf_entrada_id, @produto_id, @nome_produto, @codigo_produto, @quantidade, @valor_unitario, @valor_total, @preco_venda)
                `);

            // atualizar estoque
            await itemRequest
                .input("quantidade", item.quantidade)
                .input("produto_id", item.produto_id)
                .input("estabelecimento_id", data.estabelecimento_id)
                .query(`
                    UPDATE produtos
                    SET estoque_atual = estoque_atual + @quantidade
                    WHERE id = @produto_id AND estabelecimento_id = @estabelecimento_id
                `);
        }

        // 3️⃣ atualizar total
        await request
            .input("totalNota", totalNota)
            .input("notaId", notaId)
            .query(`
                UPDATE nf_entrada
                SET valor_total = @totalNota
                WHERE id = @notaId
            `);

        await transaction.commit();

        return {
            id: notaId,
            total: totalNota
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function listarNotas({ estabelecimento_id }) {
    const req = await request();

    const result = await req
        .input("estabelecimento_id", estabelecimento_id)
        .query(`
            SELECT * FROM nf_entrada
            WHERE estabelecimento_id = @estabelecimento_id
            ORDER BY id DESC
        `);

    return result.recordset;
}

async function buscarNota({ id, estabelecimento_id }) {
    const req = await request();

    const notaResult = await req
        .input("id", id)
        .input("estabelecimento_id", estabelecimento_id)
        .query(`
            SELECT * FROM nf_entrada
            WHERE id = @id AND estabelecimento_id = @estabelecimento_id
        `);

    if (notaResult.recordset.length === 0) {
        throw new Error("Nota não encontrada");
    }

    const itensResult = await req
        .input("id", id)
        .query(`
            SELECT * FROM nf_entrada_itens
            WHERE nf_entrada_id = @id
        `);

    return {
        ...notaResult.recordset[0],
        itens: itensResult.recordset
    };
}

async function cancelarNota({ id, estabelecimento_id }) {
    const req = await request();

    await req.query("BEGIN TRANSACTION");

    try {
        // buscar itens
        const itensResult = await req
            .input("id", id)
            .query(`
                SELECT * FROM nf_entrada_itens
                WHERE nf_entrada_id = @id
            `);

        // 🔁 reverter estoque
        for (const item of itensResult.recordset) {
            await req
                .input("quantidade", item.quantidade)
                .input("produto_id", item.produto_id)
                .input("estabelecimento_id", estabelecimento_id)
                .query(`
                    UPDATE produtos
                    SET estoque_atual = estoque_atual - @quantidade
                    WHERE id = @produto_id AND estabelecimento_id = @estabelecimento_id
                `);
        }

        // deletar itens
        await req
            .input("id", id)
            .query(`DELETE FROM nf_entrada_itens WHERE nf_entrada_id = @id`);

        // deletar nota
        const result = await req
            .input("id", id)
            .input("estabelecimento_id", estabelecimento_id)
            .query(`
                DELETE FROM nf_entrada
                WHERE id = @id AND estabelecimento_id = @estabelecimento_id
            `);

        if (result.rowsAffected[0] === 0) {
            throw new Error("Nota não encontrada");
        }

        await req.query("COMMIT");

    } catch (error) {
        await req.query("ROLLBACK");
        throw error;
    }
}

module.exports = {
    criarNota,
    listarNotas,
    buscarNota,
    cancelarNota
};