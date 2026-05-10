const nfSaidaService = require('../services/nfSaidaService')
const estabelecimentoService = require('../services/estabelecimentoService')
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
    const estabelecimento = await estabelecimentoService.buscarEstabelecimento(req.user.estabelecimento_id)

    const doc = new PDFDocument({ margin: 30, size: 'A4' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=NF_${nf.numero_nf}.pdf`)
    doc.pipe(res)

    const L = 30
    const W = 535

    function box(x, y, w, h) {
      doc.rect(x, y, w, h).stroke()
      return y
    }

    function label(x, y, text) {
      doc.fontSize(6).font('Helvetica').fillColor('#555').text(text, x + 2, y + 2)
    }

    function value(x, y, text, opts = {}) {
      doc.fontSize(8).font('Helvetica').fillColor('#000').text(text || '-', x + 2, y + 10, opts)
    }

    function valueBold(x, y, text, opts = {}) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#000').text(text || '-', x + 2, y + 10, opts)
    }

    function line(y) {
      doc.moveTo(L, y).lineTo(L + W, y).stroke()
    }

    // ═══════════════════════════════════════
    // CABEÇALHO SUPERIOR — CANHOTO
    // ═══════════════════════════════════════
    let y = 30

    box(L, y, W - 100, 14)
    doc.fontSize(6).font('Helvetica').fillColor('#000')
      .text(`RECEBEMOS DE ${(estabelecimento.nome || '').toUpperCase()} OS PRODUTOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO`, L + 2, y + 4, { width: W - 104 })

    box(L + W - 100, y, 100, 14)
    doc.fontSize(6).font('Helvetica-Bold').fillColor('#000')
      .text('NF-e', L + W - 98, y + 2)
    doc.fontSize(8).font('Helvetica-Bold')
      .text(`Nº ${nf.numero_nf}`, L + W - 98, y + 6)

    y += 14
    box(L, y, W - 100, 20)
    label(L, y, 'Data de recebimento')
    box(L + 200, y, W - 300, 20)
    label(L + 200, y, 'Identificação e assinatura do recebedor')

    y += 20

    // Linha pontilhada separadora
    doc.dash(3, { space: 3 })
    doc.moveTo(L, y + 5).lineTo(L + W, y + 5).stroke()
    doc.undash()
    y += 15

    // ═══════════════════════════════════════
    // BLOCO DANFE + EMITENTE
    // ═══════════════════════════════════════

    // Emitente (esquerda)
    box(L, y, 320, 90)
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000')
      .text(estabelecimento.nome || 'EMITENTE', L + 4, y + 4, { width: 314 })
    doc.fontSize(7).font('Helvetica').fillColor('#333')
    doc.text(`CNPJ: ${estabelecimento.cnpj || '-'}`, L + 4, y + 18)
    doc.text(`IE: ${estabelecimento.inscricao_estadual || '-'}  IM: ${estabelecimento.inscricao_municipal || '-'}`, L + 4, y + 28)
    doc.text(`${estabelecimento.endereco || ''}, ${estabelecimento.numero || ''} - ${estabelecimento.bairro || ''}`, L + 4, y + 38)
    doc.text(`${estabelecimento.cidade || ''} - ${estabelecimento.uf || ''}  CEP: ${estabelecimento.cep || ''}`, L + 4, y + 48)
    doc.text(`Tel: ${estabelecimento.telefone || '-'}`, L + 4, y + 58)
    doc.text(`E-mail: ${estabelecimento.email || '-'}`, L + 4, y + 68)

    // DANFE (centro)
    box(L + 320, y, 120, 90)
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000')
      .text('DANFE', L + 322, y + 6, { width: 116, align: 'center' })
    doc.fontSize(6).font('Helvetica')
      .text('Documento Auxiliar da', L + 322, y + 22, { width: 116, align: 'center' })
      .text('Nota Fiscal Eletrônica', L + 322, y + 30, { width: 116, align: 'center' })
    doc.fontSize(7)
      .text('2 - Saída', L + 322, y + 44, { width: 116, align: 'center' })
    doc.fontSize(9).font('Helvetica-Bold')
      .text(`Nº ${nf.numero_nf}`, L + 322, y + 56, { width: 116, align: 'center' })
    doc.fontSize(7).font('Helvetica')
      .text('SÉRIE: 1', L + 322, y + 68, { width: 116, align: 'center' })
      .text('Página: 1 de 1', L + 322, y + 76, { width: 116, align: 'center' })

    // NF-e info (direita)
    box(L + 440, y, 125, 90)
    label(L + 440, y, 'Chave de Acesso NF-e')
    doc.fontSize(6).font('Helvetica').fillColor('#333')
      .text('DOCUMENTO SEM VALOR FISCAL', L + 442, y + 12, { width: 121, align: 'center' })
    label(L + 440, y + 30, 'Data de Emissão')
    value(L + 440, y + 30, new Date(nf.data_emissao).toLocaleDateString('pt-BR'))
    label(L + 440, y + 50, 'Data de Saída')
    value(L + 440, y + 50, new Date(nf.data_emissao).toLocaleDateString('pt-BR'))
    label(L + 440, y + 70, 'Hora de Saída')
    value(L + 440, y + 70, new Date(nf.data_emissao).toLocaleTimeString('pt-BR'))

    y += 90

    // ═══════════════════════════════════════
    // NATUREZA DA OPERAÇÃO
    // ═══════════════════════════════════════
    box(L, y, W, 20)
    label(L, y, 'Natureza da Operação')
    value(L, y, 'Venda de Mercadorias')
    y += 20

    // ═══════════════════════════════════════
    // DESTINATÁRIO
    // ═══════════════════════════════════════
    box(L, y, W, 14)
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#000')
      .text('DESTINATÁRIO / REMETENTE', L + 4, y + 4)
    y += 14

    box(L, y, W * 0.6, 20)
    label(L, y, 'Nome / Razão Social')
    valueBold(L, y, nf.nome_cliente || 'Consumidor Final')

    box(L + W * 0.6, y, W * 0.4, 20)
    label(L + W * 0.6, y, 'Venda Vinculada')
    value(L + W * 0.6, y, nf.codigo_venda || '-')
    y += 20

    // ═══════════════════════════════════════
    // FATURAS
    // ═══════════════════════════════════════
    box(L, y, W, 14)
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#000')
      .text('FATURAS', L + 4, y + 4)
    y += 14

    const formas = { pix: 'PIX', cartao: 'Cartão', dinheiro: 'Dinheiro' }

    box(L, y, W / 3, 20)
    label(L, y, 'Número')
    value(L, y, nf.numero_nf)

    box(L + W / 3, y, W / 3, 20)
    label(L + W / 3, y, 'Forma de Pagamento')
    value(L + W / 3, y, formas[nf.forma_pagamento] || nf.forma_pagamento)

    box(L + (W / 3) * 2, y, W / 3, 20)
    label(L + (W / 3) * 2, y, 'Valor')
    valueBold(L + (W / 3) * 2, y, formatarReais(nf.total))
    y += 20

    // ═══════════════════════════════════════
    // ITENS DA NOTA
    // ═══════════════════════════════════════
    box(L, y, W, 14)
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#000')
      .text('ITENS DA NOTA FISCAL', L + 4, y + 4)
    y += 14

    // Cabeçalho colunas
    const cols = [
      { label: 'Código', x: L, w: 55 },
      { label: 'Descrição', x: L + 55, w: 200 },
      { label: 'Qtd.', x: L + 255, w: 45 },
      { label: 'Un.', x: L + 300, w: 35 },
      { label: 'Vlr. Unit.', x: L + 335, w: 80 },
      { label: 'Desconto', x: L + 415, w: 65 },
      { label: 'Vlr. Total', x: L + 480, w: 85 }
    ]

    box(L, y, W, 16)
    doc.fontSize(6).font('Helvetica-Bold').fillColor('#000')
    cols.forEach(col => {
      doc.text(col.label, col.x + 2, y + 5, { width: col.w - 4, align: 'center' })
    })
    y += 16

    const itens = nf.itens || []
    itens.forEach((item) => {
      box(L, y, W, 16)
      doc.fontSize(7).font('Helvetica').fillColor('#000')
      doc.text(String(item.produto_id || '-'), cols[0].x + 2, y + 5, { width: cols[0].w - 4, align: 'center' })
      doc.text(item.nome_produto || '-', cols[1].x + 2, y + 5, { width: cols[1].w - 4 })
      doc.text(String(item.quantidade), cols[2].x + 2, y + 5, { width: cols[2].w - 4, align: 'center' })
      doc.text('UN', cols[3].x + 2, y + 5, { width: cols[3].w - 4, align: 'center' })
      doc.text(formatarReais(item.preco_unitario), cols[4].x + 2, y + 5, { width: cols[4].w - 4, align: 'right' })
      doc.text(item.desconto > 0 ? formatarReais(item.desconto) : '-', cols[5].x + 2, y + 5, { width: cols[5].w - 4, align: 'right' })
      doc.text(formatarReais(item.subtotal), cols[6].x + 2, y + 5, { width: cols[6].w - 4, align: 'right' })
      y += 16
    })

    // ═══════════════════════════════════════
    // CÁLCULO DO TOTAL
    // ═══════════════════════════════════════
    y += 4
    box(L, y, W, 14)
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#000')
      .text('CÁLCULO DO TOTAL', L + 4, y + 4)
    y += 14

    const totalCols = [
      { label: 'Valor dos Produtos', val: formatarReais(nf.subtotal), x: L, w: W / 4 },
      { label: 'Desconto', val: nf.desconto > 0 ? formatarReais(nf.desconto) : '0,00', x: L + W / 4, w: W / 4 },
      { label: 'Valor do Frete', val: '-', x: L + (W / 4) * 2, w: W / 4 },
      { label: 'Valor Total da Nota', val: formatarReais(nf.total), x: L + (W / 4) * 3, w: W / 4 }
    ]

    box(L, y, W, 28)
    totalCols.forEach(col => {
      label(col.x, y, col.label)
      doc.fontSize(col.label === 'Valor Total da Nota' ? 9 : 8)
        .font(col.label === 'Valor Total da Nota' ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor('#000')
        .text(col.val, col.x + 2, y + 14, { width: col.w - 4, align: 'right' })
    })
    y += 28

    // ═══════════════════════════════════════
    // DADOS ADICIONAIS
    // ═══════════════════════════════════════
    y += 4
    box(L, y, W, 14)
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#000')
      .text('DADOS ADICIONAIS', L + 4, y + 4)
    y += 14

    box(L, y, W, 40)
    label(L, y, 'Observações')
    doc.fontSize(7).font('Helvetica').fillColor('#333')
      .text(nf.observacoes || '-', L + 2, y + 10, { width: W - 4 })
    y += 40

    // ═══════════════════════════════════════
    // RODAPÉ
    // ═══════════════════════════════════════
    y += 10
    doc.fontSize(6).font('Helvetica').fillColor('#888')
      .text(
        `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} — Coden ERP — Documento sem valor fiscal`,
        L, y, { width: W, align: 'center' }
      )

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