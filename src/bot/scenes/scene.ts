import { SceneNames } from "constants/Scenes";
import { BaseScene } from "telegraf/scenes";
import { IBotContext } from "types/IBotContext";
import { deleteMessages } from "utils/deleteMessages";

export class Scene extends BaseScene<IBotContext> {
  constructor(sceneName: string) {
    super(sceneName);
  }
}

export class SceneWithBack extends BaseScene<IBotContext> {
  constructor(sceneName: string, sceneToEnterAfterBack: SceneNames) {
    super(sceneName);
    this.action("back", async (ctx) => {
      // @ts-ignore
      await deleteMessages(ctx, [ctx.msg?.message_id, ctx.scene.state?.msgId, ctx.scene.state?.msgWithPhotoId]);
      await ctx.scene.enter(sceneToEnterAfterBack);
    });
  }
}