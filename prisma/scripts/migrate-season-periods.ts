import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const seasons = await prisma.season.findMany();

  for (const season of seasons) {
    await prisma.seasonPeriod.create({
      data: {
        seasonId: season.id,
        name: 'Période principale',
        startDate: season.startDate,
        endDate: season.endDate,
      },
    });
  }

  console.log(`Migrated ${seasons.length} seasons → season periods`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
