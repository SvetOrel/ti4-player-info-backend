import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    await prisma.gamePlayerFaction.deleteMany();
    await prisma.game.deleteMany();
    await prisma.league.deleteMany();
    await prisma.player.deleteMany();
    await prisma.faction.deleteMany();
    console.log('Database has been seeded. All data cleared.');
    const [p1, p2] = await prisma.$transaction([
        prisma.player.create({ data: { name: 'Pasha' } }),
        prisma.player.create({ data: { name: 'Sveta' } }),
    ]);
    const [f1, f2] = await prisma.$transaction([
        prisma.faction.create({ data: { name: 'Federation of Sol' } }),
        prisma.faction.create({ data: { name: 'Emirates of Hacan' } }),
    ]);
    console.log('Seeded players and factions:', { players: [p1, p2], factions: [f1, f2] });
    const league = await prisma.league.create({
        data: {
            name: 'Winter League',
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        },
    });
    console.log('Created league:', league);
    const game1 = await prisma.game.create({
        data: {
            leagueId: league.id,
            gameDate: new Date('2025-11-01T18:00:00Z'),
            isLongGame: false,
            winPoints: 10,
        },
    });
    const game2 = await prisma.game.create({
        data: {
            leagueId: league.id,
            gameDate: new Date('2025-11-07T18:00:00Z'),
            isLongGame: true,
            winPoints: 14,
        },
    });
    await prisma.gamePlayerFaction.createMany({
        data: [
            { gameId: game1.id, playerId: p1.id, factionId: f1.id, points: 8 },
            { gameId: game1.id, playerId: p2.id, factionId: f2.id, points: 10 },
            { gameId: game2.id, playerId: p1.id, factionId: f2.id, points: 14 },
            { gameId: game2.id, playerId: p2.id, factionId: f1.id, points: 12 },
        ],
    });
    console.log('Seeded games with player factions.');
}
main().finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map