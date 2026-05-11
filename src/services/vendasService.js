const { request, sql } = require('../config/db');
const nfSaidaService = require('./nfSaidaService')

async function criarVendaComItens(estabelecimento_id, cliente_id, itens, forma_pagamento, desconto_global = 0, observacoes = '') {
  
  let subtotal = 0
  const itensComPreco = []

  if (itens && itens.length > 0) {
    for (const item of itens) {
      const estoqueReq = await request()
      const produtoResult = await estoqueReq
        .input('produto_id', sql.Int, item.produto_id)
        .input('estabelecimento_id', sql.Int, estabelecimento_id)
        .query('SELECT * FROM produtos WHERE id = @produto_id AND estabelecimento_id = @estabelecimento_id')

      const produto = produtoResult.recordset[0]
      if (!produto) throw new Error(`Produto ${item.produto_id} não encontrado`)
      if (produto.estoque_atual < item.quantidade) throw new Error(`Estoque insuficiente para o produto ${produto.nome_produto}`)
    }

    for (const item of itens) {
      const prodReq = await request()
      const prodResult = await prodReq
        .input('produto_id', sql.Int, item.produto_id)
        .query('SELECT * FROM produtos WHERE id = @produto_id')
      const produto = prodResult.recordset[0]
      const desconto_item = item.desconto || 0
      const subtotal_item = (produto.preco * item.quantidade) - desconto_item
      subtotal += subtotal_item
      itensComPreco.push({ ...item, preco_unitario: produto.preco, subtotal: subtotal_item, desconto: desconto_item })
    }
  }

  const total = subtotal - desconto_global

  const codReq = await request()
  const codResult = await codReq
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('SELECT COUNT(*) AS total FROM vendas WHERE estabelecimento_id = @estabelecimento_id')
  const codigo_venda = `VND${String(codResult.recordset[0].total + 1).padStart(5, '0')}`

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
    .input('codigo_venda', sql.VarChar, codigo_venda)
    .query(`
      INSERT INTO vendas (estabelecimento_id, cliente_id, forma_pagamento, status, subtotal, desconto, total, observacoes, codigo_venda, data)
      OUTPUT INSERTED.id
      VALUES (@estabelecimento_id, @cliente_id, @forma_pagamento, @status, @subtotal, @desconto, @total, @observacoes, @codigo_venda, GETDATE())
    `)

  const venda_id = vendaResult.recordset[0].id

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
    await estoqueReq
      .input('quantidade', sql.Int, item.quantidade)
      .input('produto_id', sql.Int, item.produto_id)
      .query('UPDATE produtos SET estoque_atual = estoque_atual - @quantidade WHERE id = @produto_id')
  }

  return { id: venda_id, codigo_venda, total, message: 'Venda criada com sucesso' }
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

if (ate) {
  const ateDate = new Date(ate)
  ateDate.setHours(23, 59, 59, 999)
  req.input('ate', sql.DateTime, ateDate)
  where += ' AND v.data <= @ate'
}
  if (cliente) {
    req.input('cliente', sql.VarChar, `%${cliente}%`)
    where += ' AND c.nome_cliente LIKE @cliente'
  }
  if (forma_pagamento) {
    req.input('forma_pagamento', sql.VarChar, forma_pagamento)
    where += ' AND v.forma_pagamento = @forma_pagamento'
  }

const result = await req.query(`
  SELECT
    v.id,
    v.codigo_venda,
    v.data,
    v.forma_pagamento,
    ISNULL(SUM(iv.preco_unitario), 0) AS subtotal,
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

  if (produto) {
    const vendasFiltradas = []
    for (const venda of vendas) {
      const itensReq = await request()
      const itens = await itensReq
        .input('venda_id', sql.Int, venda.id)
        .input('produto', sql.VarChar, `%${produto}%`)
        .query(`
          SELECT iv.*, p.nome_produto
          FROM itens_venda iv
          JOIN produtos p ON iv.produto_id = p.id
          WHERE iv.venda_id = @venda_id
          AND p.nome_produto LIKE @produto
        `)
      if (itens.recordset.length > 0) {
        vendasFiltradas.push({ ...venda, itens: itens.recordset })
      }
    }
    return vendasFiltradas
  }

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