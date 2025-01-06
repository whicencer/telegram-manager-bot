import { SceneNames } from "constants/Scenes";
import { Scene } from "../scene";
import { prisma } from "database/client";
import { checkGreetingId } from "middleware/checkGreetingId";
import { deleteMessages } from "utils/deleteMessages";

export const greetindDetailsScene = new Scene(SceneNames.GREETING_DETAILS_SCENE);

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
        [{ text: "🗑️ Удалить", callback_data: "delete_greeting" }],
        [{ text: "⬅️ Назад", callback_data: "back" }],
      ]
    }
  });

  if (currentGreeting?.imageUrl) {
    const msgWithPhoto = await ctx.replyWithPhoto(currentGreeting.imageUrl);
    // @ts-ignore
    ctx.scene.state.msgWithPhotoId = msgWithPhoto.message_id;
  }
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

greetindDetailsScene.action("edit_greeting_picture", async (ctx) => {
  // @ts-ignore
  deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId]);
  await ctx.scene.enter(SceneNames.EDIT_GREETING_PICTURE_SCENE);
});

greetindDetailsScene.action("delete_greeting", checkGreetingId, async (ctx) => {
  // @ts-ignore
  const { greetingId } = ctx.scene.state;

  await prisma.greetings.delete({ where: { id: greetingId } });

  // @ts-ignore
  deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId]);
  await ctx.reply("Приветствие успешно удалено");
  await ctx.scene.enter(SceneNames.BOT_GREETINGS_SCENE);
});

greetindDetailsScene.action("back", async (ctx) => {
  // @ts-ignore
  deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId]);
  await ctx.scene.enter(SceneNames.BOT_GREETINGS_SCENE);
});