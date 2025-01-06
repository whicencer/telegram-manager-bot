import axios from 'axios';

export class TelegramAPI {
  private apiUrl: string;

  constructor(token: string) {
    this.apiUrl = `https://api.telegram.org/bot${token}`;
  }

  async getMe() {
    try {
      const response = await axios.get(`${this.apiUrl}/getMe`);
      if (response.data.ok) {
        return response.data.result;
      }
      throw new Error('Ошибка получения информации о боте');
    } catch (error) {
      console.error(`Telegram API Error (getMe): ${error}`);
      throw error;
    }
  }

  async setWebhook(webhookUrl: string) {
    try {
      const response = await axios.post(`${this.apiUrl}/setWebhook`, {
        url: webhookUrl,
        allowed_updates: ["message", "channel_post", "callback_query", "chat_member", "chat_join_request", "my_chat_member"]
      });
      console.log("response: ", response.data);
      return response.data.ok;
    } catch (error) {
      console.log("error", error);
      console.error(`Telegram API Error (setWebhook): ${error}`);
      throw error;
    }
  }

  async sendMessage(chatId: string, text: string, options?: any) {
    try {
      await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId,
        text,
        ...options
      });
    } catch (error) {
      console.error(`Telegram API Error (sendMessage): ${error}`);
    }
  }

  async sendPhoto(chatId: string, photo: string, caption?: string) {
    try {
      await axios.post(`${this.apiUrl}/sendPhoto`, {
        chat_id: chatId,
        photo,
        caption
      });
    } catch (error) {
      console.error(`Telegram API Error (sendPhoto): ${error}`);
    }
  }

  async leaveChat(chatId: string) {
    try {
      await axios.post(`${this.apiUrl}/leaveChat`, {
        chat_id: chatId,
      });
    } catch (error) {
      console.error(`Telegram API Error (leaveChat): ${error}`);
    }
  }
  
  async getFile(fileId: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/getFile?file_id=${fileId}`);
      return response.data.result;
    } catch (error) {
      console.error(`Telegram API Error (getFile): ${error}`);
      throw error;
    }
  }

  async deleteWebhook() {
    try {
      const response = await axios.post(`${this.apiUrl}/deleteWebhook`, {
        drop_pending_updates: true,
      });
      return response.data.ok;
    } catch (error) {
      console.error(`Telegram API Error (deleteWebhook): ${error}`);
      throw error;
    }
  }
}