const { request, sql } = require('../config/db')

async function criarNfEntrada({
  estabelecimento_id, numero_nf, serie, data_emissao, fornecedor,
  cnpj_cpf, inscricao_estadual, uf, valor_total, observacoes,
  origem_tributaria, icms, ipi, pis, cofins, itens
}) {

  const nfReq = await request()
  const nfResult = await nfReq
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .input('numero_nf', sql.VarChar, numero_nf)
    .input('serie', sql.VarChar, serie)
    .input('data_emissao', sql.Date, data_emissao || null)
    .input('data_entrada', sql.Date, new Date())
    .input('fornecedor', sql.VarChar, fornecedor)
    .input('cnpj_cpf', sql.VarChar, cnpj_cpf)
    .input('inscricao_estadual', sql.VarChar, inscricao_estadual)
    .input('uf', sql.VarChar, uf)
    .input('valor_total', sql.Decimal(10, 2), valor_total || 0)
    .input('observacoes', sql.VarChar, observacoes)
    .input('origem_tributaria', sql.VarChar, origem_tributaria)
    .input('icms', sql.Decimal(10, 2), icms || 0)
    .input('ipi', sql.Decimal(10, 2), ipi || 0)
    .input('pis', sql.Decimal(10, 2), pis || 0)
    .input('cofins', sql.Decimal(10, 2), cofins || 0)
    .query(`
    INSERT INTO nf_entrada (
      estabelecimento_id, numero_nf, serie, data_emissao, data_entrada,
      fornecedor, cnpj_cpf, inscricao_estadual, uf, valor_total,
      observacoes, origem_tributaria, icms, ipi, pis, cofins
    )
      OUTPUT INSERTED.id
      VALUES (
        @estabelecimento_id, @numero_nf, @serie, @data_emissao, @data_entrada,
        @fornecedor, @cnpj_cpf, @inscricao_estadual, @uf, @valor_total,
        @observacoes, @origem_tributaria, @icms, @ipi, @pis, @cofins
      )
    `)

  const nf_entrada_id = nfResult.recordset[0].id

  for (const item of itens) {
    if (item.codigo_produto) {
  const checkReq = await request()
  const checkResult = await checkReq
    .input('codigo_produto', sql.VarChar, item.codigo_produto)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('SELECT id FROM produtos WHERE codigo_produto = @codigo_produto AND estabelecimento_id = @estabelecimento_id')

  if (checkResult.recordset.length === 0) {
    const prodReq = await request()
    const prodResult = await prodReq
      .input('nome_produto', sql.VarChar, item.nome_produto)
      .input('codigo_produto', sql.VarChar, item.codigo_produto)
      .input('codigo_barras', sql.VarChar, item.codigo_barras || null)
      .input('preco_custo', sql.Decimal(10, 2), item.valor_unitario || 0)
      .input('preco', sql.Decimal(10, 2), item.preco_venda || 0)
      .input('estoque_atual', sql.Int, item.quantidade || 0)
      .input('estoque_minimo', sql.Int, 1)
      .input('estoque_maximo', sql.Int, 0)
      .input('grupo_id', sql.Int, item.grupo_id || null)
      .input('estabelecimento_id', sql.Int, estabelecimento_id)
      .input('fornecedor', sql.VarChar, fornecedor)
      .input('status', sql.VarChar, 'Ativo')
      .query(`
        INSERT INTO produtos (
          nome_produto, codigo_produto, codigo_barras,
          preco_custo, preco, estoque_atual, estoque_minimo,
          estoque_maximo, grupo_id, estabelecimento_id, fornecedor, status
        )
        OUTPUT INSERTED.id
        VALUES (
          @nome_produto, @codigo_produto, @codigo_barras,
          @preco_custo, @preco, @estoque_atual, @estoque_minimo,
          @estoque_maximo, @grupo_id, @estabelecimento_id, @fornecedor, @status
        )
      `)

    const produto_id = prodResult.recordset[0].id

    const updateItemReq = await request()
    await updateItemReq
      .input('produto_id', sql.Int, produto_id)
      .input('nf_entrada_id', sql.Int, nf_entrada_id)
      .input('codigo_produto', sql.VarChar, item.codigo_produto)
      .query('UPDATE nf_entrada_itens SET produto_id = @produto_id WHERE nf_entrada_id = @nf_entrada_id AND codigo_produto = @codigo_produto')

  } else {
    const produto_id = checkResult.recordset[0].id
    const estoqueReq = await request()
    await estoqueReq
      .input('quantidade', sql.Int, item.quantidade)
      .input('preco_custo', sql.Decimal(10, 2), item.valor_unitario)
      .input('preco', sql.Decimal(10, 2), item.preco_venda || 0)
      .input('produto_id', sql.Int, produto_id)
      .query(`
        UPDATE produtos SET
          estoque_atual = estoque_atual + @quantidade,
          preco_custo = @preco_custo,
          preco = CASE WHEN @preco > 0 THEN @preco ELSE preco END
        WHERE id = @produto_id
      `)
  }
}
    const itemReq = await request()
    await itemReq
      .input('nf_entrada_id', sql.Int, nf_entrada_id)
      .input('produto_id', sql.Int, item.produto_id || null)
      .input('codigo_produto', sql.VarChar, item.codigo_produto)
      .input('nome_produto', sql.VarChar, item.nome_produto)
      .input('quantidade', sql.Int, item.quantidade)
      .input('valor_unitario', sql.Decimal(10, 2), item.valor_unitario)
      .input('valor_total', sql.Decimal(10, 2), item.valor_total)
      .input('preco_venda', sql.Decimal(10, 2), item.preco_venda || 0)
      .input('margem', sql.Decimal(10, 2), item.margem || 0)
      .input('grupo_id', sql.Int, item.grupo_id || null)
      .input('codigo_barras', sql.VarChar, item.codigo_barras || null)
      .query(`
        INSERT INTO nf_entrada_itens (
          nf_entrada_id, produto_id, codigo_produto, nome_produto,
          quantidade, valor_unitario, valor_total, preco_venda,
          margem, grupo_id, codigo_barras
        )
        VALUES (
          @nf_entrada_id, @produto_id, @codigo_produto, @nome_produto,
          @quantidade, @valor_unitario, @valor_total, @preco_venda,
          @margem, @grupo_id, @codigo_barras
        )
      `)

    if (item.produto_id) {
      const estoqueReq = await request()
      await estoqueReq
        .input('quantidade', sql.Int, item.quantidade)
        .input('produto_id', sql.Int, item.produto_id)
        .input('preco_custo', sql.Decimal(10, 2), item.valor_unitario)
        .input('preco', sql.Decimal(10, 2), item.preco_venda || 0)
        .query(`
          UPDATE produtos SET
            estoque_atual = estoque_atual + @quantidade,
            preco_custo = @preco_custo,
            preco = CASE WHEN @preco > 0 THEN @preco ELSE preco END
          WHERE id = @produto_id
        `)
    }
  }

  return { id: nf_entrada_id, message: 'NF de entrada cadastrada com sucesso' }
}

async function listarNfEntrada(estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query(`
      SELECT *
      FROM nf_entrada
      WHERE estabelecimento_id = @estabelecimento_id
      ORDER BY data_entrada DESC
    `)
  return result.recordset
}

async function buscarNfEntrada(id, estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('id', sql.Int, id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('SELECT * FROM nf_entrada WHERE id = @id AND estabelecimento_id = @estabelecimento_id')

  if (!result.recordset[0]) throw new Error('NF não encontrada')

  const itensReq = await request()
  const itens = await itensReq
    .input('nf_entrada_id', sql.Int, id)
    .query('SELECT * FROM nf_entrada_itens WHERE nf_entrada_id = @nf_entrada_id')

  return { ...result.recordset[0], itens: itens.recordset }
}

module.exports = { criarNfEntrada, listarNfEntrada, buscarNfEntrada }