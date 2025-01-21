import { SceneWithBack } from "bot/scenes/scene";
import { Actions } from "constants/Actions";
import { SceneNames } from "constants/Scenes";
import { prisma } from "database/client";
import { TelegramAPI } from "services/telegramApi";
import { deleteMessages } from "utils/deleteMessages";

export const postSettingsScene = new SceneWithBack(
  SceneNames.CHANNEL_PUBLISH_POST_SETTINGS_SCENE,
  SceneNames.CHANNEL_DETAILS_SCENE
);

postSettingsScene.enter(async (ctx) => {
  // @ts-ignore
  const { text, entities, buttonText, buttonUrl, delay } = ctx.scene.state;

  if (!text) {
    await ctx.reply("Текст поста не может быть пустым.");
    return ctx.scene.enter(SceneNames.CHANNEL_PUBLISH_POST_SCENE);
  }

  await ctx.reply("⚙️ Настройки поста", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📢 Опубликовать", callback_data: "publish" }],
        [{ text: "📝 Изменить текст", callback_data: "change_text" }],
        [{ text: "⌛️ Добавить задержку", callback_data: "add_delay" }],
        [{ text: "➕ Добавить кнопку", callback_data: "add_button" }],
        [{ text: "❌ Удалить все кнопки", callback_data: "remove_buttons" }],
        [{ text: "⬅️ Назад", callback_data: Actions.BACK }]
      ]
    }
  });

  const msg = await ctx.reply(`${text}\nЗадержка: ${delay || 0} сек.`, {
    entities,
    reply_markup: {
      inline_keyboard: buttonText && buttonUrl ? [
        [{ text: buttonText, url: buttonUrl }]
      ] : []
    }
  });

  // @ts-ignore
  ctx.scene.state.msgId = msg.message_id;
});

postSettingsScene.action("change_text", async (ctx) => {
  // @ts-ignore
  await deleteMessages(ctx, [ctx.scene.state.msgId, ctx.callbackQuery.message?.message_id]);
  await ctx.scene.enter(SceneNames.CHANNEL_PUBLISH_POST_SCENE);
});

postSettingsScene.action("add_delay", async (ctx) => {
  const message = 'Отправьте задержку в секундах';
  // @ts-ignore
  await deleteMessages(ctx, [ctx.scene.state.msgId, ctx.callbackQuery.message?.message_id]);
  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [[{ text: "⬅️ Назад", callback_data: "cancel_action" }]]
    }
  });

  // @ts-ignore
  ctx.scene.state.awaitingDelay = true;
});

postSettingsScene.action("add_button", async (ctx) => {
  const message = 'Отправьте текст кнопки и URL в формате:\n<code>Button Text\nhttps://buttonurl.com</code>';
  // @ts-ignore
  await deleteMessages(ctx, [ctx.scene.state.msgId, ctx.callbackQuery.message?.message_id]);
  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [[{ text: "⬅️ Назад", callback_data: "cancel_action" }]]
    },
    parse_mode: 'HTML'
  });

  // @ts-ignore
  ctx.scene.state.awaitingButtonText = true;
});

postSettingsScene.on("text", async (ctx) => {
  // @ts-ignore
  if (ctx.scene.state.awaitingButtonText) {
    // @ts-ignore
    const [buttonText, buttonUrl] = ctx.message.text.split('\n');
    // @ts-ignore
    ctx.scene.state.buttonText = buttonText;
    // @ts-ignore
    ctx.scene.state.buttonUrl = buttonUrl;
    // @ts-ignore
    ctx.scene.state.awaitingButtonText = false;
  // @ts-ignore
  } else if (ctx.scene.state.awaitingDelay) {
    // @ts-ignore
    ctx.scene.state.delay = parseInt(ctx.message.text);
    // @ts-ignore
    ctx.scene.state.awaitingDelay = false;
  }

  await ctx.scene.reenter();
});

postSettingsScene.action("remove_buttons", async (ctx) => {
  // @ts-ignore
  ctx.scene.state.buttonText = null;
  // @ts-ignore
  ctx.scene.state.buttonUrl = null;

  // @ts-ignore
  await deleteMessages(ctx, [ctx.scene.state.msgId, ctx.callbackQuery.message?.message_id]);
  await ctx.scene.reenter();
});

postSettingsScene.action("publish", async (ctx) => {
  // @ts-ignore
  const channelId = ctx.session.channelId;
  // @ts-ignore
  const botId = ctx.session.botId;
  // @ts-ignore
  const { text, entities, buttonText, buttonUrl, delay } = ctx.scene.state;

  const bot = await prisma.bot.findUnique({ where: { id: botId } });
  if (!bot) {
    await ctx.reply('Бот не найден');
    return ctx.scene.enter(SceneNames.CHANNEL_DETAILS_SCENE);
  }

  try {
    const api = new TelegramAPI(bot.token);
    await api.sendMessage(channelId, text, {
      entities: entities,
      reply_markup: {
        inline_keyboard: buttonText && buttonUrl ? [
          [{ text: buttonText, url: buttonUrl }]
        ] : []
      },
      disable_web_page_preview: true,
    });

    // @ts-ignore
    await deleteMessages(ctx, [ctx.scene.state.msgId, ctx.callbackQuery.message?.message_id]);
    await ctx.reply('Пост успешно опубликован!');
  } catch (error) {
    await ctx.reply('Ошибка при отправке сообщения');
    console.error('Error while sending message', error);
  } finally {
    await ctx.scene.enter(SceneNames.CHANNEL_DETAILS_SCENE);
  }
});

postSettingsScene.action("cancel_action", async (ctx) => {
  // @ts-ignore
  await deleteMessages(ctx, [ctx.scene.state.msgId, ctx.callbackQuery.message?.message_id]);
  await ctx.scene.reenter();
});