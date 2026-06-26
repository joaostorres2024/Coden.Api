const axios = require('axios');
const mlConfig = require('../config/mercadoLivre');
const { salvarToken, getToken, deletarToken } = require('../services/mlService');

const jwt = require('jsonwebtoken');

function login(req, res) {
  const state = Buffer.from(JSON.stringify({ userId: req.user.id })).toString('base64');
  const url = `${mlConfig.authUrl}/authorization?response_type=code&client_id=${mlConfig.clientId}&redirect_uri=${mlConfig.redirectUri}&state=${state}`;
  res.json({ url });
}

async function status(req, res) {
  try {
    const token = await getToken(req.user.id);

    if (!token) {
      return res.json({ conectado: false, message: 'Usuário não autenticado no ML' });
    }

    const expirado = new Date() >= new Date(token.expires_at);

    res.json({
      conectado: true,
      ml_user_id: token.user_id,
      expira_em: token.expires_at,
      status: expirado ? 'expirado (será renovado na próxima chamada)' : 'válido',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function callback(req, res) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send('Code não informado');
    }

    const { userId } = JSON.parse(
      Buffer.from(state, 'base64').toString()
    );

    const { data } = await axios.post(`${mlConfig.baseUrl}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: mlConfig.clientId,
      client_secret: mlConfig.clientSecret,
      code,
      redirect_uri: mlConfig.redirectUri,
    });

    await salvarToken({ ...data, user_id: userId });

    res.send(`
      <html>
        <body>
          <script>
            window.opener.location.reload();
            window.close();
          </script>
          <p>Conta conectada, fechando...</p>
        </body>
      </html>
    `);

  } catch (err) {
    console.error('Erro no callback ML:', err.response?.data || err.message);

    res.send(`
      <html>
        <body>
          <script>
            alert('Erro ao conectar Mercado Livre');
            window.close();
          </script>
        </body>
      </html>
    `);
  }
}
``

async function desconectar(req, res) {
  try {
    await deletarToken(req.user.id)
    res.json({ message: 'Desconectado com sucesso' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { login, callback, status, desconectar };