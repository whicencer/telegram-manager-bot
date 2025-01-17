import { SceneNames } from "constants/Scenes";
import { SceneWithBack } from "../scene";
import { prisma } from "database/client";
import { Actions } from "constants/Actions";
import { deleteMessages } from "utils/deleteMessages";

export const farewellDetailsScene = new SceneWithBack(
  SceneNames.FAREWELL_DETAILS_SCENE,
  SceneNames.BOT_FAREWELLS_SCENE
);

farewellDetailsScene.enter(async (ctx) => {
  // @ts-ignore
  const farewellId = ctx.session.farewellId;

  const currentFarewell = await prisma.leavings.findUnique({
    where: { id: farewellId },
    include: {
      buttons: true,
      entities: true
    }
  });

  await ctx.reply("🫂 Настройка прощания", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📝 Изменить текст", callback_data: "edit" }],
        [{ text: "🆙 Добавить кнопку", callback_data: "add_button" }],
        [{ text: "❌ Удалить все кнопки", callback_data: "delete_buttons" }],
        [{ text: "🗑️ Удалить прощание", callback_data: "delete_farewell" }],
        [{ text: "⬅️ Назад", callback_data: Actions.BACK }]
      ]
    }
  });

  const msg = await ctx.reply(`${currentFarewell?.text}`, {
    reply_markup: {
      inline_keyboard: [
        ...(currentFarewell?.buttons?.map(button => [{ text: button.text, url: button.url }]) || [])
      ]
    },
    entities: currentFarewell?.entities as any,
    link_preview_options: { is_disabled: true }
  });

  // @ts-ignore
  ctx.scene.state.msgId = msg.message_id;
});

farewellDetailsScene.action("delete_farewell", async (ctx) => {
  // @ts-ignore
  const farewellId = ctx.session.farewellId;

  await prisma.leavings.delete({ where: { id: farewellId } });
  // @ts-ignore
  await deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId]);
  await ctx.reply("Прощание успешно удалено");
  await ctx.scene.enter(SceneNames.BOT_FAREWELLS_SCENE);
});

farewellDetailsScene.action("edit", async (ctx) => {
  // @ts-ignore
  await deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state.msgId]);
  await ctx.scene.enter(SceneNames.EDIT_FAREWELL_TEXT_SCENE);
});

farewellDetailsScene.action("add_button", async (ctx) => {
  // @ts-ignore
  await deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state.msgId]);
  await ctx.scene.enter(SceneNames.FAREWELL_ADD_BUTTON_SCENE);
});

farewellDetailsScene.action("delete_buttons", async (ctx) => {
  // @ts-ignore
  const farewellId = ctx.session.farewellId;

  await prisma.button.deleteMany({ where: { leavingId: farewellId } });

  // @ts-ignore
  deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId]);
  await ctx.reply("Кнопки успешно удалены");
  await ctx.scene.reenter();
});