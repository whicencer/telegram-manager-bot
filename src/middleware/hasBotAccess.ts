import { prisma } from "database/client";
import { IBotContext } from "types/IBotContext";

export const hasBotAccess = async (ctx: IBotContext, next: () => void) => {
  const user = await prisma.telegramUser.findUnique({ where: { telegramId: ctx.from?.id } });

  if (user && user.isAdministrator || user?.hasAccessToBot) {
    next();
    return;
  }
  
  await ctx.reply("У вас нет доступа к боту. Для получения доступа обратитесь к @bybitsignals_0");
}