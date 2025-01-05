import { Actions } from "constants/Actions";
import { prisma } from "database/client";
import { SceneNames } from "constants/Scenes";
import { Scene } from "./scene";

export const myBots = new Scene(SceneNames.MY_BOTS_SCENE);

myBots.enter(async (ctx) => {
  const userBots = await prisma.bot.findMany({
    where: {
      telegramUser: {
        telegramId: ctx.from?.id
      }
    }
  });

  await ctx.reply('Ваши боты:', {
    reply_markup: {
      inline_keyboard: [
        ...userBots.map((bot) => (
          [{ text: bot.username, callback_data: `bot_${bot.id}` }]
        )),
        [{ text: "Добавить бота", callback_data: Actions.ADD_BOT }]
      ]
    }
  });
});

myBots.action(Actions.ADD_BOT, async (ctx) => {
  ctx.deleteMessage(ctx.msg.message_id);
  await ctx.scene.enter(SceneNames.ADD_NEW_BOT_SCENE);
});

myBots.action(/bot_(\d+)/, async (ctx) => {
  ctx.deleteMessage(ctx.msg.message_id);
  
  const botId = ctx.match[1];
  // @ts-ignore
  ctx.session.botId = botId;

  await ctx.scene.enter(SceneNames.BOT_DETAILS_SCENE, { botId });
});