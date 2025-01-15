import { prisma } from "../database/client";
import { TelegramAPI } from "../services/telegramApi";
import { WebhookHandlers } from "./webhookHandlers";
import { WebhookHandler } from "./webhookHandlers/WebhookHandler";

export async function handleWebhook(botId: number, update: any) {
  const bot = await prisma.bot.findUnique({ where: { id: botId } });
  if (!bot) throw new Error('Бот не найден');

  const api = new TelegramAPI(bot.token);
  const handler = new WebhookHandler(bot, update, api);

  for(const [eventType, handlerFunction] of Object.entries(WebhookHandlers)) {
    if (update[eventType]) {
      await handlerFunction(handler);
      return;
    }
  }
};