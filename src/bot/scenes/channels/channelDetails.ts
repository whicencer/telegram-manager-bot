import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "../scene";
import dedent from "dedent";
import { prisma } from "database/client";
import { Actions } from "constants/Actions";
import { checkChannelId } from "middleware/checkChannelId";

export const channelDetailsScene = new SceneWithBack(
  SceneNames.CHANNEL_DETAILS_SCENE,
  SceneNames.CONNECTED_CHANNELS_SCENE
);

channelDetailsScene.enter(checkChannelId, async (ctx) => {
  // @ts-ignore
  const channelId = ctx.session.channelId;

  const currentChannel = await prisma.channel.findUnique({where: { id: channelId }});

  const message = dedent`
    📢 Информация о канале <b>${currentChannel?.title}</b>

    ID: ${currentChannel?.id}
  `;
  
  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💬 Опубликовать пост", callback_data: "publish_post" }],
        [{ text: "⬅️ Назад", callback_data: Actions.BACK }],
      ]
    },
    parse_mode: 'HTML'
  });
});

channelDetailsScene.action("publish_post", async (ctx) => {
  await ctx.deleteMessage(ctx.callbackQuery.message?.message_id);
  await ctx.scene.enter(SceneNames.CHANNEL_PUBLISH_POST_SCENE);
});