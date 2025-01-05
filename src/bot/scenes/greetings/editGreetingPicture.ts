import { SceneNames } from "constants/Scenes";
import { Scene } from "../scene";
import { prisma } from "database/client";
import { imgurApi } from "services/imgurApi";
import { checkGreetingId } from "middleware/checkGreetingId";

export const editGreetingPictureScene = new Scene(SceneNames.EDIT_GREETING_PICTURE_SCENE);

editGreetingPictureScene.enter(checkGreetingId, async (ctx) => {
  await ctx.reply("Отправьте новое изображение для приветствия");
});

editGreetingPictureScene.on("photo", async (ctx) => {
  // @ts-ignore
  const { greetingId } = ctx.scene.state;

  const photo = ctx.msg.photo[ctx.msg.photo.length - 1];
  const photoId = photo.file_id;
  const { file_path } = await ctx.telegram.getFile(photoId);

  const imageUrl = await imgurApi.uploadImage(`https://api.telegram.org/file/bot${process.env.MAIN_BOT_TOKEN}/${file_path}`);

  await prisma.greetings.update({
    where: { id: greetingId },
    data: { imageUrl }
  });

  await ctx.reply("Изображение успешно обновлено");
});