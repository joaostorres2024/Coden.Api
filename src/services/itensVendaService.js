const { request, sql } = require('../config/db')

async function adicionarItem(venda_id, produto_id, quantidade, desconto = 0, estabelecimento_id) {

  const vendaReq = await request()
  const vendaResult = await vendaReq
    .input('venda_id', sql.Int, venda_id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('SELECT * FROM vendas WHERE id = @venda_id AND estabelecimento_id = @estabelecimento_id')

  const venda = vendaResult.recordset[0]
  if (!venda) throw new Error('Venda não encontrada')
  if (venda.status === 'cancelada') throw new Error('Não é possível alterar uma venda cancelada')

  const produtoReq = await request()
  const produtoResult = await produtoReq
    .input('produto_id', sql.Int, produto_id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('SELECT * FROM produtos WHERE id = @produto_id AND estabelecimento_id = @estabelecimento_id')

  const produto = produtoResult.recordset[0]
  if (!produto) throw new Error('Produto não encontrado')
  if (produto.estoque_atual < quantidade) throw new Error(`Estoque insuficiente para o produto ${produto.nome_produto}`)

  const preco_unitario = produto.preco
  const subtotal = (preco_unitario * quantidade) - desconto

  const itemReq = await request()
  await itemReq
    .input('venda_id', sql.Int, venda_id)
    .input('produto_id', sql.Int, produto_id)
    .input('quantidade', sql.Int, quantidade)
    .input('preco_unitario', sql.Decimal(10, 2), preco_unitario)
    .input('desconto', sql.Decimal(10, 2), desconto)
    .input('subtotal', sql.Decimal(10, 2), subtotal)
    .query(`
      INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, desconto, subtotal)
      VALUES (@venda_id, @produto_id, @quantidade, @preco_unitario, @desconto, @subtotal)
    `)

  try {
    const estoqueReq = await request()
    const estoqueResult = await estoqueReq
      .input('quantidade', sql.Int, Number(quantidade))
      .input('produto_id', sql.Int, Number(produto_id))
      .query('UPDATE produtos SET estoque_atual = estoque_atual - @quantidade WHERE id = @produto_id')
  } catch (estoqueErr) {
    throw estoqueErr
  }

try {
  await recalcularTotais(venda_id)
} catch (err) {
  throw err
}
}

async function removerItem(item_id, estabelecimento_id) {

  const itemReq = await request()
  const itemResult = await itemReq
    .input('item_id', sql.Int, item_id)
    .query('SELECT * FROM itens_venda WHERE id = @item_id')

  const item = itemResult.recordset[0]
  if (!item) throw new Error('Item não encontrado')

  const vendaReq = await request()
  const vendaResult = await vendaReq
    .input('venda_id', sql.Int, item.venda_id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('SELECT * FROM vendas WHERE id = @venda_id AND estabelecimento_id = @estabelecimento_id')

  const venda = vendaResult.recordset[0]
  if (!venda) throw new Error('Venda não encontrada')
  if (venda.status === 'cancelada') throw new Error('Não é possível alterar uma venda cancelada')

  const estoqueReq = await request()
  await estoqueReq
    .input('quantidade', sql.Int, item.quantidade)
    .input('produto_id', sql.Int, item.produto_id)
    .query('UPDATE produtos SET estoque_atual = estoque_atual + @quantidade WHERE id = @produto_id')

  const deleteReq = await request()
  await deleteReq
    .input('item_id', sql.Int, item_id)
    .query('DELETE FROM itens_venda WHERE id = @item_id')

  await recalcularTotais(item.venda_id)

  return { message: 'Item removido com sucesso' }
}

async function listarItensDaVenda(venda_id, estabelecimento_id) {

  const vendaReq = await request()
  const vendaResult = await vendaReq
    .input('venda_id', sql.Int, venda_id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('SELECT * FROM vendas WHERE id = @venda_id AND estabelecimento_id = @estabelecimento_id')

  if (!vendaResult.recordset[0]) throw new Error('Venda não encontrada')

  const itensReq = await request()
  const result = await itensReq
    .input('venda_id', sql.Int, venda_id)
    .query(`
      SELECT iv.*, p.nome_produto, p.codigo_produto
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      WHERE iv.venda_id = @venda_id
    `)

  return result.recordset
}

async function recalcularTotais(venda_id) {

  const vendaReq = await request()
  const vendaResult = await vendaReq
    .input('venda_id', sql.Int, venda_id)
    .query('SELECT desconto FROM vendas WHERE id = @venda_id')

  const desconto_global = vendaResult.recordset[0]?.desconto || 0

  const somaReq = await request()
  const somaResult = await somaReq
    .input('venda_id', sql.Int, venda_id)
    .query('SELECT ISNULL(SUM(subtotal), 0) AS subtotal FROM itens_venda WHERE venda_id = @venda_id')

  const subtotal = somaResult.recordset[0].subtotal
  const total = subtotal - desconto_global

  const updateReq = await request()
  await updateReq
    .input('subtotal', sql.Decimal(10, 2), subtotal)
    .input('total', sql.Decimal(10, 2), total)
    .input('venda_id', sql.Int, venda_id)
    .query('UPDATE vendas SET subtotal = @subtotal, total = @total WHERE id = @venda_id')
}

module.exports = { adicionarItem, removerItem, listarItensDaVenda }