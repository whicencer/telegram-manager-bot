import dedent from "dedent";
import { SceneNames } from "constants/Scenes";
import { Scene } from "./scene";
import { validateTelegramBotToken } from "utils/tokenValidator";
import { prisma } from "database/client";
import botManager from "../botManager";

export const addNewBotScene = new Scene(SceneNames.ADD_NEW_BOT_SCENE);

addNewBotScene.enter(async (ctx) => {
  const message = dedent`
  🔑 Отправьте мне токен бота, который вы получили у @BotFather
  
  ⚠️ Внимание: Если ваш бот уже привязан к каким-то другим сервисам, прежде чем скопировать токен у BotFather, нажмите "Revoke Token"`;
  
  ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Отмена", callback_data: "cancel" }]
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
    ctx.reply(`Ошибка при создании бота: ${error?.message}`);
  }
});

addNewBotScene.action("cancel", async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);
  await ctx.scene.enter(SceneNames.MY_BOTS_SCENE);
});