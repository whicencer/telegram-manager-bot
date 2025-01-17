-- CreateTable
CREATE TABLE "telegram_users" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "username" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hasAccessToBot" BOOLEAN NOT NULL DEFAULT false,
    "isAdministrator" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "telegram_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bots" (
    "id" BIGINT NOT NULL,
    "token" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isAutoApproveEnabled" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "channels" (
    "id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "botId" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "entities" (
    "id" TEXT NOT NULL,
    "greetingId" TEXT,
    "leavingId" TEXT,
    "offset" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buttons" (
    "id" TEXT NOT NULL,
    "greetingId" TEXT,
    "leavingId" TEXT,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "buttons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "greetings" (
    "id" TEXT NOT NULL,
    "botId" BIGINT NOT NULL,
    "text" TEXT NOT NULL DEFAULT 'Hello!',
    "delayInSeconds" INTEGER NOT NULL DEFAULT 0,
    "isAutoDeleteEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoDeleteDelay" INTEGER NOT NULL DEFAULT 5,
    "imageUrl" TEXT,

    CONSTRAINT "greetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leavings" (
    "id" TEXT NOT NULL,
    "botId" BIGINT NOT NULL,
    "text" TEXT NOT NULL DEFAULT 'Hello!',
    "delayInSeconds" INTEGER NOT NULL DEFAULT 0,
    "isAutoDeleteEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoDeleteDelay" INTEGER NOT NULL DEFAULT 5,
    "imageUrl" TEXT,

    CONSTRAINT "leavings_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "bots" ADD CONSTRAINT "bots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "telegram_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_botId_fkey" FOREIGN KEY ("botId") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_greetingId_fkey" FOREIGN KEY ("greetingId") REFERENCES "greetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_leavingId_fkey" FOREIGN KEY ("leavingId") REFERENCES "leavings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buttons" ADD CONSTRAINT "buttons_greetingId_fkey" FOREIGN KEY ("greetingId") REFERENCES "greetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buttons" ADD CONSTRAINT "buttons_leavingId_fkey" FOREIGN KEY ("leavingId") REFERENCES "leavings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "greetings" ADD CONSTRAINT "greetings_botId_fkey" FOREIGN KEY ("botId") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leavings" ADD CONSTRAINT "leavings_botId_fkey" FOREIGN KEY ("botId") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
