import { IBotContext } from "types/IBotContext";

export async function deleteMessages(ctx: IBotContext, messages: number[]) {
  const messagesToDelete = messages.filter(id => id !== null && id !== undefined);

  if (messagesToDelete.length > 0) {
    for (const messageId of messagesToDelete) {
      try {
        await ctx.deleteMessage(messageId);
      } catch (error) {
        console.error(`Error deleting message with ID ${messageId}:`, error);
      }
    }
  }
}