import { PrismaClient, UserRole, PricingMode, SupplementUnit, OfferType, DiscountMode } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Nettoyage (Optionnel, attention en prod)
  await prisma.booking.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tourOperator.deleteMany();
  await prisma.currency.deleteMany();
  await prisma.market.deleteMany();

  // 2. Tour Operator
  const tourOperator = await prisma.tourOperator.create({
    data: {
      name: 'Horizon Travel',
      email: 'contact@horizon.com',
      phone: '+33100000000',
    },
  });

  // 3. Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await prisma.user.create({
    data: {
      email: 'admin@horizon.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      tourOperatorId: tourOperator.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'agent@horizon.com',
      passwordHash,
      firstName: 'Agent',
      lastName: 'Smith',
      role: UserRole.AGENT,
      tourOperatorId: tourOperator.id,
    },
  });

  // 4. Markets & Currencies
  const marketFR = await prisma.market.create({
    data: { code: 'FR', name: 'France', tourOperatorId: tourOperator.id },
  });

  const currencyEUR = await prisma.currency.create({
    data: { code: 'EUR', name: 'Euro', symbol: '€' },
  });

  // 5. Meal Plans
  const mpBB = await prisma.mealPlan.create({
    data: { code: 'BB', name: 'Bed & Breakfast', tourOperatorId: tourOperator.id },
  });
  const mpHB = await prisma.mealPlan.create({
    data: { code: 'HB', name: 'Half Board', tourOperatorId: tourOperator.id },
  });

  // 6. Hotel
  const hotel = await prisma.hotel.create({
    data: {
      code: 'PAR01',
      name: 'Grand Hotel Paris',
      city: 'Paris',
      country: 'France',
      tourOperatorId: tourOperator.id,
    },
  });

  // 7. Age Categories
  await prisma.ageCategory.createMany({
    data: [
      { name: 'Infant', minAge: 0, maxAge: 2, hotelId: hotel.id },
      { name: 'Child', minAge: 3, maxAge: 11, hotelId: hotel.id },
      { name: 'Adult', minAge: 12, maxAge: 99, hotelId: hotel.id },
    ],
  });

  // 8. Room Types
  const roomStd = await prisma.roomType.create({
    data: {
      code: 'STD',
      name: 'Standard Room',
      maxAdults: 2,
      maxChildren: 1,
      hotelId: hotel.id,
    },
  });

  // 9. Contract (Complexe !)
  const contract = await prisma.contract.create({
    data: {
      name: 'Winter 2025',
      validFrom: new Date('2025-01-01'),
      validTo: new Date('2025-03-31'),
      hotelId: hotel.id,
      marketId: marketFR.id,
      currencyId: currencyEUR.id,
      tourOperatorId: tourOperator.id,
    },
  });

  // 10. Contract Period & Prices
  const period = await prisma.contractPeriod.create({
    data: {
      name: 'January Promo',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      contractId: contract.id,
      baseMealPlanId: mpBB.id,
    },
  });

  await prisma.roomPrice.create({
    data: {
      pricingMode: PricingMode.PER_ROOM,
      pricePerNight: 100.00,
      roomTypeId: roomStd.id,
      contractPeriodId: period.id,
    },
  });

  // 11. Offer
  await prisma.offer.create({
    data: {
      name: 'Early Booking -10%',
      type: OfferType.PERCENTAGE,
      value: 10,
      discountMode: DiscountMode.COMBINABLE,
      tourOperatorId: tourOperator.id,
      offerPeriods: {
        create: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-03-31'),
        }
      }
    },
  });

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });