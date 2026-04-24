const db = require("../config/db");

// Criar produto
async function createProduct(data) {
    const {
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
    } = data;

    const result = await db.request()
        .input("nome_produto", nome_produto)
        .input("preco", preco)
        .input("grupo", grupo)
        .input("estabelecimento_id", estabelecimento_id)
        .input("codigo_produto", codigo_produto)
        .input("codigo_barras", codigo_barras)
        .input("preco_custo", preco_custo)
        .input("margem_percentual", margem_percentual)
        .input("estoque_atual", estoque_atual)
        .input("estoque_minimo", estoque_minimo)
        .input("estoque_maximo", estoque_maximo)
        .input("fornecedor", fornecedor)
        .input("status", status)
        .input("observacoes", observacoes)
        .query(`
            INSERT INTO produtos 
                (nome_produto, preco, grupo, estabelecimento_id, codigo_produto, codigo_barras,
                 preco_custo, margem_percentual, estoque_atual, estoque_minimo, estoque_maximo,
                 fornecedor, status, observacoes)
            OUTPUT INSERTED.id
            VALUES 
                (@nome_produto, @preco, @grupo, @estabelecimento_id, @codigo_produto, @codigo_barras,
                 @preco_custo, @margem_percentual, @estoque_atual, @estoque_minimo, @estoque_maximo,
                 @fornecedor, @status, @observacoes)
        `);

    const id = result.recordset[0].id;
    return { id, ...data };
}

// Listar
async function getAllProducts({ estabelecimento_id }) {
    const result = await db.request()
        .input("estabelecimento_id", estabelecimento_id)
        .query("SELECT * FROM produtos WHERE estabelecimento_id = @estabelecimento_id");

    return result.recordset;
}

// Buscar
async function getProduct({ id, estabelecimento_id }) {
    const result = await db.request()
        .input("id", id)
        .input("estabelecimento_id", estabelecimento_id)
        .query("SELECT * FROM produtos WHERE id = @id AND estabelecimento_id = @estabelecimento_id");

    if (result.recordset.length === 0) {
        throw new Error("Produto não encontrado");
    }

    return result.recordset[0];
}

// Atualizar
async function updateProduct(data) {
    const {
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
    } = data;

    const result = await db.request()
        .input("id", id)
        .input("nome_produto", nome_produto)
        .input("preco", preco)
        .input("grupo", grupo)
        .input("estabelecimento_id", estabelecimento_id)
        .input("codigo_produto", codigo_produto)
        .input("codigo_barras", codigo_barras)
        .input("preco_custo", preco_custo)
        .input("margem_percentual", margem_percentual)
        .input("estoque_atual", estoque_atual)
        .input("estoque_minimo", estoque_minimo)
        .input("estoque_maximo", estoque_maximo)
        .input("fornecedor", fornecedor)
        .input("status", status)
        .input("observacoes", observacoes)
        .query(`
            UPDATE produtos 
            SET nome_produto = @nome_produto,
                preco = @preco,
                grupo = @grupo,
                codigo_produto = @codigo_produto,
                codigo_barras = @codigo_barras,
                preco_custo = @preco_custo,
                margem_percentual = @margem_percentual,
                estoque_atual = @estoque_atual,
                estoque_minimo = @estoque_minimo,
                estoque_maximo = @estoque_maximo,
                fornecedor = @fornecedor,
                status = @status,
                observacoes = @observacoes
            WHERE id = @id AND estabelecimento_id = @estabelecimento_id
        `);

    if (result.rowsAffected[0] === 0) {
        throw new Error("Produto não encontrado");
    }

    return { id, ...data };
}

// Deletar
async function deleteProduct({ id, estabelecimento_id }) {
    const result = await db.request()
        .input("id", id)
        .input("estabelecimento_id", estabelecimento_id)
        .query("DELETE FROM produtos WHERE id = @id AND estabelecimento_id = @estabelecimento_id");

    if (result.rowsAffected[0] === 0) {
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