const productService = require("../services/productService");

async function registerProduct(req, res) {
    try {
        const { estabelecimento_id } = req.user;
        const {
            nome_produto,
            preco,
            grupo_id,
            codigo_produto,
            codigo_barras,
            preco_custo,
            margem_percentual,
            estoque_atual,
            estoque_minimo,
            estoque_maximo,
            fornecedor,
            status,
            observacoes
        } = req.body;

        if (!nome_produto || preco == null) {
            return res.status(400).json({ erro: "nome_produto e preco são obrigatórios" });
        }

        const product = await productService.createProduct({
            nome_produto,
            preco,
            grupo_id, // ← trocado
            estabelecimento_id,
            codigo_produto,
            codigo_barras,
            preco_custo,
            margem_percentual,
            estoque_atual,
            estoque_minimo,
            estoque_maximo,
            fornecedor,
            status,
            observacoes
        });

        return res.status(201).json({ message: "Produto cadastrado com sucesso", product });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: err.message });
    }
}

async function getAllProducts(req, res) {
    try {
        const { estabelecimento_id } = req.user;

        const products = await productService.getAllProducts({ estabelecimento_id });

        return res.json(products);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: err.message });
    }
}

async function getProduct(req, res) {
    try {
        const { id } = req.params;
        const { estabelecimento_id } = req.user;

        const product = await productService.getProduct({ id, estabelecimento_id });

        return res.json(product);

    } catch (err) {
        console.error(err);
        return res.status(404).json({ erro: err.message });
    }
}

async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const { estabelecimento_id } = req.user;
        const {
            nome_produto,
            preco,
            grupo_id, // ← trocado
            codigo_produto,
            codigo_barras,
            preco_custo,
            margem_percentual,
            estoque_atual,
            estoque_minimo,
            estoque_maximo,
            fornecedor,
            status,
            observacoes
        } = req.body;

        const product = await productService.updateProduct({
            id,
            nome_produto,
            preco,
            grupo_id,
            estabelecimento_id,
            codigo_produto,
            codigo_barras,
            preco_custo,
            margem_percentual,
            estoque_atual,
            estoque_minimo,
            estoque_maximo,
            fornecedor,
            status,
            observacoes
        });

        return res.json({ message: "Produto atualizado com sucesso", product });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ erro: err.message });
    }
}
async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        const { estabelecimento_id } = req.user;

        await productService.deleteProduct({ id, estabelecimento_id });

        return res.json({ message: "Produto deletado com sucesso" });

    } catch (err) {
        console.error(err);
        return res.status(400).json({ erro: err.message });
    }
}

