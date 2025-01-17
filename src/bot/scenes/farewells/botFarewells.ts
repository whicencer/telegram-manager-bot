import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "../scene";
import { Actions } from "constants/Actions";
import { prisma } from "database/client";

export const botFarewellsScene = new SceneWithBack(
  SceneNames.BOT_FAREWELLS_SCENE,
  SceneNames.BOT_DETAILS_SCENE
);

botFarewellsScene.enter(async (ctx) => {
  // @ts-ignore
  const botId = ctx.session.botId;
  
  const leavings = await prisma.leavings.findMany({
    where: { botId }
  });

  await ctx.reply("Настройка прощаний", {
    reply_markup: {
      inline_keyboard: [
        ...leavings.map(({ id, text }) => {
          return [{
            text,
            callback_data: `farewell_${id}`
          }];
        }),
        [{ text: "➕ Добавить прощание", callback_data: "create" }],
        [{ text: "⬅️ Назад", callback_data: Actions.BACK }]
      ]
    }
  });
});

botFarewellsScene.action("create", async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);
  await ctx.scene.enter(SceneNames.CREATE_FAREWELL_SCENE);
});