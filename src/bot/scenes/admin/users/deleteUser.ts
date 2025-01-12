import { SceneWithBack } from "bot/scenes/scene";
import { Actions } from "constants/Actions";
import { SceneNames } from "constants/Scenes";
import { prisma } from "database/client";

export const deleteUserScene = new SceneWithBack(
  SceneNames.ADMIN_DELETE_USER_SCENE,
  SceneNames.ADMIN_MANAGE_USERS_SCENE
);

deleteUserScene.enter(async (ctx) => {
  await ctx.reply('Введите ID или юзернейм (через @) пользователя, которого хотите удалить', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '⬅️ Назад', callback_data: Actions.BACK }]
      ]
    }
  });
});

deleteUserScene.on('text', async (ctx) => {
  const text = ctx.message.text.trim();

  const isId = /^\d+$/.test(text);
  const isUsername = /^@\S+$/.test(text);

  if (!isId && !isUsername) {
    await ctx.reply('Введите корректный ID или юзернейм пользователя');
    return;
  }

  try {
    const user = await prisma.telegramUser.findUnique({
      where: isId ? { telegramId: parseInt(text) } : { username: text.replace('@', '') }
    });
    
    if (!user) {
      await ctx.reply('Пользователь не найден');
      await ctx.scene.reenter();
      return;
    }

    await prisma.telegramUser.update({
      where: { telegramId: user.telegramId },
      data: { hasAccessToBot: false }
    });

    await ctx.reply(`Пользователь удален. Теперь он не сможет пользоваться ботом`);
    await ctx.scene.enter(SceneNames.ADMIN_MANAGE_USERS_SCENE);
  } catch (error) {
    console.error("Ошибка при удалении пользователя из бота", error);
    await ctx.reply('Произошла ошибка при удалении пользователя');
  }
});