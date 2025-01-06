import { SceneNames } from "constants/Scenes";
import { IBotContext } from "types/IBotContext";

export async function checkGreetingId(ctx: IBotContext, next: () => void) {
  // @ts-ignore
  const greetingId = ctx.session.greetingId;

  if (!greetingId) {
    await ctx.reply("❌ Не удалось найти приветствие");
    return ctx.scene.enter(SceneNames.BOT_GREETINGS_SCENE);
  }

  next();
}