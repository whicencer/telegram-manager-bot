import { SceneNames } from "constants/Scenes";
import { IBotContext } from "types/IBotContext";

export async function checkChannelId(ctx: IBotContext, next: () => void) {
  // @ts-ignore
  const channelId = ctx.session.channelId;

  if (!channelId) {
    await ctx.reply("❌ Не удалось найти канал");
    return ctx.scene.enter(SceneNames.CONNECTED_CHANNELS_SCENE);
  }

  next();
}