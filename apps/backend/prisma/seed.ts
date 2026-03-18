import { PrismaClient, UserRole } from '@backend/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('Password1234!', 10);

  for (const u of [
    {
      email: 'admin@runner.com',
      firstName: 'Admin',
      lastName: 'Runner',
      role: UserRole.ADMIN,
    },
    {
      email: 'manager@runner.com',
      firstName: 'Marie',
      lastName: 'Manager',
      role: UserRole.MANAGER,
    },
    {
      email: 'agent@runner.com',
      firstName: 'Jean',
      lastName: 'Agent',
      role: UserRole.AGENT,
    },
  ]) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...u,
        passwordHash: hashedPassword,
        tourOperatorId: 'default-operator',
      },
    });
  }

  console.log('✅ Seeding done !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
