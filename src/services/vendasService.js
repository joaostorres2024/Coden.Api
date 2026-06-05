const { request, sql } = require('../config/db');
const nfSaidaService = require('./nfSaidaService')

async function criarVendaComItens(estabelecimento_id, cliente_id, itens, forma_pagamento, desconto_global = 0, observacoes = '') {
  
  let subtotal = 0
  const itensComPreco = []
  const produtosMap = new Map()
  

  if (itens && itens.length > 0) {
    for (const item of itens) {
      const estoqueReq = await request()
      const produtoResult = await estoqueReq
        .input('produto_id', sql.Int, item.produto_id)
        .input('estabelecimento_id', sql.Int, estabelecimento_id)
        .query('SELECT * FROM produtos WHERE id = @produto_id AND estabelecimento_id = @estabelecimento_id')

      const produto = produtoResult.recordset[0]

  if (!produto) {
    throw new Error(`Produto ${item.produto_id} não encontrado`)
  }

  produtosMap.set(produto.id, produto)
      if (produto.estoque_atual < item.quantidade) throw new Error(`Estoque insuficiente para o produto ${produto.nome_produto}`)
    }

      const produto = produtosMap.get(item.produto_id)
      const desconto_item = item.desconto || 0
      const subtotal_item = (produto.preco * item.quantidade) - desconto_item
      subtotal += subtotal_item
      itensComPreco.push({ ...item, preco_unitario: produto.preco, subtotal: subtotal_item, desconto: desconto_item })
    }
  }

  const total = Math.max(
    0,
    subtotal - desconto_global
  )


  const vendaReq = await request()
  const vendaResult = await vendaReq
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .input('cliente_id', sql.Int, cliente_id || null)
    .input('forma_pagamento', sql.VarChar, forma_pagamento)
    .input('status', sql.VarChar, 'concluida')
    .input('subtotal', sql.Decimal(10, 2), subtotal)
    .input('desconto', sql.Decimal(10, 2), desconto_global)
    .input('total', sql.Decimal(10, 2), total)
    .input('observacoes', sql.VarChar, observacoes)
    .input('codigo_venda', sql.VarChar, '')
    .query(`
      INSERT INTO vendas (estabelecimento_id, cliente_id, forma_pagamento, status, subtotal, desconto, total, observacoes, codigo_venda, data)
      OUTPUT INSERTED.id
      VALUES (@estabelecimento_id, @cliente_id, @forma_pagamento, @status, @subtotal, @desconto, @total, @observacoes, @codigo_venda, GETDATE())
    `)

  const venda_id = vendaResult.recordset[0].id

  const codigo_venda = `VND${String(venda_id).padStart(5, '0')}`

  const updateCodigoReq = await request()

  await updateCodigoReq
    .input('id', sql.Int, venda_id)
    .input('codigo_venda', sql.VarChar, codigo_venda)
    .query(`
        UPDATE vendas
        SET codigo_venda = @codigo_venda
        WHERE id = @id
    `)

  for (const item of itensComPreco) {
    const itemReq = await request()
    await itemReq
      .input('venda_id', sql.Int, venda_id)
      .input('produto_id', sql.Int, item.produto_id)
      .input('quantidade', sql.Int, item.quantidade)
      .input('preco_unitario', sql.Decimal(10, 2), item.preco_unitario)
      .input('desconto', sql.Decimal(10, 2), item.desconto)
      .input('subtotal', sql.Decimal(10, 2), item.subtotal)
      .query(`
        INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, desconto, subtotal)
        VALUES (@venda_id, @produto_id, @quantidade, @preco_unitario, @desconto, @subtotal)
      `)

    const estoqueReq = await request()

    const resultadoEstoque =
      await estoqueReq
      .input('quantidade', sql.Int, item.quantidade)
      .input('produto_id', sql.Int, item.produto_id)
      .query(`
        UPDATE produtos
        SET estoque_atual =
        estoque_atual - @quantidade
        WHERE id = @produto_id
        AND estoque_atual >= @quantidade
  `)
  if (resultadoEstoque.rowsAffected[0] === 0) {
    throw new Error(
      'Estoque insuficiente'
    )
  } 

}

return {
  id: venda_id,
  codigo_venda,
  total,
  message: 'Venda criada com sucesso'
}

async function listarVendas(estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query(`
      SELECT v.*, c.nome_cliente
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.estabelecimento_id = @estabelecimento_id
      ORDER BY v.data DESC
    `)
  return result.recordset
}

