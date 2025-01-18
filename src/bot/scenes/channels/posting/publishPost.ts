import { SceneNames } from "constants/Scenes";
import { Actions } from "constants/Actions";
import { deleteMessages } from "utils/deleteMessages";
import { SceneWithBack } from "bot/scenes/scene";

export const publishPostScene = new SceneWithBack(
  SceneNames.CHANNEL_PUBLISH_POST_SCENE,
  SceneNames.CHANNEL_DETAILS_SCENE
);

publishPostScene.enter(async (ctx) => {
  const msg = await ctx.reply('📝 Введите текст поста', {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Отмена", callback_data: Actions.BACK }]
      ]
    }
  });

  // @ts-ignore
  ctx.session.postMessageId = msg.message_id;
});

publishPostScene.on("text", async (ctx) => {
  const text = ctx.message.text;
  const entities = ctx.message.entities || [];

  // @ts-ignore
  await deleteMessages(ctx, [ctx.message.message_id, ctx.session.postMessageId]);
  await ctx.scene.enter(SceneNames.CHANNEL_PUBLISH_POST_SETTINGS_SCENE, { text, entities });
});