const { request, sql } = require('../config/db')

async function getDashboard(estabelecimento_id, de, ate) {
  const req = await request()

  req.input('estabelecimento_id', sql.Int, estabelecimento_id)

  let where = `
    WHERE estabelecimento_id = @estabelecimento_id
    AND status = 'concluida'
  `

  if (de) {
    req.input('de', sql.DateTime, `${de} 00:00:00`)
    where += ' AND data >= @de'
  }

  if (ate) {
    req.input('ate', sql.DateTime, `${ate} 23:59:59`)
    where += ' AND data <= @ate'
  }

  const vendas = await req.query(`
    SELECT
      COUNT(*) total_pedidos,
      ISNULL(SUM(total),0) total_vendas,
      ISNULL(AVG(total),0) ticket_medio
    FROM vendas
    ${where}
  `)

  return vendas.recordset[0]
}

async function getProdutosVendidos(estabelecimento_id, de, ate) {
  const req = await request()

  req.input('estabelecimento_id', sql.Int, estabelecimento_id)

  let where = `
    WHERE v.estabelecimento_id = @estabelecimento_id
    AND v.status = 'concluida'
  `

  if (de) {
    req.input('de', sql.DateTime, `${de} 00:00:00`)
    where += ' AND v.data >= @de'
  }

  if (ate) {
    req.input('ate', sql.DateTime, `${ate} 23:59:59`)
    where += ' AND v.data <= @ate'
  }

  const result = await req.query(`
    SELECT ISNULL(SUM(iv.quantidade),0) total
    FROM itens_venda iv
    JOIN vendas v ON v.id = iv.venda_id
    ${where}
  `)

  return result.recordset[0].total
}

async function getGrafico(estabelecimento_id, de, ate) {
  const req = await request()

  req.input('estabelecimento_id', sql.Int, estabelecimento_id)

  let where = `
    WHERE estabelecimento_id = @estabelecimento_id
    AND status = 'concluida'
  `

  if (de) {
    req.input('de', sql.DateTime, `${de} 00:00:00`)
    where += ' AND data >= @de'
  }

  if (ate) {
    req.input('ate', sql.DateTime, `${ate} 23:59:59`)
    where += ' AND data <= @ate'
  }

  const result = await req.query(`
    SELECT
      CONVERT(VARCHAR(10), data, 103) data,
      SUM(total) valor
    FROM vendas
    ${where}
    GROUP BY CONVERT(VARCHAR(10), data, 103)
    ORDER BY MIN(data)
  `)

  return result.recordset
}

async function getSituacaoPedidos(estabelecimento_id) {
  const req = await request()

  req.input('estabelecimento_id', sql.Int, estabelecimento_id)

  const result = await req.query(`
    SELECT
      status,
      COUNT(*) quantidade,
      ISNULL(SUM(total),0) valor
    FROM vendas
    WHERE estabelecimento_id = @estabelecimento_id
    GROUP BY status
  `)

  return result.recordset
}

module.exports = {
  getDashboard,
  getProdutosVendidos,
  getGrafico,
  getSituacaoPedidos
}