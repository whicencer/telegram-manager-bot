/*
  Warnings:

  - You are about to drop the column `greetingAutoDelete` on the `greetings` table. All the data in the column will be lost.
  - You are about to drop the column `greetingAutoDeleteEnabled` on the `greetings` table. All the data in the column will be lost.
  - You are about to drop the column `greetingDelay` on the `greetings` table. All the data in the column will be lost.
  - You are about to drop the column `greetingText` on the `greetings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "greetings" DROP COLUMN "greetingAutoDelete",
DROP COLUMN "greetingAutoDeleteEnabled",
DROP COLUMN "greetingDelay",
DROP COLUMN "greetingText",
ADD COLUMN     "autoDeleteDelay" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "delay" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isAutoDeleteEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "text" TEXT NOT NULL DEFAULT 'Hello!';
