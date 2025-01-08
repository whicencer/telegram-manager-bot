import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "./scene";
import { prisma } from "database/client";
import { TelegramAPI } from "services/telegramApi";

export const deleteBotScene = new SceneWithBack(
  SceneNames.DELETE_BOT_SCENE,
  SceneNames.BOT_DETAILS_SCENE
);

deleteBotScene.enter(async (ctx) => {
  await ctx.reply("Вы уверены что хотите удалить бота?", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Да", callback_data: "sure_delete" },
          { text: "Отменить", callback_data: "back" }
        ]
      ]
    }
  });
});

deleteBotScene.action("sure_delete", async (ctx) => {
  // @ts-ignore
  const botId = ctx.session.botId;
  const bot = await prisma.bot.findUnique({
    where: { id: botId }
  });

  if (!bot?.token) {
    await ctx.reply("Токен бота не найден, удаление невозможно.");
    return;
  }

  const currentBotApi = new TelegramAPI(bot?.token);

  try {
    currentBotApi.deleteWebhook();
    await prisma.bot.delete({
      where: { id: botId }
    });
    ctx.deleteMessage(ctx.msg.message_id);

    await ctx.reply(`Бот ${bot?.username} был успешно удалён`);
    await ctx.scene.enter(SceneNames.MY_BOTS_SCENE);
  } catch (error) {
    console.error(error);
  }
});