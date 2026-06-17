import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const seasons = await prisma.season.findMany();

  for (const season of seasons) {
    await prisma.seasonPeriod.create({
      data: {
        seasonId: season.id,
        name: 'Période principale',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      },
    });
  }

  console.log(`Migrated ${seasons.length} seasons → season periods`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
