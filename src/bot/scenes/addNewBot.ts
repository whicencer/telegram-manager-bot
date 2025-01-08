import dedent from "dedent";
import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "./scene";
import { validateTelegramBotToken } from "utils/tokenValidator";
import { prisma } from "database/client";
import botManager from "../botManager";

export const addNewBotScene = new SceneWithBack(
  SceneNames.ADD_NEW_BOT_SCENE,
  SceneNames.MY_BOTS_SCENE
);

addNewBotScene.enter(async (ctx) => {
  const message = dedent`
  🔑 Отправьте мне токен бота, который вы получили у @BotFather
  
  ⚠️ Внимание: Если ваш бот уже привязан к каким-то другим сервисам, прежде чем скопировать токен у BotFather, нажмите "Revoke Token"`;
  
  ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Отмена", callback_data: "back" }]
      ]
    }
  });
});

addNewBotScene.on("text", async (ctx) => {
  const token = ctx.message.text;

  try {
    await validateTelegramBotToken(token);

    const user = await prisma.telegramUser.findUnique({ where: { telegramId: ctx.from.id } });
    if (!user?.id) {
      return ctx.reply('Ошибка: пользователь не найден.');
    }

    const newBot = await botManager.createBot(token, user.id);
    await ctx.reply(`Бот ${newBot.username} успешно создан!`);
    await ctx.scene.enter(SceneNames.MY_BOTS_SCENE);
  } catch (error: Error | any) {
    await ctx.reply(`Ошибка при создании бота`);
    await ctx.scene.leave();
    console.error(error);
  }
});