async function relatorioEstoque(req, res) {
  try {
    const { estabelecimento_id } = req.user
    const { codigo, nome_produto, grupo_id, status, fornecedor } = req.query

    const resultado = await productService.relatorioEstoque({
      estabelecimento_id,
      codigo,
      nome_produto,
      grupo_id: grupo_id ? Number(grupo_id) : null,
      status,
      fornecedor
    })

    res.json(resultado)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function relatorioEstoquePDF(req, res) {
  try {
    const PDFDocument = require('pdfkit')
    const { codigo, nome_produto, grupo_id, status, fornecedor } = req.query
    const estabelecimento_id = req.user.estabelecimento_id

    const produtos = await productService.relatorioEstoque({
      estabelecimento_id,
      codigo,
      nome_produto,
      grupo_id: grupo_id ? Number(grupo_id) : null,
      status,
      fornecedor
    })

    const estabelecimento = await require('../services/estabelecimentoService').buscarEstabelecimento(estabelecimento_id)

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_estoque.pdf')
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

    // ═══════════════════════════════════════
    // CABEÇALHO
    // ═══════════════════════════════════════
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000')
      .text('Relatório de Estoque', L, 30, { width: W, align: 'right' })

    doc.fontSize(11).font('Helvetica').fillColor('#333')
      .text(now.toLocaleDateString('pt-BR'), L, 50, { width: W, align: 'right' })

    let y = 75

    // Filtros aplicados
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a56a0').text('Empresa(s):', L, y)
    doc.fontSize(8).font('Helvetica').fillColor('#000').text(estabelecimento.nome || '-', L + 80, y)
    y += 14

    if (status) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a56a0').text('Status:', L, y)
      doc.fontSize(8).font('Helvetica').fillColor('#000').text(status, L + 80, y)
      y += 14
    }
    if (fornecedor) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a56a0').text('Fornecedor:', L, y)
      doc.fontSize(8).font('Helvetica').fillColor('#000').text(fornecedor, L + 80, y)
      y += 14
    }
    if (nome_produto) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#1a56a0').text('Produto:', L, y)
      doc.fontSize(8).font('Helvetica').fillColor('#000').text(nome_produto, L + 80, y)
      y += 14
    }

    y += 10
    doc.moveTo(L, y).lineTo(L + W, y).lineWidth(2).stroke('#1a56a0')
    y += 8

    // ═══════════════════════════════════════
    // TABELA — CABEÇALHO
    // ═══════════════════════════════════════
const cols = [
  { label: 'Código', x: L, w: 60, align: 'left' },
  { label: 'Produto', x: L + 60, w: 170, align: 'left' },
  { label: 'Grupo', x: L + 230, w: 90, align: 'left' },
  { label: 'Fornecedor', x: L + 320, w: 110, align: 'left' },
  { label: 'Est. Atual', x: L + 430, w: 55, align: 'center' },
  { label: 'Est. Mín.', x: L + 485, w: 55, align: 'center' },
  { label: 'Situação', x: L + 540, w: 60, align: 'center' },
  { label: 'Vlr. Custo', x: L + 600, w: 80, align: 'right' },
  { label: 'Vlr. Venda', x: L + 680, w: 80, align: 'right' },
]

    // Header da tabela
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#1a56a0')
    cols.forEach(col => {
      doc.text(col.label, col.x, y, { width: col.w, align: col.align })
    })
    y += 12

    doc.moveTo(L, y).lineTo(L + W, y).lineWidth(0.5).stroke('#1a56a0')
    y += 4

    // ═══════════════════════════════════════
    // LINHAS DA TABELA
    // ═══════════════════════════════════════
    let totalEstoqueAtual = 0
    let totalValorCusto = 0
    let totalValorVenda = 0
    let isAlternate = false

    produtos.forEach((p) => {
      if (y > 530) {
        doc.addPage({ layout: 'landscape' })
        y = 30
      }

      if (isAlternate) {
        doc.rect(L, y - 2, W, 14).fillColor('#f5f5f5').fill()
      }
      isAlternate = !isAlternate

      const situacao = p.situacao_estoque || '-'
      const corSituacao = situacao === 'Normal' ? '#2e7d32' : situacao === 'Baixo' ? '#e65100' : '#c62828'

      doc.fontSize(7).font('Helvetica').fillColor('#000')
      doc.text(p.codigo_produto || '-', cols[0].x, y, { width: cols[0].w, align: cols[0].align })
      doc.text(p.nome_produto || '-', cols[1].x, y, { width: cols[1].w, align: cols[1].align })
      doc.text(p.grupo || '-', cols[2].x, y, { width: cols[2].w, align: cols[2].align })
      doc.text(p.fornecedor || '-', cols[3].x, y, { width: cols[3].w, align: cols[3].align })
      doc.text(String(p.estoque_atual ?? '-'), cols[4].x, y, { width: cols[4].w, align: cols[4].align })
      doc.text(String(p.estoque_minimo ?? '-'), cols[5].x, y, { width: cols[5].w, align: cols[5].align })
      doc.fillColor(corSituacao).text(situacao, cols[6].x, y, { width: cols[6].w, align: cols[6].align })
      doc.fillColor('#000')
        .text(formatarReais(p.preco_custo), cols[7].x, y, { width: cols[7].w, align: cols[7].align })
        .text(formatarReais(p.preco), cols[8].x, y, { width: cols[8].w, align: cols[8].align })

      totalEstoqueAtual += Number(p.estoque_atual) || 0
      totalValorCusto += parseFloat(p.preco_custo) || 0
      totalValorVenda += parseFloat(p.preco) || 0

      y += 14

      doc.moveTo(L, y - 2).lineTo(L + W, y - 2).lineWidth(0.2).strokeColor('#ddd').stroke()
    })

    // ═══════════════════════════════════════
    // TOTAIS
    // ═══════════════════════════════════════
    y += 4
    doc.moveTo(L, y).lineTo(L + W, y).lineWidth(1.5).stroke('#1a56a0')
    y += 6

    doc.fontSize(8).font('Helvetica-Bold').fillColor('#000')
      .text(`Total de Produtos: ${produtos.length}`, L, y)
      .text(`Total Estoque: ${totalEstoqueAtual}`, L + 200, y)
      .text(`Valor Total Custo: ${formatarReais(totalValorCusto)}`, L + 370, y)
      .text(`Valor Total Venda: ${formatarReais(totalValorVenda)}`, L + 560, y)

    y += 20

    // ═══════════════════════════════════════
    // RODAPÉ
    // ═══════════════════════════════════════
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

async function deletarProduto(req, res) {
  try {
    const { id } = req.params
    const { estabelecimento_id } = req.user
    await productService.deletarProduto({ id: Number(id), estabelecimento_id })
    res.json({ message: 'Produto excluído com sucesso' })
  } catch (err) {
    res.status(400).json({ erro: err.message })
  }
}

module.exports = {
  registerProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  relatorioEstoque,
  relatorioEstoquePDF,
  deletarProduto
}