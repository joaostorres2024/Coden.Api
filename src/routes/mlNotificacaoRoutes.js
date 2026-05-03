const router = require('express').Router();

router.post('/notificacoes', async (req, res) => {
  // ML exige 200 imediato
  res.sendStatus(200);

  const notificacao = req.body;
  console.log('Notificação ML recebida:', JSON.stringify(notificacao, null, 2));

  const { topic, resource, user_id } = notificacao;

  try {
    switch (topic) {
      case 'orders_v2':
        console.log(`Novo pedido/atualização: ${resource} | Usuário ML: ${user_id}`);
        // Aqui você pode salvar no banco, disparar eventos, etc
        break;

      case 'items':
        console.log(`Anúncio atualizado: ${resource} | Usuário ML: ${user_id}`);
        break;

      case 'stock_complement':
        console.log(`Estoque atualizado: ${resource} | Usuário ML: ${user_id}`);
        break;

      case 'payments':
        console.log(`Pagamento: ${resource} | Usuário ML: ${user_id}`);
        break;

      case 'shipments':
        console.log(`Envio atualizado: ${resource} | Usuário ML: ${user_id}`);
        break;

      default:
        console.log(`Tópico desconhecido: ${topic}`);
    }
  } catch (err) {
    console.error('Erro ao processar notificação ML:', err.message);
  }
});

module.exports = router;