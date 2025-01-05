import { prisma } from "database/client";
import { TelegramAPI } from "services/telegramApi";


class BotManager {
  async createBot(token: string, userId: string) {
    const api = new TelegramAPI(token);
    const botInfo = await api.getMe();

    const existingBot = await prisma.bot.findUnique({
      where: { token },
    });

    if (existingBot) {
      throw new Error('Такой бот уже существует.');
    }

    const newBot = await prisma.bot.create({
      data: {
        id: botInfo.id,
        token,
        userId,
        username: botInfo.username
      },
    });

    const webhookUrl = `${process.env.BASE_URL}/webhook/${newBot.id}`;
    await api.deleteWebhook();
    await api.setWebhook(webhookUrl);

    return newBot;
  }

  async addChannel(botId: number, channelId: number, title: string) {
  const channel = await prisma.channel.create({
      data: {
        id: channelId,
        botId,
        title
      }
    });
    return channel;
  }
}

export default new BotManager();
