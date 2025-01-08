import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "../scene";
import { prisma } from "database/client";
import dedent from "dedent";

export const manageUsersScene = new SceneWithBack(
  SceneNames.ADMIN_MANAGE_USERS_SCENE,
  SceneNames.ADMIN_CONTROL_PANEL_SCENE
);

manageUsersScene.enter(async (ctx) => {
  await ctx.reply("👤 Выберите действие", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "➕ Добавить пользователя", callback_data: "add_new" }],
        [{ text: "➖ Удалить пользователя", callback_data: "delete_user" }],
        [{ text: "📋 Список пользователей", callback_data: "users_list" }],
        [{ text: "⬅️ Назад", callback_data: "back" }],
      ]
    }
  });
});

manageUsersScene.action("users_list", async (ctx) => {
  const users = await prisma.telegramUser.findMany({
    where: {hasAccessToBot: true},
    include: {bots: true}
  });

  const usersList = users.map(user => dedent`<b>ID</b>: ${user.telegramId} | <b>Username:</b> ${user.username} | <b>Количество ботов:</b> ${user.bots.length}`).join("\n");
  await ctx.reply(`<b>Список пользователей:</b>\n${usersList.length ? usersList : "Пользователей нет"}`, { parse_mode: "HTML" });
});

manageUsersScene.action("add_new", async (ctx) => {
  //
});

manageUsersScene.action("delete_user", async (ctx) => {
  //
});