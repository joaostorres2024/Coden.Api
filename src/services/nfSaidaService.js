const { request, sql } = require('../config/db')

async function gerarNfSaida(venda_id, estabelecimento_id) {
  // 1. Buscar venda
  const vendaReq = await request()
  const vendaResult = await vendaReq
    .input('venda_id', sql.Int, venda_id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query(`
      SELECT v.*, c.nome_cliente
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.id = @venda_id AND v.estabelecimento_id = @estabelecimento_id
    `)

  const venda = vendaResult.recordset[0]
  if (!venda) throw new Error('Venda não encontrada')

  // 2. Buscar itens da venda
  const itensReq = await request()
  const itensResult = await itensReq
    .input('venda_id', sql.Int, venda_id)
    .query(`
      SELECT iv.*, p.nome_produto
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      WHERE iv.venda_id = @venda_id
    `)

  const itens = itensResult.recordset
  if (itens.length === 0) throw new Error('Venda sem itens')

  // 3. Gerar número da NF
  const codReq = await request()
  const codResult = await codReq
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('SELECT COUNT(*) AS total FROM nf_saida WHERE estabelecimento_id = @estabelecimento_id')
  const numero_nf = `NFS${String(codResult.recordset[0].total + 1).padStart(6, '0')}`

  // 4. Inserir NF
  const nfReq = await request()
  const nfResult = await nfReq
    .input('numero_nf', sql.VarChar, numero_nf)
    .input('venda_id', sql.Int, venda_id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .input('cliente_id', sql.Int, venda.cliente_id || null)
    .input('forma_pagamento', sql.VarChar, venda.forma_pagamento)
    .input('subtotal', sql.Decimal(10, 2), venda.subtotal)
    .input('desconto', sql.Decimal(10, 2), venda.desconto || 0)
    .input('total', sql.Decimal(10, 2), venda.total)
    .query(`
      INSERT INTO nf_saida (numero_nf, venda_id, estabelecimento_id, cliente_id, forma_pagamento, subtotal, desconto, total)
      OUTPUT INSERTED.id
      VALUES (@numero_nf, @venda_id, @estabelecimento_id, @cliente_id, @forma_pagamento, @subtotal, @desconto, @total)
    `)

  const nf_id = nfResult.recordset[0].id

  // 5. Inserir itens da NF
  for (const item of itens) {
    const itemReq = await request()
    await itemReq
      .input('nf_saida_id', sql.Int, nf_id)
      .input('produto_id', sql.Int, item.produto_id)
      .input('nome_produto', sql.VarChar, item.nome_produto)
      .input('quantidade', sql.Int, item.quantidade)
      .input('preco_unitario', sql.Decimal(10, 2), item.preco_unitario)
      .input('desconto', sql.Decimal(10, 2), item.desconto || 0)
      .input('subtotal', sql.Decimal(10, 2), item.subtotal)
      .query(`
        INSERT INTO nf_saida_itens (nf_saida_id, produto_id, nome_produto, quantidade, preco_unitario, desconto, subtotal)
        VALUES (@nf_saida_id, @produto_id, @nome_produto, @quantidade, @preco_unitario, @desconto, @subtotal)
      `)
  }

  return { id: nf_id, numero_nf, message: 'NF de saída gerada com sucesso' }
}

async function listarNfSaida(estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query(`
      SELECT 
        nf.*,
        c.nome_cliente,
        v.codigo_venda
      FROM nf_saida nf
      LEFT JOIN clientes c ON nf.cliente_id = c.id
      LEFT JOIN vendas v ON nf.venda_id = v.id
      WHERE nf.estabelecimento_id = @estabelecimento_id
      ORDER BY nf.data_emissao DESC
    `)
  return result.recordset
}

async function buscarNfSaida(id, estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('id', sql.Int, id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query(`
      SELECT nf.*, c.nome_cliente, v.codigo_venda
      FROM nf_saida nf
      LEFT JOIN clientes c ON nf.cliente_id = c.id
      LEFT JOIN vendas v ON nf.venda_id = v.id
      WHERE nf.id = @id AND nf.estabelecimento_id = @estabelecimento_id
    `)

  if (!result.recordset[0]) throw new Error('NF não encontrada')

  const itensReq = await request()
  const itens = await itensReq
    .input('nf_saida_id', sql.Int, id)
    .query('SELECT * FROM nf_saida_itens WHERE nf_saida_id = @nf_saida_id')

  return { ...result.recordset[0], itens: itens.recordset }
}

module.exports = { gerarNfSaida, listarNfSaida, buscarNfSaida }