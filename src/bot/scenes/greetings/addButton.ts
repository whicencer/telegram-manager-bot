import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "../scene";
import { prisma } from "database/client";
import { checkGreetingId } from "middleware/checkGreetingId";
import { Actions } from "constants/Actions";

enum AddButtonSteps {
  BUTTON_TEXT = 0,
  BUTTON_URL = 1
}

export const addButtonScene = new SceneWithBack(
  SceneNames.ADD_BUTTON_SCENE,
  SceneNames.GREETING_DETAILS_SCENE
);

addButtonScene.enter(checkGreetingId, async (ctx) => {
  await ctx.reply("Введите текст кнопки", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Отмена", callback_data: Actions.BACK }]
      ]
    }
  });
  // @ts-ignore
  ctx.scene.session.currentStep = AddButtonSteps.BUTTON_TEXT;
});

addButtonScene.on("text", async (ctx) => {
  // @ts-ignore
  const greetingId = ctx.session.greetingId;
  // @ts-ignore
  const currentStep = ctx.scene.session.currentStep;

  switch (currentStep) {
    case AddButtonSteps.BUTTON_TEXT: {
      // @ts-ignore
      ctx.scene.session.buttonText = ctx.message.text;
      await ctx.reply("Введите URL кнопки");
      // @ts-ignore
      ctx.scene.session.currentStep = AddButtonSteps.BUTTON_URL;
      break;
    }
    case AddButtonSteps.BUTTON_URL: {
      // @ts-ignore
      ctx.scene.session.buttonUrl = ctx.message.text;
      await prisma.greetingButton.create({
        data: {
          // @ts-ignore
          text: ctx.scene.session.buttonText,
          // @ts-ignore
          url: ctx.scene.session.buttonUrl,
          greetingId
        }
      });
      await ctx.reply("Кнопка успешно добавлена");
      // @ts-ignore
      await ctx.scene.enter(SceneNames.GREETING_DETAILS_SCENE);
      break;
    }
    default: {
      await ctx.reply("Произошла ошибка");
      break;
    }
  }
});