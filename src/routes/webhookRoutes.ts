import { handleWebhook } from 'bot/webhookHandler';
import express from 'express';

const router = express.Router();

router.post('/:botId', async (req, res) => {
  const { botId } = req.params;
  const update = req.body;

  try {
    await handleWebhook(Number(botId), update);
    res.sendStatus(200);
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error);
    res.status(500).send('Ошибка обработки вебхука');
  }
});

export default router;
