import { SceneNames } from "constants/Scenes";
import { Scene } from "../scene";
import { prisma } from "database/client";
import { deleteMessages } from "utils/deleteMessages";

enum AddButtonSteps {
  BUTTON_TEXT = 0,
  BUTTON_URL = 1
}

export const addButtonScene = new Scene(SceneNames.ADD_BUTTON_SCENE);

addButtonScene.enter(async (ctx) => {
  await ctx.reply("Введите текст кнопки", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Отмена", callback_data: "cancel" }]
      ]
    }
  });
  // @ts-ignore
  ctx.scene.session.currentStep = AddButtonSteps.BUTTON_TEXT;
});

addButtonScene.action("cancel", async (ctx) => {
  // @ts-ignore
  deleteMessages(ctx, [ctx.callbackQuery.message.message_id]);
  await ctx.scene.enter(SceneNames.GREETING_DETAILS_SCENE);
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