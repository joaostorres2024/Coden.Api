const axios = require('axios');
const { request, sql } = require('../config/db');
const mlConfig = require('../config/mercadolivre');

async function getToken(userId) {
  const req = await request();
  const result = await req
    .input('user_id', sql.VarChar, String(userId))
    .query(`SELECT * FROM ml_tokens WHERE user_id = @user_id`);
  return result.recordset[0] || null;
}

async function salvarToken(data) {
  const req = await request();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);
  const mlUserId = data.ml_user_id ? String(data.ml_user_id) : null;

  if (data.refresh_token) {
    await req
      .input('user_id', sql.VarChar, String(data.user_id))
      .input('ml_user_id', sql.VarChar, mlUserId)
      .input('access_token', sql.Text, data.access_token)
      .input('refresh_token', sql.Text, data.refresh_token)
      .input('expires_at', sql.DateTime, expiresAt)
      .query(`
        MERGE ml_tokens AS target
        USING (SELECT @user_id AS user_id) AS source ON target.user_id = source.user_id
        WHEN MATCHED THEN
          UPDATE SET ml_user_id = @ml_user_id,
                     access_token = @access_token,
                     refresh_token = @refresh_token,
                     expires_at = @expires_at,
                     updated_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (user_id, ml_user_id, access_token, refresh_token, expires_at)
          VALUES (@user_id, @ml_user_id, @access_token, @refresh_token, @expires_at);
      `);
  } else {
    await req
      .input('user_id', sql.VarChar, String(data.user_id))
      .input('access_token', sql.Text, data.access_token)
      .input('expires_at', sql.DateTime, expiresAt)
      .query(`
        MERGE ml_tokens AS target
        USING (SELECT @user_id AS user_id) AS source ON target.user_id = source.user_id
        WHEN MATCHED THEN
          UPDATE SET access_token = @access_token,
                     expires_at = @expires_at,
                     updated_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (user_id, access_token, refresh_token, expires_at)
          VALUES (@user_id, @access_token, 'sem_refresh', @expires_at);
      `);
  }
}

async function getAccessToken(userId) {
  const token = await getToken(userId);

  if (!token) throw new Error('Token ML não encontrado para este usuário');

  const expirado = new Date() >= new Date(token.expires_at);

  if (!expirado) return token.access_token;

  const { data } = await axios.post(`${mlConfig.baseUrl}/oauth/token`, {
    grant_type: 'refresh_token',
    client_id: mlConfig.clientId,
    client_secret: mlConfig.clientSecret,
    refresh_token: token.refresh_token,
  });

  await salvarToken({ ...data, user_id: userId });
  return data.access_token;
}

async function mlGet(userId, endpoint) {
  const accessToken = await getAccessToken(userId);
  const { data } = await axios.get(`${mlConfig.baseUrl}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

async function mlPost(userId, endpoint, body) {
  const accessToken = await getAccessToken(userId);
  const { data } = await axios.post(`${mlConfig.baseUrl}${endpoint}`, body, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

async function deletarToken(userId) {
  const req = await request()
  await req
    .input('user_id', sql.VarChar, String(userId))
    .query(`DELETE FROM ml_tokens WHERE user_id = @user_id`)
}

module.exports = { salvarToken, getAccessToken, mlGet, mlPost, getToken, deletarToken };