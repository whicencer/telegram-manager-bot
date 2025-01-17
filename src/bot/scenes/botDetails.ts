import dedent from "dedent";
import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "./scene";
import { prisma } from "database/client";
import { deleteMessages } from "utils/deleteMessages";
import { Actions } from "constants/Actions";

export const botDetailsScene = new SceneWithBack(
  SceneNames.BOT_DETAILS_SCENE,
  SceneNames.MY_BOTS_SCENE
);

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
  const isAutoApproveEnabledEmoji = bot?.isAutoApproveEnabled ? "✅" : "❌";

  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "👋 Приветствия", callback_data: "greeting" },
          { text: "🫂 Прощания", callback_data: "farewell" }
        ],
        [{ text: `${isAutoApproveEnabledEmoji} Автоматическое принятие заявок`, callback_data: "autoapprove" }],
        [{ text: "🔌 Подключенные каналы", callback_data: "connected_channels" }],
        [{ text: "🗑 Удалить бота", callback_data: "delete" }],
        [{ text: "⬅️ Назад", callback_data: Actions.BACK }],
      ]
    },
    parse_mode: 'HTML'
  });
});

botDetailsScene.action('autoapprove', async (ctx) => {
  // @ts-ignore
  const botId = ctx.session.botId;

  const bot = await prisma.bot.findUnique({
    where: { id: botId }
  });

  await prisma.bot.update({
    where: { id: botId },
    data: {
      isAutoApproveEnabled: !bot?.isAutoApproveEnabled
    }
  });

  const message = bot?.isAutoApproveEnabled
    ? "❌ Автоматическое принятие заявок выключено"
    : "✅ Автоматическое принятие заявок включено";

  deleteMessages(ctx, [ctx.msg.message_id]);
  const msg = await ctx.reply(message);
  
  await ctx.scene.reenter();

  setTimeout(() => {
    deleteMessages(ctx, [msg.message_id]);
  }, 3000);
});

botDetailsScene.action('delete', async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);
  ctx.scene.enter(SceneNames.DELETE_BOT_SCENE);
});

botDetailsScene.action('greeting', async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);
  await ctx.scene.enter(SceneNames.BOT_GREETINGS_SCENE);
});

botDetailsScene.action('farewell', async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);
  await ctx.scene.enter(SceneNames.BOT_FAREWELLS_SCENE);
});

botDetailsScene.action('connected_channels', async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);
  await ctx.scene.enter(SceneNames.CONNECTED_CHANNELS_SCENE);
});