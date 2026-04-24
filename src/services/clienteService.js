const db = require("../config/db");

async function criarCliente(nome, cpf, cnpj, cep) {

    const [result] = await db.query(
        `INSERT INTO clientes (nome, cpf, cnpj, cep)
         VALUES (?, ?, ?, ?)`,
        [nome, cpf, cnpj, cep]
    );

    return {
        id: result.insertId,
        message: "Cliente criado com sucesso"
    };
}

async function listarClientes() {
    const [rows] = await db.query("SELECT * FROM clientes");
    return rows;
}

module.exports = {
    criarCliente,
    listarClientes
};