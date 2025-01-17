import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "../scene";
import { Actions } from "constants/Actions";
import { prisma } from "database/client";

export const editFarewellText = new SceneWithBack(
  SceneNames.EDIT_FAREWELL_TEXT_SCENE,
  SceneNames.FAREWELL_DETAILS_SCENE
);

editFarewellText.enter(async (ctx) => {
  await ctx.reply("📝 Введите новый текст прощания", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⬅️ Назад", callback_data: Actions.BACK }]
      ]
    }
  });
});

editFarewellText.on("text", async (ctx) => {
  // @ts-ignore
  const farewellId = ctx.session.farewellId;
  const newText = ctx.message.text;
  const newEntities = ctx.message.entities;

  try {
    await prisma.leavings.update({
      where: { id: farewellId },
      data: {
        text: newText,
        entities: {
          deleteMany: {},
          create: newEntities,
        }
      }
    });
    await ctx.reply("✅ Текст прощания успешно изменен");
  } catch (error) {
    await ctx.reply("❌ Произошла ошибка при изменении текста прощания");
    console.error(error);
  } finally {
    await ctx.scene.enter(SceneNames.FAREWELL_DETAILS_SCENE);
  }
});