import { prisma } from "../database/client";
import { TelegramAPI } from "../services/telegramApi";
import botManager from "./botManager";

class WebhookHandler {
  async handleWebhook(botId: number, update: any) {
    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) throw new Error('Бот не найден');

    const api = new TelegramAPI(bot.token);

    // Обработка события, когда бот добавляется в канал
    if (update.my_chat_member) {
      const { chat, new_chat_member } = update.my_chat_member;
      
      const existingChannel = await prisma.channel.findUnique({
        where: { id: chat.id }
      });

      if (new_chat_member.status === 'administrator') {
        try {
          if (existingChannel) {
            await api.leaveChat(chat.id);
            await api.sendMessage(update.my_chat_member.from.id, `Канал ${chat.title} уже существует и добавлен в другом боте. Я покинул канал автоматически`);
          } else {
            await botManager.addChannel(Number(bot.id), chat.id, chat.title);
            await api.sendMessage(update.my_chat_member.from.id, `Вы добавили меня в канал ${chat.title} в качестве администратора.`);
          }
        } catch (error) {
          console.error("Ошибка при добавлении бота в канал:", error);
        }
      } else if (new_chat_member.status === 'left') {
        try {
          if (!existingChannel) return;
          
          await prisma.channel.delete({
            where: { id: chat.id, botId: bot.id }
          });
          await api.sendMessage(update.my_chat_member.from.id, `Вы удалили меня из канала ${chat.title}.`);
        } catch (error) {
          console.error("Ошибка при удалении бота из канала:", error);
        }
      }
    }

    if (update.chat_join_request) {
      const userId = update.chat_join_request.from.id;
      const greetingsArray = await prisma.greetings.findMany({
        where: {
          botId: bot.id
        },
        include: {
          entities: true
        }
      });

      if (greetingsArray.length > 0) {
        try {
          const asyncTasks = greetingsArray.map(async greeting => {
            if (greeting.imageUrl) {
              await api.sendPhoto(userId, greeting.imageUrl);
            }
            await api.sendMessage(userId, greeting.text, greeting.entities);
          });

          await Promise.allSettled(asyncTasks);
        } catch (error) {
          console.error('Ошибка при обработке запроса на вступление в канал:', error);
        }
      }
    }

    if (update.chat_member) {
      const userId = update.chat_member.from.id;
      const status = update.chat_member.new_chat_member.status;

      if (status === 'left') {
        try {
          await api.sendMessage(userId, 'Прощательное сообщение.');
        } catch (error) {
          console.error('Ошибка при отправке сообщения:', error);
        }
      }
    }
  }
}

export default new WebhookHandler();
