const nfSaidaService = require('../services/nfSaidaService')
const PDFDocument = require('pdfkit')

async function gerarNfSaida(req, res) {
  try {
    const { venda_id } = req.body
    const estabelecimento_id = req.user.estabelecimento_id
    if (!venda_id) return res.status(400).json({ error: 'venda_id obrigatório' })
    const result = await nfSaidaService.gerarNfSaida(venda_id, estabelecimento_id)
    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function listarNfSaida(req, res) {
  try {
    const result = await nfSaidaService.listarNfSaida(req.user.estabelecimento_id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function buscarNfSaida(req, res) {
  try {
    const result = await nfSaidaService.buscarNfSaida(Number(req.params.id), req.user.estabelecimento_id)
    res.json(result)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

async function gerarPDF(req, res) {
  try {
    const nf = await nfSaidaService.buscarNfSaida(Number(req.params.id), req.user.estabelecimento_id)

    const doc = new PDFDocument({ margin: 50 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=NF_${nf.numero_nf}.pdf`)
    doc.pipe(res)

    // ===== CABEÇALHO =====
    doc.fontSize(20).font('Helvetica-Bold').text('NOTA FISCAL DE SAÍDA', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(12).font('Helvetica').text(`Número: ${nf.numero_nf}`, { align: 'center' })
    doc.text(`Data de Emissão: ${new Date(nf.data_emissao).toLocaleDateString('pt-BR')}`, { align: 'center' })
    doc.moveDown()

    // ===== LINHA SEPARADORA =====
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown()

    // ===== DADOS DO CLIENTE =====
    doc.fontSize(13).font('Helvetica-Bold').text('DADOS DO CLIENTE')
    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica')
    doc.text(`Nome: ${nf.nome_cliente || 'Consumidor Final'}`)
    doc.text(`Venda: ${nf.codigo_venda || '-'}`)
    doc.moveDown()

    // ===== LINHA SEPARADORA =====
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown()

    // ===== ITENS =====
    doc.fontSize(13).font('Helvetica-Bold').text('ITENS DA NOTA')
    doc.moveDown(0.5)

    // Cabeçalho da tabela
    doc.fontSize(10).font('Helvetica-Bold')
    doc.text('Produto', 50, doc.y, { width: 220, continued: true })
    doc.text('Qtd.', 270, doc.y, { width: 60, continued: true, align: 'center' })
    doc.text('Vlr. Unit.', 330, doc.y, { width: 90, continued: true, align: 'center' })
    doc.text('Subtotal', 420, doc.y, { width: 100, align: 'right' })
    doc.moveDown(0.3)

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(0.3)

    // Itens
    doc.font('Helvetica').fontSize(10)
    for (const item of nf.itens) {
      const y = doc.y
      doc.text(item.nome_produto, 50, y, { width: 220, continued: true })
      doc.text(String(item.quantidade), 270, y, { width: 60, continued: true, align: 'center' })
      doc.text(formatarReais(item.preco_unitario), 330, y, { width: 90, continued: true, align: 'center' })
      doc.text(formatarReais(item.subtotal), 420, y, { width: 100, align: 'right' })
      doc.moveDown(0.5)
    }

    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown()

    // ===== TOTAIS =====
    doc.fontSize(11).font('Helvetica')
    doc.text(`Subtotal: ${formatarReais(nf.subtotal)}`, { align: 'right' })
    if (nf.desconto > 0) {
      doc.text(`Desconto: - ${formatarReais(nf.desconto)}`, { align: 'right' })
    }
    doc.font('Helvetica-Bold').fontSize(13)
    doc.text(`Total: ${formatarReais(nf.total)}`, { align: 'right' })
    doc.moveDown()

    // ===== FORMA DE PAGAMENTO =====
    const formas = { pix: 'PIX', cartao: 'Cartão', dinheiro: 'Dinheiro' }
    doc.fontSize(11).font('Helvetica')
    doc.text(`Forma de Pagamento: ${formas[nf.forma_pagamento] || nf.forma_pagamento}`, { align: 'right' })

    doc.end()

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

function formatarReais(valor) {
  const numero = parseFloat(valor)
  if (isNaN(numero)) return 'R$ 0,00'
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

module.exports = { gerarNfSaida, listarNfSaida, buscarNfSaida, gerarPDF }