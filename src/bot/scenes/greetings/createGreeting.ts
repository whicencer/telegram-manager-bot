import { SceneNames } from "constants/Scenes";
import { Scene } from "../scene";
import { prisma } from "database/client";

export const createGreetingScene = new Scene(SceneNames.CREATE_GREETING_SCENE);

createGreetingScene.enter(async (ctx) => {
  await ctx.reply("📝 Введите текст приветствия:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⬅️ Назад", callback_data: "back" }],
      ]
    }
  });
});

createGreetingScene.action("back", async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);
  await ctx.scene.enter(SceneNames.BOT_GREETINGS_SCENE);
});

createGreetingScene.on("text", async (ctx) => {
  // @ts-ignore
  const botId = ctx.session.botId;
  const greetingText = ctx.msg.text;
  const entities = ctx.msg.entities;

  await prisma.greetings.create({
    data: {
      botId,
      text: greetingText,
      entities: {
        create: entities
      }
    }
  });

  await ctx.reply("✅ Приветствие успешно добавлено");
  await ctx.scene.enter(SceneNames.BOT_GREETINGS_SCENE);
});