async function buscarVendaPorId(id, estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('id', sql.Int, id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query(`
      SELECT v.*, c.nome_cliente
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.id = @id AND v.estabelecimento_id = @estabelecimento_id
    `)

  if (!result.recordset[0]) throw new Error('Venda não encontrada')

  const itensReq = await request()
  const itens = await itensReq
    .input('venda_id', sql.Int, id)
    .query(`
      SELECT iv.*, p.nome_produto
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      WHERE iv.venda_id = @venda_id
    `)

  return { ...result.recordset[0], itens: itens.recordset }
}

async function cancelarVenda(id, estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('id', sql.Int, id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('SELECT * FROM vendas WHERE id = @id AND estabelecimento_id = @estabelecimento_id')

  const venda = result.recordset[0]
  if (!venda) throw new Error('Venda não encontrada')
  if (venda.status === 'cancelada') throw new Error('Venda já está cancelada')

  const itensReq = await request()
  const itens = await itensReq
    .input('venda_id', sql.Int, id)
    .query('SELECT * FROM itens_venda WHERE venda_id = @venda_id')

  for (const item of itens.recordset) {
    const estoqueReq = await request()
    await estoqueReq
      .input('quantidade', sql.Int, item.quantidade)
      .input('produto_id', sql.Int, item.produto_id)
      .query('UPDATE produtos SET estoque_atual = estoque_atual + @quantidade WHERE id = @produto_id')
  }

  const cancelReq = await request()
  await cancelReq
    .input('id', sql.Int, id)
    .query("UPDATE vendas SET status = 'cancelada' WHERE id = @id")

  return { message: 'Venda cancelada com sucesso' }
}

async function finalizarVenda(id, forma_pagamento, estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('id', sql.Int, id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('SELECT * FROM vendas WHERE id = @id AND estabelecimento_id = @estabelecimento_id')

  if (!result.recordset[0]) throw new Error('Venda não encontrada')

  const updateReq = await request()
  await updateReq
    .input('id', sql.Int, id)
    .input('forma_pagamento', sql.VarChar, forma_pagamento)
    .query("UPDATE vendas SET status = 'concluida', forma_pagamento = @forma_pagamento WHERE id = @id")

  await nfSaidaService.gerarNfSaida(id, estabelecimento_id)
}

async function relatorioVendas({ estabelecimento_id, de, ate, cliente, produto, forma_pagamento }) {
  const req = await request()

  req.input('estabelecimento_id', sql.Int, estabelecimento_id)

let where = 'WHERE v.estabelecimento_id = @estabelecimento_id AND v.status = \'concluida\' AND v.forma_pagamento != \'pendente\''

  if (de) {
    req.input(
      'de',
      sql.DateTime,
      `${de} 00:00:00`
    )

    where += ' AND v.data >= @de'
  }

  if (ate) {
    req.input(
      'ate',
      sql.DateTime,
      `${ate} 23:59:59`
    )

    where += ' AND v.data <= @ate'
  }
  if (cliente?.trim()) {
    req.input('cliente', sql.VarChar, `%${cliente.trim()}%`)
    where += ' AND c.nome_cliente LIKE @cliente'
  }
  if (forma_pagamento?.trim()) {
    req.input('forma_pagamento', sql.VarChar, forma_pagamento.toLowerCase())
    where += ' AND v.forma_pagamento = @forma_pagamento'
  }
  if (produto?.trim()) {
  req.input(
    'produto',
    sql.VarChar,
    `%${produto.trim()}%`
  )

  where += `
    AND EXISTS (
      SELECT 1
      FROM itens_venda iv2
      JOIN produtos p2
      ON p2.id = iv2.produto_id
      WHERE iv2.venda_id = v.id
      AND p2.nome_produto LIKE @produto
    )
  `
}

console.log({
  estabelecimento_id,
  de,
  ate,
  cliente,
  produto,
  forma_pagamento
})

console.log(where)

const result = await req.query(`
  SELECT
    v.id,
    v.codigo_venda,
    v.data,
    v.forma_pagamento,
    ISNULL(SUM(iv.subtotal), 0) AS subtotal,
    v.desconto AS desconto_global,
    ISNULL(SUM(iv.desconto), 0) AS desconto_itens,
    v.desconto + ISNULL(SUM(iv.desconto), 0) AS desconto_total,
    v.total,
    v.status,
    c.nome_cliente
  FROM vendas v
  LEFT JOIN clientes c ON v.cliente_id = c.id
  LEFT JOIN itens_venda iv ON iv.venda_id = v.id
  ${where}
  GROUP BY v.id, v.codigo_venda, v.data, v.forma_pagamento,
           v.desconto, v.total, v.status, c.nome_cliente
  ORDER BY v.data DESC
`)

  const vendas = result.recordset

  return vendas
}

async function deletarVenda(id, estabelecimento_id) {
  const itensReq = await request()
  await itensReq
    .input('venda_id', sql.Int, id)
    .query('DELETE FROM itens_venda WHERE venda_id = @venda_id')

  const req = await request()
  await req
    .input('id', sql.Int, id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('DELETE FROM vendas WHERE id = @id AND estabelecimento_id = @estabelecimento_id AND status != \'concluida\'')
}

async function vendasPorUF(estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query(`
      SELECT 
        c.uf,
        COUNT(v.id) as total_vendas,
        SUM(v.total) as valor_total
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      WHERE v.estabelecimento_id = @estabelecimento_id
        AND v.status = 'concluida'
        AND c.uf IS NOT NULL
      GROUP BY c.uf
      ORDER BY total_vendas DESC
    `)
  return result.recordset
}

module.exports = { criarVendaComItens, listarVendas, buscarVendaPorId, cancelarVenda, finalizarVenda, relatorioVendas, deletarVenda, vendasPorUF }