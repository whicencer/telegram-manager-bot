-- CreateTable
CREATE TABLE "telegram_users" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "username" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bots" (
    "id" BIGINT NOT NULL,
    "token" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "channels" (
    "id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "botId" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "bot_settings" (
    "id" TEXT NOT NULL,
    "botId" BIGINT NOT NULL,

    CONSTRAINT "bot_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "welcome_message_settings" (
    "id" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    "welcomeMessageText" TEXT NOT NULL DEFAULT 'Welcome to the channel!',
    "welcomeMessageDelay" INTEGER NOT NULL DEFAULT 0,
    "welcomeMessageAutoDeleteEnabled" BOOLEAN NOT NULL DEFAULT false,
    "welcomeMessageAutoDelete" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "welcome_message_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_users_telegramId_key" ON "telegram_users"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_users_username_key" ON "telegram_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "bots_id_key" ON "bots"("id");

-- CreateIndex
CREATE UNIQUE INDEX "bots_token_key" ON "bots"("token");

-- CreateIndex
CREATE UNIQUE INDEX "bots_username_key" ON "bots"("username");

-- CreateIndex
CREATE UNIQUE INDEX "channels_id_key" ON "channels"("id");

-- CreateIndex
CREATE UNIQUE INDEX "bot_settings_botId_key" ON "bot_settings"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "welcome_message_settings_settingsId_key" ON "welcome_message_settings"("settingsId");

-- AddForeignKey
ALTER TABLE "bots" ADD CONSTRAINT "bots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "telegram_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_botId_fkey" FOREIGN KEY ("botId") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_settings" ADD CONSTRAINT "bot_settings_botId_fkey" FOREIGN KEY ("botId") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcome_message_settings" ADD CONSTRAINT "welcome_message_settings_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "bot_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
