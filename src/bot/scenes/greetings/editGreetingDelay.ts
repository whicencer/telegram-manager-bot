import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "../scene";
import { Actions } from "constants/Actions";
import { prisma } from "database/client";

export const editGreetingsDelayScene = new SceneWithBack(
  SceneNames.EDIT_GREETING_DELAY_SCENE,
  SceneNames.GREETING_DETAILS_SCENE
);

editGreetingsDelayScene.enter(async (ctx) => {
  await ctx.reply("Введите задержку перед отправкой приветствия в секундах:", {
    reply_markup: {
      inline_keyboard: [[{ text: "⬅️ Назад", callback_data: Actions.BACK }]]
    }
  });
});

editGreetingsDelayScene.on("text", async (ctx) => {
  // @ts-ignore
  const greetingId = ctx.session.greetingId;
  const delayInSeconds = parseInt(ctx.message.text);

  if (isNaN(delayInSeconds)) {
    return await ctx.scene.reenter();
  }

  try {
    await prisma.greetings.update({
      where: { id: greetingId },
      data: { delayInSeconds }
    });

    await ctx.reply("Задержка успешно обновлена");
    await ctx.scene.enter(SceneNames.GREETING_DETAILS_SCENE);
  } catch (error) {
    await ctx.reply("Произошла ошибка при обновлении задержки");
    console.error("Error while updating greeting delay", error);
  }
});