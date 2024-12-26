import express from 'express';
import webhookHandler from 'bots/webhookHandler';

const router = express.Router();

router.post('/:botId', async (req, res) => {
  const { botId } = req.params;
  const update = req.body;

  try {
    await webhookHandler.handleWebhook(Number(botId), update);
    res.sendStatus(200);
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
    res.status(500).send('Ошибка обработки вебхука');
  }
});

export default router;
