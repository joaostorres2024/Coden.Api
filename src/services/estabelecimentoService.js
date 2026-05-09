const { request, sql } = require('../config/db')

async function listarEstabelecimentos({ nome, cnpj, cep }) {
  const req = await request()

  let where = 'WHERE 1=1'

  if (nome) {
    req.input('nome', sql.VarChar, `%${nome}%`)
    where += ' AND nome LIKE @nome'
  }
  if (cnpj) {
    req.input('cnpj', sql.VarChar, `%${cnpj}%`)
    where += ' AND cnpj LIKE @cnpj'
  }
  if (cep) {
    req.input('cep', sql.VarChar, `%${cep}%`)
    where += ' AND cep LIKE @cep'
  }

  const result = await req.query(`SELECT * FROM estabelecimentos ${where} ORDER BY nome`)
  return result.recordset
}

async function buscarEstabelecimento(estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('id', sql.Int, estabelecimento_id)
    .query('SELECT * FROM estabelecimentos WHERE id = @id')

  if (!result.recordset[0]) throw new Error('Estabelecimento não encontrado')
  return result.recordset[0]
}

async function atualizarEstabelecimento(estabelecimento_id, data) {
  const {
    nome, nome_fantasia, cnpj, inscricao_estadual, inscricao_municipal,
    regime_tributario, cep, endereco, numero, complemento, bairro,
    cidade, uf, telefone, email, site, responsavel, cargo
  } = data

  const req = await request()
  await req
    .input('id', sql.Int, estabelecimento_id)
    .input('nome', sql.VarChar, nome)
    .input('nome_fantasia', sql.VarChar, nome_fantasia)
    .input('cnpj', sql.VarChar, cnpj)
    .input('inscricao_estadual', sql.VarChar, inscricao_estadual)
    .input('inscricao_municipal', sql.VarChar, inscricao_municipal)
    .input('regime_tributario', sql.VarChar, regime_tributario)
    .input('cep', sql.VarChar, cep)
    .input('endereco', sql.VarChar, endereco)
    .input('numero', sql.VarChar, numero)
    .input('complemento', sql.VarChar, complemento)
    .input('bairro', sql.VarChar, bairro)
    .input('cidade', sql.VarChar, cidade)
    .input('uf', sql.VarChar, uf)
    .input('telefone', sql.VarChar, telefone)
    .input('email', sql.VarChar, email)
    .input('site', sql.VarChar, site)
    .input('responsavel', sql.VarChar, responsavel)
    .input('cargo', sql.VarChar, cargo)
    .query(`
      UPDATE estabelecimentos SET
        nome = @nome,
        nome_fantasia = @nome_fantasia,
        cnpj = @cnpj,
        inscricao_estadual = @inscricao_estadual,
        inscricao_municipal = @inscricao_municipal,
        regime_tributario = @regime_tributario,
        cep = @cep,
        endereco = @endereco,
        numero = @numero,
        complemento = @complemento,
        bairro = @bairro,
        cidade = @cidade,
        uf = @uf,
        telefone = @telefone,
        email = @email,
        site = @site,
        responsavel = @responsavel,
        cargo = @cargo
      WHERE id = @id
    `)

  return { message: 'Estabelecimento atualizado com sucesso' }
}

module.exports = { buscarEstabelecimento, atualizarEstabelecimento, listarEstabelecimentos }