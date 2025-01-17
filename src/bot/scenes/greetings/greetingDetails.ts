import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "../scene";
import { prisma } from "database/client";
import { checkGreetingId } from "middleware/checkGreetingId";
import { deleteMessages } from "utils/deleteMessages";
import { Actions } from "constants/Actions";

export const greetindDetailsScene = new SceneWithBack(
  SceneNames.GREETING_DETAILS_SCENE,
  SceneNames.BOT_GREETINGS_SCENE
);

greetindDetailsScene.enter(checkGreetingId, async (ctx) => {
  // @ts-ignore
  const greetingId = ctx.session.greetingId;

  const currentGreeting = await prisma.greetings.findUnique({
    where: { id: greetingId },
    include: {
      entities: true,
      buttons: true
    }
  });

  await ctx.reply(`Настройки приветствия`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📝 Изменить текст", callback_data: "edit_greeting" }],
        // [{ text: "🖼 Изменить изображение", callback_data: "edit_greeting_picture" }],
        [{ text: "🆙 Добавить кнопку", callback_data: "add_button" }],
        [{ text: "❌ Удалить все кнопки", callback_data: "delete_buttons" }],
        [{ text: "🗑️ Удалить", callback_data: "delete_greeting" }],
        [{ text: "⬅️ Назад", callback_data: Actions.BACK }],
      ]
    }
  });

  const msg = await ctx.reply(`${currentGreeting?.text}`, {
    reply_markup: {
      inline_keyboard: [
        ...(currentGreeting?.buttons?.map(button => [{ text: button.text, url: button.url }]) || [])
      ]
    },
    entities: currentGreeting?.entities as any,
    link_preview_options: { is_disabled: true }
  });
  // @ts-ignore
  ctx.scene.state.msgId = msg.message_id;
});

greetindDetailsScene.action("edit_greeting", async (ctx) => {
  // @ts-ignore
  deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId]);
  await ctx.scene.enter(SceneNames.EDIT_GREETING_TEXT_SCENE);
});

greetindDetailsScene.action("delete_buttons", async (ctx) => {
  // @ts-ignore
  const greetingId = ctx.session.greetingId;

  await prisma.button.deleteMany({ where: { greetingId } });

  // @ts-ignore
  deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId]);
  await ctx.reply("Кнопки успешно удалены");
  await ctx.scene.reenter();
});

greetindDetailsScene.action("add_button", async (ctx) => {
  // @ts-ignore
  deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId]);
  await ctx.scene.enter(SceneNames.ADD_BUTTON_SCENE);
});

greetindDetailsScene.action("edit_greeting_picture", async (ctx) => {
  // @ts-ignore
  deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId]);
  await ctx.scene.enter(SceneNames.EDIT_GREETING_PICTURE_SCENE);
});

greetindDetailsScene.action("delete_greeting", checkGreetingId, async (ctx) => {
  // @ts-ignore
  const greetingId = ctx.session.greetingId;

  await prisma.greetings.delete({ where: { id: greetingId } });

  // @ts-ignore
  deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId]);
  await ctx.reply("Приветствие успешно удалено");
  await ctx.scene.enter(SceneNames.BOT_GREETINGS_SCENE);
});