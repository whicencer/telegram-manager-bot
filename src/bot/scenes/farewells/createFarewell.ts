import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "../scene";
import { Actions } from "constants/Actions";
import { prisma } from "database/client";

export const createFarewellScene = new SceneWithBack(
  SceneNames.CREATE_FAREWELL_SCENE,
  SceneNames.BOT_FAREWELLS_SCENE
);

createFarewellScene.enter(async (ctx) => {
  await ctx.reply("📝 Введите текст прощания", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⬅️ Назад", callback_data: Actions.BACK }]
      ]
    }
  });
});

createFarewellScene.on("text", async (ctx) => {
  // @ts-ignore
  const botId = ctx.session.botId;
  const farewellText = ctx.message.text;
  const farewellEntities = ctx.message.entities;

  try {
    await prisma.leavings.create({
      data: {
        botId,
        text: farewellText,
        entities: {
          create: farewellEntities
        }
      }
    });

    await ctx.reply("✅ Прощание успешно сохранено");
  } catch (error) {
    await ctx.reply("❌ Произошла ошибка при сохранении прощания");
    console.error(error);
  } finally {
    await ctx.scene.enter(SceneNames.BOT_DETAILS_SCENE);
  }
});