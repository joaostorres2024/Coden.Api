const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

async function login(usuario, senha) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input('usuario', sql.VarChar, usuario)
    .query('SELECT * FROM usuarios WHERE nome = @usuario');

  const user = result.recordset[0];

  if (!user) throw new Error("Usuário não encontrado");

  const senhaValida = await bcrypt.compare(senha, user.senha);
  if (!senhaValida) throw new Error("Senha inválida");

  const token = jwt.sign(
    { id: user.id, nome: user.nome, estabelecimento_id: user.estabelecimento_id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return token;
}

async function createUser({ nome, email, senha, estabelecimento_id }) {
  const senhaHash = await bcrypt.hash(senha, 10);
  const pool = await poolPromise;

  await pool.request()
    .input('nome', sql.VarChar, nome)
    .input('email', sql.VarChar, email)
    .input('senha', sql.VarChar, senhaHash)
    .input('estabelecimento_id', sql.Int, estabelecimento_id)
    .query('INSERT INTO usuarios (nome, email, senha, estabelecimento_id) VALUES (@nome, @email, @senha, @estabelecimento_id)');
}

async function createEstabelecimento({ nome, cnpj, cep }) {
  const pool = await poolPromise;

  await pool.request()
    .input('nome', sql.VarChar, nome)
    .input('cnpj', sql.VarChar, cnpj)
    .input('cep', sql.VarChar, cep)
    .query('INSERT INTO estabelecimentos (nome, cnpj, cep) VALUES (@nome, @cnpj, @cep)');
}

module.exports = { login, createUser, createEstabelecimento };