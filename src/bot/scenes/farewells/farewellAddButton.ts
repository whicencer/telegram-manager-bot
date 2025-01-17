import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "../scene";
import { Actions } from "constants/Actions";
import { deleteMessages } from "utils/deleteMessages";
import { prisma } from "database/client";

enum AddButtonSteps {
  BUTTON_TEXT = 0,
  BUTTON_URL = 1
}

export const farewellAddButtonScene = new SceneWithBack(
  SceneNames.FAREWELL_ADD_BUTTON_SCENE,
  SceneNames.FAREWELL_DETAILS_SCENE
);

farewellAddButtonScene.enter(async (ctx) => {
  await ctx.reply("Введите текст кнопки", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⬅️ Назад", callback_data: Actions.BACK }]
      ]
    }
  });

  //@ts-ignore
  ctx.scene.session.currentStep = AddButtonSteps.BUTTON_TEXT;
});

farewellAddButtonScene.on("text", async (ctx) => {
  // @ts-ignore
  const currentStep = ctx.scene.session.currentStep;
  // @ts-ignore
  const farewellId = ctx.session.farewellId;
  const text = ctx.message.text;

  switch (currentStep) {
    case AddButtonSteps.BUTTON_TEXT:
      // @ts-ignore
      ctx.scene.session.buttonText = text;
      await ctx.reply("Введите URL кнопки", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "⬅️ Назад", callback_data: "reenter" }]
          ]
        }
      });
      // @ts-ignore
      ctx.scene.session.currentStep = AddButtonSteps.BUTTON_URL;
      break;
    case AddButtonSteps.BUTTON_URL:
      // @ts-ignore
      ctx.scene.session.buttonUrl = text;
      try {
        await prisma.button.create({
          data: {
            // @ts-ignore
            text: ctx.scene.session.buttonText,
            // @ts-ignore
            url: ctx.scene.session.buttonUrl,
            leavingId: farewellId
          }
        });
        await ctx.reply("Кнопка успешно добавлена");
        // @ts-ignore
      } catch (error) {
        console.error(error);
        await ctx.reply("Произошла ошибка при добавлении кнопки");
      } finally {
        await ctx.scene.enter(SceneNames.FAREWELL_DETAILS_SCENE);
      }
      break;
    default:
      await ctx.reply("Такого этапа не существует.");
      break;
  }
});

farewellAddButtonScene.action("reenter", async (ctx) => {
  await deleteMessages(ctx, [ctx.msg?.message_id]);
  await ctx.scene.reenter();
});