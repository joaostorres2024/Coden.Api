require('dotenv').config();

module.exports = {
  clientId: process.env.ML_CLIENT_ID,
  clientSecret: process.env.ML_CLIENT_SECRET,
  redirectUri: process.env.ML_REDIRECT_URI,
  baseUrl: 'https://api.mercadolibre.com',
  authUrl: 'https://auth.mercadolivre.com.br',
};