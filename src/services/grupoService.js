const { request, sql } = require('../config/db')

async function listarGrupos(estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('SELECT * FROM grupos_produto WHERE estabelecimento_id = @estabelecimento_id ORDER BY nome')
  return result.recordset
}

async function criarGrupo(nome, estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('nome', sql.VarChar, nome)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query(`
      INSERT INTO grupos_produto (nome, estabelecimento_id)
      OUTPUT INSERTED.*
      VALUES (@nome, @estabelecimento_id)
    `)
  return result.recordset[0]
}

async function atualizarGrupo(id, nome, estabelecimento_id) {
  const req = await request()
  const result = await req
    .input('id', sql.Int, id)
    .input('nome', sql.VarChar, nome)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('UPDATE grupos_produto SET nome = @nome WHERE id = @id AND estabelecimento_id = @estabelecimento_id')
  if (result.rowsAffected[0] === 0) throw new Error('Grupo não encontrado')
  return { message: 'Grupo atualizado com sucesso' }
}

async function deletarGrupo(id, estabelecimento_id) {
  const checkReq = await request()
  const check = await checkReq
    .input('grupo_id', sql.Int, id)
    .query('SELECT COUNT(*) AS total FROM produtos WHERE grupo_id = @grupo_id')
  if (check.recordset[0].total > 0) throw new Error('Não é possível excluir um grupo com produtos vinculados.')

  const req = await request()
  await req
    .input('id', sql.Int, id)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('DELETE FROM grupos_produto WHERE id = @id AND estabelecimento_id = @estabelecimento_id')
  return { message: 'Grupo excluído com sucesso' }
}

module.exports = { listarGrupos, criarGrupo, atualizarGrupo, deletarGrupo }