import 'module-alias/register';

import { Scenes, session, Telegraf } from "telegraf";
import { prisma } from "database/client";
import { IBotContext } from "types/IBotContext";
import { addNewBotScene } from "./scenes/addNewBot";
import { SceneNames } from "constants/Scenes";
import { myBots } from "./scenes/myBots";
import { deleteBotScene } from './scenes/deleteBot';
import { botDetailsScene } from './scenes/botDetails';
import { botGreetingsScene } from './scenes/greetings/botGreetings';
import { createGreetingScene } from './scenes/greetings/createGreeting';
import { greetindDetailsScene } from './scenes/greetings/greetingDetails';
import { editGreetingPictureScene } from './scenes/greetings/editGreetingPicture';

(() => {

  if (!process.env.MAIN_BOT_TOKEN) {
    throw new Error('MAIN_BOT_TOKEN is not defined in .env file');
  }

  const bot = new Telegraf<IBotContext>(process.env.MAIN_BOT_TOKEN);
  const stage = new Scenes.Stage<IBotContext>([
    addNewBotScene,
    myBots,
    deleteBotScene,
    botDetailsScene,
    botGreetingsScene,
    createGreetingScene,
    greetindDetailsScene,
    editGreetingPictureScene,
  ]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.start(async (ctx) => {
    ctx.reply('Добро пожаловать в Telegram Channels Manager!\nИспользуйте команду /mybots чтобы посмотреть ваших ботов');

    const existingUser = await prisma.telegramUser.findUnique({ where: { telegramId: ctx.from.id } });

    if (existingUser) return;

    try {
      await prisma.telegramUser.create({
        data: {
          telegramId: ctx.from.id,
          username: ctx.from.username,
        }
      });
    } catch (error) {
      console.error(error);
    }
  });
  
  bot.command('mybots', async (ctx) => {
    await ctx.scene.enter(SceneNames.MY_BOTS_SCENE);
  });

  bot.launch(() => {
    console.log("Бот запущен!");
  });

})();