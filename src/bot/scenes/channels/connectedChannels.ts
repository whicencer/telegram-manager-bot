import { SceneNames } from "constants/Scenes";
import { Actions } from "constants/Actions";
import { prisma } from "database/client";
import { SceneWithBack } from "../scene";

export const connectedChannelsScene = new SceneWithBack(
  SceneNames.CONNECTED_CHANNELS_SCENE,
  SceneNames.BOT_DETAILS_SCENE
);

connectedChannelsScene.enter(async (ctx) => {
  // @ts-ignore
  const botId = ctx.session.botId;
  
  const botChannels = await prisma.channel.findMany({where: { botId }});
  
  await ctx.reply('🔌 Подключенные каналы', {
    reply_markup: {
      inline_keyboard: [
        ...botChannels.map(channel => ([{ text: channel.title, callback_data: `channel_${channel.id}` }])),
        [{ text: "➕ Подключить канал", callback_data: "connect_channel" }],
        [{ text: "⬅️ Назад", callback_data: Actions.BACK }]
      ]
    }
  });
});

connectedChannelsScene.action("connect_channel", async (ctx) => {
  await ctx.reply(
    "<i>Для того, чтобы подключить канал, просто <b>добавьте своего бота в администраторы канала</b>. После этого он уведомит вас о добавлении в канал.</i>",
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: "Ок, понятно", callback_data: "how_to_connect_agree" }]
        ]
      }
    }
  );
});

connectedChannelsScene.action(/channel_(\-\d+)/, async (ctx) => {
  const channelId = ctx.match[1];
  // @ts-ignore
  ctx.session.channelId = channelId;

  await ctx.deleteMessage(ctx.callbackQuery.message?.message_id);
  await ctx.scene.enter(SceneNames.CHANNEL_DETAILS_SCENE);
});

connectedChannelsScene.action("how_to_connect_agree", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message?.message_id);
});