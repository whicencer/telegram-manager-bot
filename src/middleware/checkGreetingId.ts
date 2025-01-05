import { SceneNames } from "constants/Scenes";
import { IBotContext } from "types/IBotContext";

export async function checkGreetingId(ctx: IBotContext, next: () => void) {
  // @ts-ignore
  const {greetingId, botId} = ctx.scene.state;

  if (!greetingId) {
    await ctx.reply("❌ Не удалось найти приветствие");
    return ctx.scene.enter(SceneNames.BOT_GREETINGS_SCENE, { botId });
  }

  next();
}