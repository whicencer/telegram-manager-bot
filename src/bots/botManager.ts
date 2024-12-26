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
        username: botInfo.username,
        settings: {
          create: {
            welcomeMessageSettings: {
              create: {
                welcomeMessageText: 'Добро пожаловать в наш канал!',
                welcomeMessageAutoDelete: 5,
                welcomeMessageAutoDeleteEnabled: false,
                welcomeMessageDelay: 0
              }
            }
          }
        }
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

  async updateWelcomeMessageText(botId: number, message: string) {
    const settings = await prisma.botSettings.findUnique({
      where: { botId },
      include: { welcomeMessageSettings: true },
    });

    if (!settings) {
      throw new Error('Настройки бота не найдены.');
    }

    const updatedWelcomeMessageSettings = await prisma.welcomeMessageSettings.update({
      where: { settingsId: settings.id },
      data: { welcomeMessageText: message },
    });

    return updatedWelcomeMessageSettings.welcomeMessageText;
  }
}

export default new BotManager();
