import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "../scene";
import { checkGreetingId } from "middleware/checkGreetingId";
import { prisma } from "database/client";
import { deleteMessages } from "utils/deleteMessages";

export const editGreetingTextScene = new SceneWithBack(
  SceneNames.EDIT_GREETING_TEXT_SCENE,
  SceneNames.GREETING_DETAILS_SCENE
);

editGreetingTextScene.enter(checkGreetingId, async (ctx) => {
  const msg = await ctx.reply("📝 Введите новый текст приветствия", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⬅️ Назад", callback_data: "back" }]
      ]
    }
  });

  // @ts-ignore
  ctx.scene.session.msgId = msg.message_id;
});

editGreetingTextScene.on("text", async (ctx) => {
  // @ts-ignore
  const greetingId = ctx.session.greetingId;
  const newGreetingText = ctx.message.text;

  await prisma.greetings.update({
    where: { id: greetingId },
    data: { text: newGreetingText }
  });

  // @ts-ignore
  deleteMessages(ctx, [ctx.scene.session.msgId, ctx.message.message_id]);
  await ctx.reply("✅ Текст приветствия успешно изменен");
  await ctx.scene.enter(SceneNames.GREETING_DETAILS_SCENE);
});