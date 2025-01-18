import { SceneNames } from "constants/Scenes";
import { IBotContext } from "types/IBotContext";

export async function checkFarewellId(ctx: IBotContext, next: () => void) {
  // @ts-ignore
  const farewellId = ctx.session.farewellId;

  if (!farewellId) {
    await ctx.reply("❌ Не удалось найти прощание");
    return ctx.scene.enter(SceneNames.BOT_DETAILS_SCENE);
  }

  next();
}