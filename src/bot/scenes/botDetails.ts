import dedent from "dedent";
import { SceneNames } from "constants/Scenes";
import { Scene } from "./scene";
import { prisma } from "database/client";

export const botDetailsScene = new Scene(SceneNames.BOT_DETAILS_SCENE);

botDetailsScene.enter(async (ctx) => {
  // @ts-ignore
  const botId = ctx.session.botId;

  const bot = await prisma.bot.findUnique({
    where: { id: botId }
  });

  const message = dedent`
    🤖 <b>Информация</b>

    Имя: @${bot?.username}
    ID: ${bot?.id}
  `;

  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👋 Настроить приветствие", callback_data: `greeting` }],
        [{ text: "🗑 Удалить бота", callback_data: `delete` }],
        [{ text: "⬅️ Назад", callback_data: `back` }],
      ]
    },
    parse_mode: 'HTML'
  });
});

botDetailsScene.action('delete', async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);
  ctx.scene.enter(SceneNames.DELETE_BOT_SCENE);
});

botDetailsScene.action('greeting', async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);
  await ctx.scene.enter(SceneNames.BOT_GREETINGS_SCENE);
});

botDetailsScene.action("back", async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);
  await ctx.scene.enter(SceneNames.MY_BOTS_SCENE);
});