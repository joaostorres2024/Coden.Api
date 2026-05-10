const { request, sql } = require("../config/db");

async function createProduct(data) {
  const {
    nome_produto, preco, grupo_id, estabelecimento_id, codigo_produto,
    codigo_barras, preco_custo, margem_percentual, estoque_atual,
    estoque_minimo, estoque_maximo, fornecedor, status, observacoes
  } = data;

  const req = await request()
  const result = await req
    .input("nome_produto", sql.VarChar, nome_produto)
    .input("preco", sql.Decimal(10, 2), preco)
    .input("grupo_id", sql.Int, grupo_id || null)
    .input("estabelecimento_id", sql.Int, estabelecimento_id)
    .input("codigo_produto", sql.VarChar, codigo_produto)
    .input("codigo_barras", sql.VarChar, codigo_barras)
    .input("preco_custo", sql.Decimal(10, 2), preco_custo)
    .input("margem_percentual", sql.Decimal(10, 2), margem_percentual)
    .input("estoque_atual", sql.Int, estoque_atual)
    .input("estoque_minimo", sql.Int, estoque_minimo)
    .input("estoque_maximo", sql.Int, estoque_maximo)
    .input("fornecedor", sql.VarChar, fornecedor)
    .input("status", sql.VarChar, status)
    .input("observacoes", sql.VarChar, observacoes)
    .query(`
      INSERT INTO produtos 
        (nome_produto, preco, grupo_id, estabelecimento_id, codigo_produto, codigo_barras,
         preco_custo, margem_percentual, estoque_atual, estoque_minimo, estoque_maximo,
         fornecedor, status, observacoes)
      OUTPUT INSERTED.id
      VALUES 
        (@nome_produto, @preco, @grupo_id, @estabelecimento_id, @codigo_produto, @codigo_barras,
         @preco_custo, @margem_percentual, @estoque_atual, @estoque_minimo, @estoque_maximo,
         @fornecedor, @status, @observacoes)
    `)

  return { id: result.recordset[0].id, ...data }
}

async function getAllProducts({ estabelecimento_id }) {
  const req = await request()
  const result = await req
    .input("estabelecimento_id", sql.Int, estabelecimento_id)
    .query(`
      SELECT p.*, g.nome AS grupo
      FROM produtos p
      LEFT JOIN grupos_produto g ON p.grupo_id = g.id
      WHERE p.estabelecimento_id = @estabelecimento_id
    `)
  return result.recordset
}

async function getProduct({ id, estabelecimento_id }) {
  const req = await request()
  const result = await req
    .input("id", sql.Int, id)
    .input("estabelecimento_id", sql.Int, estabelecimento_id)
    .query(`
      SELECT p.*, g.nome AS grupo
      FROM produtos p
      LEFT JOIN grupos_produto g ON p.grupo_id = g.id
      WHERE p.id = @id AND p.estabelecimento_id = @estabelecimento_id
    `)

  if (result.recordset.length === 0) throw new Error("Produto não encontrado")
  return result.recordset[0]
}

async function updateProduct(data) {
  const {
    id, nome_produto, preco, grupo_id, estabelecimento_id, codigo_produto,
    codigo_barras, preco_custo, margem_percentual, estoque_atual,
    estoque_minimo, estoque_maximo, fornecedor, status, observacoes
  } = data;

  const req = await request()
  const result = await req
    .input("id", sql.Int, id)
    .input("nome_produto", sql.VarChar, nome_produto)
    .input("preco", sql.Decimal(10, 2), preco)
    .input("grupo_id", sql.Int, grupo_id || null)
    .input("estabelecimento_id", sql.Int, estabelecimento_id)
    .input("codigo_produto", sql.VarChar, codigo_produto)
    .input("codigo_barras", sql.VarChar, codigo_barras)
    .input("preco_custo", sql.Decimal(10, 2), preco_custo)
    .input("margem_percentual", sql.Decimal(10, 2), margem_percentual)
    .input("estoque_atual", sql.Int, estoque_atual)
    .input("estoque_minimo", sql.Int, estoque_minimo)
    .input("estoque_maximo", sql.Int, estoque_maximo)
    .input("fornecedor", sql.VarChar, fornecedor)
    .input("status", sql.VarChar, status)
    .input("observacoes", sql.VarChar, observacoes)
    .query(`
      UPDATE produtos 
      SET nome_produto = @nome_produto,
          preco = @preco,
          grupo_id = @grupo_id,
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
    `)

  if (result.rowsAffected[0] === 0) throw new Error("Produto não encontrado")
  return { id, ...data }
}

async function deleteProduct({ id, estabelecimento_id }) {
  const req = await request()
  const result = await req
    .input("id", sql.Int, id)
    .input("estabelecimento_id", sql.Int, estabelecimento_id)
    .query("DELETE FROM produtos WHERE id = @id AND estabelecimento_id = @estabelecimento_id")

  if (result.rowsAffected[0] === 0) throw new Error("Produto não encontrado")
}

async function relatorioEstoque({ estabelecimento_id, codigo, nome_produto, grupo_id, status, fornecedor }) {
  const req = await request()

  req.input('estabelecimento_id', sql.Int, estabelecimento_id)

  let where = 'WHERE p.estabelecimento_id = @estabelecimento_id'

  if (codigo) {
    req.input('codigo', sql.VarChar, `%${codigo}%`)
    where += ' AND p.codigo_produto LIKE @codigo'
  }
  if (nome_produto) {
    req.input('nome_produto', sql.VarChar, `%${nome_produto}%`)
    where += ' AND p.nome_produto LIKE @nome_produto'
  }
  if (grupo_id) {
    req.input('grupo_id', sql.Int, grupo_id)
    where += ' AND p.grupo_id = @grupo_id'
  }
  if (status) {
    req.input('status', sql.VarChar, status)
    where += ' AND p.status = @status'
  }
  if (fornecedor) {
    req.input('fornecedor', sql.VarChar, `%${fornecedor}%`)
    where += ' AND p.fornecedor LIKE @fornecedor'
  }

  const result = await req.query(`
    SELECT 
      p.*,
      g.nome AS grupo,
      CASE
        WHEN p.estoque_atual = 0 THEN 'Zerado'
        WHEN p.estoque_atual <= p.estoque_minimo THEN 'Baixo'
        ELSE 'Normal'
      END AS situacao_estoque
    FROM produtos p
    LEFT JOIN grupos_produto g ON p.grupo_id = g.id
    ${where}
    ORDER BY p.nome_produto
  `)

  return result.recordset
}

async function deletarProduto({ id, estabelecimento_id }) {
  const checkReq = await request()
  const check = await checkReq
    .input('produto_id', sql.Int, id)
    .query('SELECT COUNT(*) as total FROM itens_venda WHERE produto_id = @produto_id')

  if (check.recordset[0].total > 0) {
    throw new Error('Produto não pode ser excluído pois possui vendas vinculadas. Inative-o.')
  }

  const req = await request()
  await req
    .input('id', sql.Int, id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('DELETE FROM produtos WHERE id = @id AND estabelecimento_id = @estabelecimento_id')
}

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  relatorioEstoque,
  deletarProduto
}