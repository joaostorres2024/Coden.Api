const dashboardService = require('../services/dashboardService')

async function dashboard(req, res) {
  try {
    const estabelecimento_id = req.user.estabelecimento_id
    const { de, ate } = req.query

    const metricas =
      await dashboardService.getDashboard(
        estabelecimento_id,
        de,
        ate
      )

    const produtosVendidos =
      await dashboardService.getProdutosVendidos(
        estabelecimento_id,
        de,
        ate
      )

    res.json({
      totalVendas: metricas.total_vendas,
      totalPedidos: metricas.total_pedidos,
      ticketMedio: metricas.ticket_medio,
      produtosVendidos
    })

  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
}

async function grafico(req, res) {
  try {
    const estabelecimento_id = req.user.estabelecimento_id
    const { de, ate } = req.query

    const dados =
      await dashboardService.getGrafico(
        estabelecimento_id,
        de,
        ate
      )

    res.json(dados)

  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
}

async function situacao(req, res) {
  try {
    const estabelecimento_id =
      req.user.estabelecimento_id

    const dados =
      await dashboardService.getSituacaoPedidos(
        estabelecimento_id
      )

    res.json(dados)

  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
}

module.exports = {
  dashboard,
  grafico,
  situacao
}