import { Bot } from "@prisma/client";
import botManager from "bot/botManager";
import { ChatMemberStatuses } from "constants/ChatMemberStatuses";
import { prisma } from "database/client";
import { TelegramAPI } from "services/telegramApi";

export class WebhookHandler {
  private bot: Bot;
  private update: any;
  private api: TelegramAPI;

  constructor(bot: Bot, update: any, api: TelegramAPI) {
    this.bot = bot;
    this.update = update;
    this.api = api;
  }

  // Статус участника в чате изменился (left, kicked, etc...)
  async handleChatMember() {
    const userId = this.update.chat_member.from.id;
    const status = this.update.chat_member.new_chat_member.status;

    if (status === ChatMemberStatuses.LEFT) {
      try {
        await this.api.sendMessage(userId, 'Прощательное сообщение.');
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      }
    }
  }

  // Статус бота (текущего) в чате изменился (left, admin, etc...)
  async handleMyChatMember() {
    const { chat, new_chat_member } = this.update.my_chat_member;
    const existingChannel = await prisma.channel.findUnique({
      where: { id: chat.id }
    });
  
    if (new_chat_member.status === ChatMemberStatuses.ADMINISTRATOR) {
      try {
        if (existingChannel) {
          await this.api.leaveChat(chat.id);
          await this.api.sendMessage(this.update.my_chat_member.from.id, `Канал ${chat.title} уже существует и добавлен в другом боте. Я покинул канал автоматически`);
        } else {
          await botManager.addChannel(Number(this.bot.id), chat.id, chat.title);
          await this.api.sendMessage(this.update.my_chat_member.from.id, `Вы добавили меня в канал ${chat.title} в качестве администратора.`);
        }
      } catch (error) {
        console.error("Ошибка при добавлении бота в канал:", error);
      }
    } else if (new_chat_member.status === ChatMemberStatuses.LEFT) {
      try {
        if (!existingChannel) return;
        
        await prisma.channel.delete({
          where: { id: chat.id, botId: this.bot.id }
        });
        await this.api.sendMessage(this.update.my_chat_member.from.id, `Вы удалили меня из канала ${chat.title}.`);
      } catch (error) {
        console.error("Ошибка при удалении бота из канала:", error);
      }
    }
  }

  // Пользователь отправялет запрос на вступление в канал
  async handleChatJoinRequest() {
    const userId = this.update.chat_join_request.from.id;
    const chatId = this.update.chat_join_request.chat.id;
    const greetingsArray = await prisma.greetings.findMany({
      where: {
        botId: this.bot.id
      },
      include: {
        entities: true,
        buttons: true
      }
    });

    if (greetingsArray.length > 0) {
      try {
        const asyncTasks = greetingsArray.map(async greeting => {
          if (greeting.imageUrl) {
            await this.api.sendPhoto(userId, greeting.imageUrl);
          }
          await this.api.sendMessage(userId, greeting.text, {
            entities: greeting.entities,
            reply_markup: {
              inline_keyboard: greeting.buttons.map(button => [{ text: button.text, url: button.url }])
            }
          });
        });

        await Promise.allSettled(asyncTasks);
      } catch (error) {
        console.error('Ошибка при обработке запроса на вступление в канал:', error);
      }
    }

    if (this.bot.isAutoApproveEnabled) {
      try {
        await this.api.approveChatJoinRequest(chatId, userId);
      } catch (error) {
        console.error('Ошибка при автоматическом принятии заявки на вступление в канал:', error);
      }
    }
  }
}