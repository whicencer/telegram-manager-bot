import { prisma } from "database/client";
import { IBotContext } from "types/IBotContext";

export async function hasAdminPermission(ctx: IBotContext, next: () => void) {
  const user = await prisma.telegramUser.findUnique({ where: { telegramId: ctx.from?.id } });

  if (!user?.isAdministrator) {
    return ctx.reply('У вас нет прав для выполнения этой команды');
  }

  next();
}