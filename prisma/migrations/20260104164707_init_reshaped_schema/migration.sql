/*
  Warnings:

  - You are about to drop the column `endRound` on the `games` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[iconId]` on the table `factions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pictureId]` on the table `players` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "factions" ADD COLUMN     "iconId" TEXT;

-- AlterTable
ALTER TABLE "game_player_factions" ADD COLUMN     "conditionId" TEXT,
ALTER COLUMN "points" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "games" DROP COLUMN "endRound",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "pictureId" TEXT;

-- CreateTable
CREATE TABLE "pictures" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "pictures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icons" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "icons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conditions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "conditions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pictures_url_key" ON "pictures"("url");

-- CreateIndex
CREATE UNIQUE INDEX "icons_url_key" ON "icons"("url");

-- CreateIndex
CREATE UNIQUE INDEX "conditions_name_key" ON "conditions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "factions_iconId_key" ON "factions"("iconId");

-- CreateIndex
CREATE UNIQUE INDEX "players_pictureId_key" ON "players"("pictureId");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_pictureId_fkey" FOREIGN KEY ("pictureId") REFERENCES "pictures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factions" ADD CONSTRAINT "factions_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES "icons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_player_factions" ADD CONSTRAINT "game_player_factions_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "conditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
