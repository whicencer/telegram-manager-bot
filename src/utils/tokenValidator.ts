import { TelegramAPI } from "services/telegramApi";

export async function validateTelegramBotToken(token: string) {
  const api = new TelegramAPI(token);

  try {
    const me = await api.getMe();

    return me;
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error("Бот не найден");
    }

    throw new Error(error.response?.data.description || "Неизвестная ошибка");
  }
}