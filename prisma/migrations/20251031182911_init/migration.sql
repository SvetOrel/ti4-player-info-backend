-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "factions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leagues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "gameDate" TIMESTAMP(3) NOT NULL,
    "isLongGame" BOOLEAN NOT NULL DEFAULT false,
    "winPoints" INTEGER NOT NULL DEFAULT 10,
    "endRound" INTEGER,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_player_factions" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "game_player_factions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_name_key" ON "players"("name");

-- CreateIndex
CREATE UNIQUE INDEX "factions_name_key" ON "factions"("name");

-- CreateIndex
CREATE INDEX "games_leagueId_gameDate_idx" ON "games"("leagueId", "gameDate");

-- CreateIndex
CREATE INDEX "game_player_factions_gameId_idx" ON "game_player_factions"("gameId");

-- CreateIndex
CREATE INDEX "game_player_factions_playerId_idx" ON "game_player_factions"("playerId");

-- CreateIndex
CREATE INDEX "game_player_factions_factionId_idx" ON "game_player_factions"("factionId");

-- CreateIndex
CREATE UNIQUE INDEX "game_player_factions_gameId_playerId_key" ON "game_player_factions"("gameId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "game_player_factions_gameId_factionId_key" ON "game_player_factions"("gameId", "factionId");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_player_factions" ADD CONSTRAINT "game_player_factions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_player_factions" ADD CONSTRAINT "game_player_factions_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_player_factions" ADD CONSTRAINT "game_player_factions_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "factions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
