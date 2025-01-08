import { SceneNames } from "constants/Scenes";
import { Scene } from "../scene";
import { deleteMessages } from "utils/deleteMessages";

export const controlPanelScene = new Scene(SceneNames.ADMIN_CONTROL_PANEL_SCENE);

controlPanelScene.enter(async (ctx) => {
  await ctx.reply("⚙️ Выберите действие", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👤 Пользователи", callback_data: "users" }],
      ]
    }
  });
});

controlPanelScene.action("users", async (ctx) => {
  deleteMessages(ctx, [ctx.msg.message_id]);
  await ctx.scene.enter(SceneNames.ADMIN_MANAGE_USERS_SCENE);
});