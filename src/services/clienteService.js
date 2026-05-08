const { request } = require("../config/db");

async function criarCliente(data) {
    const {
        estabelecimento_id,
        tipo_pessoa,
        nome_cliente,
        cpf,
        cnpj,
        codigo_cliente,
        status,
        data_nascimento,
        nome_social,
        razao_social,
        nome_responsavel,
        telefone_1,
        telefone_2,
        telefone_fixo,
        email,
        cep,
        endereco,
        numero,
        bairro,
        cidade,
        uf,
        observacoes
    } = data;

    const req = await request()
    const result = await req
        .input("estabelecimento_id", estabelecimento_id)
        .input("tipo_pessoa", tipo_pessoa)
        .input("nome_cliente", nome_cliente)
        .input("cpf", cpf)
        .input("cnpj", cnpj)
        .input("codigo_cliente", codigo_cliente)
        .input("status", status)
        .input("data_nascimento", data_nascimento)
        .input("nome_social", nome_social)
        .input("razao_social", razao_social)
        .input("nome_responsavel", nome_responsavel)
        .input("telefone_1", telefone_1)
        .input("telefone_2", telefone_2)
        .input("telefone_fixo", telefone_fixo)
        .input("email", email)
        .input("cep", cep)
        .input("endereco", endereco)
        .input("numero", numero)
        .input("bairro", bairro)
        .input("cidade", cidade)
        .input("uf", uf)
        .input("observacoes", observacoes)
        .query(`
            INSERT INTO clientes (
                estabelecimento_id, tipo_pessoa, nome_cliente, cpf, cnpj,
                codigo_cliente, status, data_nascimento, nome_social,
                razao_social, nome_responsavel, telefone_1, telefone_2, telefone_fixo,
                email, cep, endereco, numero, bairro, cidade, uf, observacoes
            )
            OUTPUT INSERTED.id
            VALUES (
                @estabelecimento_id, @tipo_pessoa, @nome_cliente, @cpf, @cnpj,
                @codigo_cliente, @status, @data_nascimento, @nome_social,
                @razao_social, @nome_responsavel, @telefone_1, @telefone_2, @telefone_fixo,
                @email, @cep, @endereco, @numero, @bairro, @cidade, @uf, @observacoes
            )
        `)

    const id = result.recordset[0].id
    return { id, ...data }
}

async function listarClientes({ estabelecimento_id }) {
    const req = await request()
    const result = await req
        .input("estabelecimento_id", estabelecimento_id)
        .query("SELECT * FROM clientes WHERE estabelecimento_id = @estabelecimento_id")

    return result.recordset
}

async function buscarCliente({ id, estabelecimento_id }) {
    const req = await request()
    const result = await req
        .input("id", id)
        .input("estabelecimento_id", estabelecimento_id)
        .query("SELECT * FROM clientes WHERE id = @id AND estabelecimento_id = @estabelecimento_id")

    if (result.recordset.length === 0) {
        throw new Error("Cliente não encontrado")
    }

    return result.recordset[0]
}

async function atualizarCliente(data) {
    const {
        id,
        estabelecimento_id,
        tipo_pessoa,
        nome_cliente,
        cpf,
        cnpj,
        codigo_cliente,
        status,
        data_nascimento,
        nome_social,
        razao_social,
        nome_responsavel,
        telefone_1,
        telefone_2,
        telefone_fixo,
        email,
        cep,
        endereco,
        numero,
        bairro,
        cidade,
        uf,
        observacoes
    } = data;

    const req = await request()
    const result = await req
        .input("id", id)
        .input("estabelecimento_id", estabelecimento_id)
        .input("tipo_pessoa", tipo_pessoa)
        .input("nome_cliente", nome_cliente)
        .input("cpf", cpf)
        .input("cnpj", cnpj)
        .input("codigo_cliente", codigo_cliente)
        .input("status", status)
        .input("data_nascimento", data_nascimento)
        .input("nome_social", nome_social)
        .input("razao_social", razao_social)
        .input("nome_responsavel", nome_responsavel)
        .input("telefone_1", telefone_1)
        .input("telefone_2", telefone_2)
        .input("telefone_fixo", telefone_fixo)
        .input("email", email)
        .input("cep", cep)
        .input("endereco", endereco)
        .input("numero", numero)
        .input("bairro", bairro)
        .input("cidade", cidade)
        .input("uf", uf)
        .input("observacoes", observacoes)
        .query(`
            UPDATE clientes SET
                tipo_pessoa = @tipo_pessoa,
                nome_cliente = @nome_cliente,
                cpf = @cpf,
                cnpj = @cnpj,
                codigo_cliente = @codigo_cliente,
                status = @status,
                data_nascimento = @data_nascimento,
                nome_social = @nome_social,
                razao_social = @razao_social,
                nome_responsavel = @nome_responsavel,
                telefone_1 = @telefone_1,
                telefone_2 = @telefone_2,
                telefone_fixo = @telefone_fixo,
                email = @email,
                cep = @cep,
                endereco = @endereco,
                numero = @numero,
                bairro = @bairro,
                cidade = @cidade,
                uf = @uf,
                observacoes = @observacoes
            WHERE id = @id AND estabelecimento_id = @estabelecimento_id
        `)

    if (result.rowsAffected[0] === 0) {
        throw new Error("Cliente não encontrado")
    }

    return { id, ...data }
}

async function deletarCliente({ id, estabelecimento_id }) {
    const req = await request()
    const result = await req
        .input("id", id)
        .input("estabelecimento_id", estabelecimento_id)
        .query("DELETE FROM clientes WHERE id = @id AND estabelecimento_id = @estabelecimento_id")

    if (result.rowsAffected[0] === 0) {
        throw new Error("Cliente não encontrado")
    }
}

async function proximoCodigoCliente({ estabelecimento_id }) {
    const req = await request()
    const result = await req
        .input("estabelecimento_id", estabelecimento_id)
        .query(`
            SELECT ISNULL(MAX(CAST(codigo_cliente AS INT)), 0) + 1 AS proximo_codigo
            FROM clientes
            WHERE estabelecimento_id = @estabelecimento_id
            AND ISNUMERIC(codigo_cliente) = 1
        `)
    return result.recordset[0].proximo_codigo
}

module.exports = {
    criarCliente,
    listarClientes,
    buscarCliente,
    atualizarCliente,
    deletarCliente,
    proximoCodigoCliente 
}