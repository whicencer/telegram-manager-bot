import dedent from "dedent";
import { SceneNames } from "constants/Scenes";
import { Scene } from "./scene";
import { Actions } from "constants/Actions";
import { prisma } from "database/client";

export const botDetailsScene = new Scene(SceneNames.BOT_DETAILS_SCENE);

botDetailsScene.enter(async (ctx) => {
  // @ts-ignore
  const {bot} = ctx.scene.state;

  if (!bot) {
    await ctx.reply("Бот не найден.");
    await ctx.scene.enter(SceneNames.MY_BOTS_SCENE);
    return;
  }

  const message = dedent`
    🤖 <b>Информация</b>

    Имя: @${bot?.username}
    ID: ${bot?.id}
  `;

  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👋 Настроить приветствие", callback_data: Actions.GREETING_CONFIG }],
        [{ text: "🗑 Удалить бота", callback_data: `delete_${bot.id}` }],
        [{ text: "⬅️ Назад", callback_data: `back` }],
      ]
    },
    parse_mode: 'HTML'
  });
});

botDetailsScene.action(/delete_(\d+)/, async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);

  const botId = ctx.match[1];
  const bot = await prisma.bot.findUnique({
    where: { id: Number(botId) }
  });

  ctx.scene.enter(SceneNames.DELETE_BOT_SCENE, { bot })
});

botDetailsScene.action(Actions.GREETING_CONFIG, async (ctx) => {
  //
});

botDetailsScene.action("back", async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);
  await ctx.scene.enter(SceneNames.MY_BOTS_SCENE);
});