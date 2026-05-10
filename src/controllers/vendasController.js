const vendasService = require('../services/vendasService')

async function criarVendaComItens(req, res) {
  try {
    const { cliente_id, itens, forma_pagamento, desconto, observacoes } = req.body
    const estabelecimento_id = req.user.estabelecimento_id
    const result = await vendasService.criarVendaComItens(estabelecimento_id, cliente_id, itens || [], forma_pagamento || 'pendente', desconto, observacoes)
    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function listarVendas(req, res) {
  try {
    const estabelecimento_id = req.user.estabelecimento_id
    const vendas = await vendasService.listarVendas(estabelecimento_id)
    res.json(vendas)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function buscarVendaPorId(req, res) {
  try {
    const estabelecimento_id = req.user.estabelecimento_id
    const venda = await vendasService.buscarVendaPorId(Number(req.params.id), estabelecimento_id)
    res.json(venda)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

async function cancelarVenda(req, res) {
  try {
    const estabelecimento_id = req.user.estabelecimento_id
    const result = await vendasService.cancelarVenda(Number(req.params.id), estabelecimento_id)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function finalizarVenda(req, res) {
  try {
    const { forma_pagamento } = req.body
    const estabelecimento_id = req.user.estabelecimento_id
    await vendasService.finalizarVenda(Number(req.params.id), forma_pagamento, estabelecimento_id)
    res.json({ message: 'Venda finalizada com sucesso!' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function relatorioVendas(req, res) {
  try {
    const { de, ate, cliente, produto, forma_pagamento } = req.query
    const estabelecimento_id = req.user.estabelecimento_id
  
    
    const resultado = await vendasService.relatorioVendas({
      estabelecimento_id, de, ate, cliente, produto, forma_pagamento
    })
    
    res.json(resultado)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function relatorioVendasPDF(req, res) {
  try {
    const PDFDocument = require('pdfkit')
    const { de, ate, cliente, produto, forma_pagamento } = req.query
    const estabelecimento_id = req.user.estabelecimento_id

    const vendas = await vendasService.relatorioVendas({
      estabelecimento_id, de, ate, cliente, produto, forma_pagamento
    })

    const estabelecimento = await require('../services/estabelecimentoService').buscarEstabelecimento(estabelecimento_id)

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_vendas.pdf')
    doc.pipe(res)

    const L = 30
    const W = 752
    const now = new Date()

    function formatarReais(valor) {
      const numero = parseFloat(valor)
      if (isNaN(numero)) return 'R$ 0,00'
      return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    function formatarData(data) {
      if (!data) return '-'
      return new Date(data).toLocaleDateString('pt-BR')
    }

    const formas = { pix: 'PIX', cartao: 'Cartão', dinheiro: 'Dinheiro' }

    // ═══════════════════════════════════════
    // CABEÇALHO
    // ═══════════════════════════════════════
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000')
      .text('Relatório de Vendas', L, 30, { width: W, align: 'right' })
    doc.fontSize(11).font('Helvetica').fillColor('#333')
      .text(now.toLocaleDateString('pt-BR'), L, 50, { width: W, align: 'right' })

    let y = 75

    doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a56a0').text('Empresa(s):', L, y)
    doc.fontSize(8).font('Helvetica').fillColor('#000').text(estabelecimento.nome || '-', L + 80, y)
    y += 14

    if (de || ate) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a56a0').text('Período:', L, y)
      doc.fontSize(8).font('Helvetica').fillColor('#000')
        .text(`${de ? formatarData(de) : '-'} até ${ate ? formatarData(ate) : '-'}`, L + 80, y)
      y += 14
    }
    if (cliente) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a56a0').text('Cliente:', L, y)
      doc.fontSize(8).font('Helvetica').fillColor('#000').text(cliente, L + 80, y)
      y += 14
    }
    if (forma_pagamento) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a56a0').text('Pagamento:', L, y)
      doc.fontSize(8).font('Helvetica').fillColor('#000').text(formas[forma_pagamento] || forma_pagamento, L + 80, y)
      y += 14
    }

    y += 10
    doc.moveTo(L, y).lineTo(L + W, y).lineWidth(2).stroke('#1a56a0')
    y += 8

    // ═══════════════════════════════════════
    // TABELA VENDAS
    // ═══════════════════════════════════════
    const cols = [
      { label: 'Cód. Venda', x: L, w: 80, align: 'left' },
      { label: 'Data', x: L + 80, w: 75, align: 'center' },
      { label: 'Cliente', x: L + 155, w: 200, align: 'left' },
      { label: 'Forma Pgto.', x: L + 355, w: 90, align: 'center' },
      { label: 'Subtotal', x: L + 445, w: 90, align: 'right' },
      { label: 'Desconto', x: L + 535, w: 80, align: 'right' },
      { label: 'Total', x: L + 615, w: 100, align: 'right' },
    ]

    doc.fontSize(7).font('Helvetica-Bold').fillColor('#1a56a0')
    cols.forEach(col => {
      doc.text(col.label, col.x, y, { width: col.w, align: col.align })
    })
    y += 12

    doc.moveTo(L, y).lineTo(L + W, y).lineWidth(0.5).stroke('#1a56a0')
    y += 4

    let totalVendas = 0
    let totalDesconto = 0
    let totalGeral = 0
    let isAlternate = false
    const totalPorForma = {}

    vendas.forEach((v) => {
      if (y > 530) {
        doc.addPage({ layout: 'landscape' })
        y = 30
      }

      if (isAlternate) {
        doc.rect(L, y - 2, W, 14).fillColor('#f5f5f5').fill()
      }
      isAlternate = !isAlternate

      doc.fontSize(7).font('Helvetica').fillColor('#000')
      doc.text(v.codigo_venda || '-', cols[0].x, y, { width: cols[0].w, align: cols[0].align })
      doc.text(formatarData(v.data), cols[1].x, y, { width: cols[1].w, align: cols[1].align })
      doc.text(v.nome_cliente || 'Consumidor Final', cols[2].x, y, { width: cols[2].w, align: cols[2].align })
      doc.text(formas[v.forma_pagamento] || v.forma_pagamento || '-', cols[3].x, y, { width: cols[3].w, align: cols[3].align })
      doc.text(formatarReais(v.subtotal), cols[4].x, y, { width: cols[4].w, align: cols[4].align })
      doc.text(v.desconto > 0 ? formatarReais(v.desconto) : '-', cols[5].x, y, { width: cols[5].w, align: cols[5].align })
      doc.text(formatarReais(v.total), cols[6].x, y, { width: cols[6].w, align: cols[6].align })

      totalVendas += 1
      totalDesconto += parseFloat(v.desconto) || 0
      totalGeral += parseFloat(v.total) || 0

      const forma = formas[v.forma_pagamento] || v.forma_pagamento || 'Outros'
      totalPorForma[forma] = (totalPorForma[forma] || 0) + parseFloat(v.total)

      y += 14
      doc.moveTo(L, y - 2).lineTo(L + W, y - 2).lineWidth(0.2).strokeColor('#ddd').stroke()
    })

    // ═══════════════════════════════════════
    // TOTAIS
    // ═══════════════════════════════════════
    y += 4
    doc.moveTo(L, y).lineTo(L + W, y).lineWidth(1.5).stroke('#1a56a0')
    y += 8

    const ticketMedio = totalVendas > 0 ? totalGeral / totalVendas : 0

    doc.fontSize(8).font('Helvetica-Bold').fillColor('#000')
      .text(`Total de Vendas: ${totalVendas}`, L, y)
      .text(`Total Desconto: ${formatarReais(totalDesconto)}`, L + 200, y)
      .text(`Ticket Médio: ${formatarReais(ticketMedio)}`, L + 420, y)
      .text(`Total Geral: ${formatarReais(totalGeral)}`, L + 600, y)

    y += 16

    // Total por forma de pagamento
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#1a56a0').text('Total por Forma de Pagamento:', L, y)
    y += 12
    Object.entries(totalPorForma).forEach(([forma, valor]) => {
      doc.fontSize(7).font('Helvetica').fillColor('#000')
        .text(`${forma}: ${formatarReais(valor)}`, L + 10, y)
      y += 12
    })

    // ═══════════════════════════════════════
    // RODAPÉ
    // ═══════════════════════════════════════
    y += 10
    doc.fontSize(6).font('Helvetica').fillColor('#888')
      .text(
        `Gerado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')} — Coden ERP`,
        L, y, { width: W, align: 'center' }
      )

    doc.end()

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function deletarVenda(req, res) {
  try {
    await vendasService.deletarVenda(Number(req.params.id), req.user.estabelecimento_id)
    res.json({ message: 'Venda removida' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function vendasPorUF(req, res) {
  try {
    const result = await vendasService.vendasPorUF(req.user.estabelecimento_id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { criarVendaComItens, listarVendas, buscarVendaPorId, cancelarVenda, finalizarVenda, relatorioVendas, relatorioVendasPDF, deletarVenda, vendasPorUF }