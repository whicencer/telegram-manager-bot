import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "../scene";
import { prisma } from "database/client";
import { Actions } from "constants/Actions";

export const botGreetingsScene = new SceneWithBack(
  SceneNames.BOT_GREETINGS_SCENE,
  SceneNames.BOT_DETAILS_SCENE
);

botGreetingsScene.enter(async (ctx) => {
  // @ts-ignore
  const botId = ctx.session.botId;

  const greetings = await prisma.greetings.findMany({
    where: { botId }
  });

  await ctx.reply("👋 Настройка приветствий", {
    reply_markup: {
      inline_keyboard: [
        ...greetings.map(({ id, text }) => ([{
          text,
          callback_data: `greeting_${id}`
        }])),
        [{ text: "➕ Добавить приветствие", callback_data: "add_greeting" }],
        [{ text: "⬅️ Назад", callback_data: Actions.BACK }],
      ]
    }
  });
});

botGreetingsScene.action(/greeting_(\w+)/, async (ctx) => {
  const greetingId = ctx.match[1];
  // @ts-ignore
  ctx.session.greetingId = greetingId;

  await ctx.deleteMessage(ctx.msg.message_id);
  await ctx.scene.enter(SceneNames.GREETING_DETAILS_SCENE);
});

botGreetingsScene.action("add_greeting", async (ctx) => {
  await ctx.deleteMessage(ctx.msg.message_id);
  await ctx.scene.enter(SceneNames.CREATE_GREETING_SCENE);
});