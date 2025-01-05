import { SceneNames } from "constants/Scenes";
import { Scene } from "../scene";
import { prisma } from "database/client";
import { checkGreetingId } from "middleware/checkGreetingId";

export const greetindDetailsScene = new Scene(SceneNames.GREETING_DETAILS_SCENE);

greetindDetailsScene.enter(checkGreetingId, async (ctx) => {
  // @ts-ignore
  const { greetingId } = ctx.scene.state;

  if (!greetingId) {
    await ctx.reply("Произошла ошибка при получении данных о приветствии");
    await ctx.scene.enter(SceneNames.BOT_GREETINGS_SCENE);
    return;
  }

  const currentGreeting = await prisma.greetings.findUnique({
    where: { id: greetingId },
    include: {
      entities: true
    }
  });

  await ctx.reply(`Настройки приветствия`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📝 Изменить текст", callback_data: "edit_greeting" }],
        [{ text: "🖼 Изменить изображение", callback_data: "edit_greeting_picture" }],
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
    entities: currentGreeting?.entities as any,
    link_preview_options: { is_disabled: true }
  });
  // @ts-ignore
  ctx.scene.state.msgId = msg.message_id;
});

greetindDetailsScene.action("edit_greeting_picture", async (ctx) => {
  // @ts-ignore
  const { greetingId } = ctx.scene.state;
  // @ts-ignore
  const messagesToDelete = [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId].filter(id => id !== null && id !== undefined);
  if (messagesToDelete.length > 0) {
    await ctx.deleteMessages(messagesToDelete);
  }
  await ctx.scene.enter(SceneNames.EDIT_GREETING_PICTURE_SCENE, { greetingId });
});

greetindDetailsScene.action("delete_greeting", checkGreetingId, async (ctx) => {
  // @ts-ignore
  const { greetingId } = ctx.scene.state;

  await prisma.greetings.delete({
    where: {
      id: greetingId
    }
  });

  // @ts-ignore
  const messagesToDelete = [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId].filter(id => id !== null && id !== undefined);
  if (messagesToDelete.length > 0) {
    await ctx.deleteMessages(messagesToDelete);
  }
  await ctx.reply("Приветствие успешно удалено");
  await ctx.scene.enter(SceneNames.BOT_GREETINGS_SCENE);
});

greetindDetailsScene.action("back", async (ctx) => {
  // @ts-ignore
  await ctx.deleteMessages([ctx.msg.message_id, ctx.scene.state.msgId, ctx.scene.state.msgWithPhotoId]);
  await ctx.scene.enter(SceneNames.BOT_GREETINGS_SCENE);
});