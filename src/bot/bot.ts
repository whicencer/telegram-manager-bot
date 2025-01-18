import 'module-alias/register';

import { Scenes, session, Telegraf } from "telegraf";
import { prisma } from "database/client";
import { IBotContext } from "types/IBotContext";
import { addNewBotScene } from "./scenes/addNewBot";
import { SceneNames } from "constants/Scenes";
import { myBots } from "./scenes/myBots";
import { deleteBotScene } from './scenes/deleteBot';
import { botDetailsScene } from './scenes/botDetails';
import {
  addButtonScene,
  botGreetingsScene,
  createGreetingScene,
  editGreetingPictureScene,
  editGreetingTextScene,
  greetindDetailsScene } from './scenes/greetings';
import {
  botFarewellsScene,
  createFarewellScene,
  editFarewellText,
  farewellAddButtonScene,
  farewellDetailsScene } from './scenes/farewells';
import { hasAdminPermission } from 'middleware/hasAdminPermission';
import { hasBotAccess } from 'middleware/hasBotAccess';
import { addUserScene, controlPanelScene, manageUsersScene } from './scenes/admin';
import { deleteUserScene } from './scenes/admin/users/deleteUser';
import { connectedChannelsScene, channelDetailsScene } from './scenes/channels';
import { postSettingsScene, publishPostScene } from './scenes/channels/posting';

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
    addButtonScene,
    editGreetingTextScene,
    controlPanelScene,
    manageUsersScene,
    addUserScene,
    deleteUserScene,
    botFarewellsScene,
    createFarewellScene,
    farewellDetailsScene,
    editFarewellText,
    farewellAddButtonScene,
    connectedChannelsScene,
    channelDetailsScene,
    publishPostScene,
    postSettingsScene
  ]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.start(async (ctx) => {
    ctx.reply('Добро пожаловать в Telegram Channels Manager!\nИспользуйте команду /mybots чтобы посмотреть ваших ботов');

    const existingUser = await prisma.telegramUser.findUnique({ where: { telegramId: ctx.from.id } });

    if (existingUser) return;

    const isAdministrator = ctx.from.id === parseInt(process.env.ADMIN_TELEGRAM_ID!);

    try {
      await prisma.telegramUser.create({
        data: {
          telegramId: ctx.from.id,
          username: ctx.from.username,
          isAdministrator
        }
      });
    } catch (error) {
      console.error(error);
    }
  });
  
  bot.command('mybots', hasBotAccess, async (ctx) => {
    await ctx.scene.enter(SceneNames.MY_BOTS_SCENE);
  });

  bot.command('admin', hasAdminPermission, async (ctx) => {
    await ctx.scene.enter(SceneNames.ADMIN_CONTROL_PANEL_SCENE);
  });

  bot.launch(() => {
    console.log("Бот запущен!");
  });

})();