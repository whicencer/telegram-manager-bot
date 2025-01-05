import { SceneNames } from "constants/Scenes";
import { IBotContext } from "types/IBotContext";

export async function checkBotId(ctx: IBotContext, next: () => void) {
  // @ts-ignore
  const {botId} = ctx.scene.state;

  if (!botId) {
    await ctx.reply("❌ Не удалось найти бота");
    return ctx.scene.enter(SceneNames.MY_BOTS_SCENE);
  }

  next();
}