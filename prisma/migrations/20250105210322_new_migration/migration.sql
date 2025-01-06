/*
  Warnings:

  - You are about to drop the column `delay` on the `greetings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bots" ADD COLUMN     "isAutoApproveEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "greetings" DROP COLUMN "delay",
ADD COLUMN     "delayInSeconds" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "greeting_buttons" (
    "id" TEXT NOT NULL,
    "greetingId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "greeting_buttons_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "greeting_buttons" ADD CONSTRAINT "greeting_buttons_greetingId_fkey" FOREIGN KEY ("greetingId") REFERENCES "greetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
