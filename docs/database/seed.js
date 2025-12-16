import { PrismaClient, UserRole, PricingMode, SupplementUnit, OfferType, DiscountMode, } from "@prisma/client";
import * as bcrypt from "bcrypt";
const prisma = new PrismaClient();
async function main() {
    console.log("🌱 Start seeding...");
    // 1. Nettoyage (DEV ONLY)
    console.log("🧹 Cleaning database...");
    await prisma.booking.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.supplement.deleteMany();
    await prisma.contractPeriod.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.season.deleteMany();
    await prisma.roomType.deleteMany();
    await prisma.ageCategory.deleteMany();
    await prisma.hotel.deleteMany();
    await prisma.mealPlan.deleteMany();
    await prisma.market.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tourOperator.deleteMany();
    await prisma.currency.deleteMany();
    // 2. Tour Operator
    console.log("👤 Creating Tour Operator...");
    const tourOperator = await prisma.tourOperator.create({
        data: {
            name: "Horizon Travel",
            email: "contact@horizon.com",
            phone: "+33100000000",
        },
    });
    // 3. Users
    console.log("👥 Creating Users...");
    const passwordHash = await bcrypt.hash("password123", 10);
    const adminUser = await prisma.user.create({
        data: {
            email: "admin@horizon.com",
            passwordHash,
            firstName: "Admin",
            lastName: "User",
            role: UserRole.ADMIN,
            tourOperatorId: tourOperator.id,
        },
    });
    const managerUser = await prisma.user.create({
        data: {
            email: "manager@horizon.com",
            passwordHash,
            firstName: "Manager",
            lastName: "Smith",
            role: UserRole.MANAGER,
            tourOperatorId: tourOperator.id,
        },
    });
    const agentUser = await prisma.user.create({
        data: {
            email: "agent@horizon.com",
            passwordHash,
            firstName: "Agent",
            lastName: "Dupont",
            role: UserRole.AGENT,
            tourOperatorId: tourOperator.id,
        },
    });
    // 4. Currencies
    console.log("💱 Creating Currencies...");
    const currencyEUR = await prisma.currency.create({
        data: { code: "EUR", name: "Euro", symbol: "€" },
    });
    const currencyUSD = await prisma.currency.create({
        data: { code: "USD", name: "US Dollar", symbol: "$" },
    });
    // 5. Markets
    console.log("🌍 Creating Markets...");
    const marketFR = await prisma.market.create({
        data: { code: "FR", name: "France", tourOperatorId: tourOperator.id },
    });
    const marketUK = await prisma.market.create({
        data: {
            code: "UK",
            name: "United Kingdom",
            tourOperatorId: tourOperator.id,
        },
    });
    // 6. Meal Plans
    console.log("🍽️ Creating Meal Plans...");
    const mpBB = await prisma.mealPlan.create({
        data: {
            code: "BB",
            name: "Bed & Breakfast",
            description: "Chambre + Petit-déjeuner",
            tourOperatorId: tourOperator.id,
        },
    });
    const mpHB = await prisma.mealPlan.create({
        data: {
            code: "HB",
            name: "Half Board",
            description: "Chambre + Petit-déjeuner + Dîner",
            tourOperatorId: tourOperator.id,
        },
    });
    const mpFB = await prisma.mealPlan.create({
        data: {
            code: "FB",
            name: "Full Board",
            description: "Chambre + 3 repas",
            tourOperatorId: tourOperator.id,
        },
    });
    // 7. Seasons
    console.log("📅 Creating Seasons...");
    const seasonWinterHigh = await prisma.season.create({
        data: {
            name: "Winter High Season",
            startDate: new Date("2024-12-20"),
            endDate: new Date("2025-01-05"),
            tourOperatorId: tourOperator.id,
        },
    });
    const seasonWinterLow = await prisma.season.create({
        data: {
            name: "Winter Low Season",
            startDate: new Date("2025-01-06"),
            endDate: new Date("2025-03-31"),
            tourOperatorId: tourOperator.id,
        },
    });
    const seasonSummer = await prisma.season.create({
        data: {
            name: "Summer Season",
            startDate: new Date("2025-07-01"),
            endDate: new Date("2025-08-31"),
            tourOperatorId: tourOperator.id,
        },
    });
    // 8. Hotels
    console.log("🏨 Creating Hotels...");
    const hotelParis = await prisma.hotel.create({
        data: {
            code: "PAR01",
            name: "Grand Hotel Paris",
            city: "Paris",
            country: "France",
            region: "Île-de-France",
            destination: "Paris City Center",
            address: "1 Place Vendôme, 75001 Paris",
            email: "contact@grandhotelparis.fr",
            phone: "+33140000000",
            tourOperatorId: tourOperator.id,
        },
    });
    const hotelNice = await prisma.hotel.create({
        data: {
            code: "NIC01",
            name: "Hotel Negresco",
            city: "Nice",
            country: "France",
            region: "Provence-Alpes-Côte d'Azur",
            destination: "French Riviera",
            address: "37 Promenade des Anglais, 06000 Nice",
            email: "contact@negresco.com",
            phone: "+33493000000",
            tourOperatorId: tourOperator.id,
        },
    });
    // 9. Age Categories (Hotel Paris)
    console.log("👶 Creating Age Categories...");
    const ageCatInfantParis = await prisma.ageCategory.create({
        data: { name: "Infant", minAge: 0, maxAge: 2, hotelId: hotelParis.id },
    });
    const ageCatChildParis = await prisma.ageCategory.create({
        data: { name: "Child", minAge: 3, maxAge: 11, hotelId: hotelParis.id },
    });
    const ageCatAdultParis = await prisma.ageCategory.create({
        data: { name: "Adult", minAge: 12, maxAge: 99, hotelId: hotelParis.id },
    });
    // Age Categories (Hotel Nice)
    const ageCatInfantNice = await prisma.ageCategory.create({
        data: { name: "Infant", minAge: 0, maxAge: 1, hotelId: hotelNice.id },
    });
    const ageCatChildNice = await prisma.ageCategory.create({
        data: { name: "Child", minAge: 2, maxAge: 12, hotelId: hotelNice.id },
    });
    const ageCatAdultNice = await prisma.ageCategory.create({
        data: { name: "Adult", minAge: 13, maxAge: 99, hotelId: hotelNice.id },
    });
    // 10. Room Types (Hotel Paris)
    console.log("🛏️ Creating Room Types...");
    const roomStandardParis = await prisma.roomType.create({
        data: {
            code: "STD",
            name: "Standard Room",
            maxAdults: 2,
            maxChildren: 1,
            description: "Chambre standard avec lit double",
            hotelId: hotelParis.id,
        },
    });
    const roomSuiteParis = await prisma.roomType.create({
        data: {
            code: "SUITE",
            name: "Suite",
            maxAdults: 2,
            maxChildren: 2,
            description: "Suite spacieuse avec salon",
            hotelId: hotelParis.id,
        },
    });
    // Room Types (Hotel Nice)
    const roomDoubleNice = await prisma.roomType.create({
        data: {
            code: "DBL",
            name: "Double Room",
            maxAdults: 2,
            maxChildren: 0,
            description: "Chambre double vue mer",
            hotelId: hotelNice.id,
        },
    });
    // 11. Contract (Hotel Paris - Winter 2025)
    console.log("📋 Creating Contracts...");
    const contractParisWinter = await prisma.contract.create({
        data: {
            name: "Hotel Paris - Winter 2025",
            hotelId: hotelParis.id,
            marketId: marketFR.id,
            currencyId: currencyEUR.id,
            tourOperatorId: tourOperator.id,
        },
    });
    // 12. Contract Periods (avec seasonId obligatoire)
    console.log("📆 Creating Contract Periods...");
    // Période Winter High Season
    const periodWinterHigh = await prisma.contractPeriod.create({
        data: {
            name: "Winter High Season",
            startDate: new Date("2024-12-20"),
            endDate: new Date("2025-01-05"),
            baseMealPlanId: mpBB.id,
            minStay: 3,
            seasonId: seasonWinterHigh.id, // Obligatoire
            contractId: contractParisWinter.id,
        },
    });
    // Période Winter Low Season
    const periodWinterLow = await prisma.contractPeriod.create({
        data: {
            name: "Winter Low Season",
            startDate: new Date("2025-01-06"),
            endDate: new Date("2025-03-31"),
            baseMealPlanId: mpBB.id,
            minStay: 1,
            seasonId: seasonWinterLow.id, // Obligatoire
            contractId: contractParisWinter.id,
        },
    });
    // 13. Room Prices (PER_ROOM pour Standard)
    console.log("💰 Creating Room Prices...");
    // Standard Room - Winter High (PER_ROOM)
    await prisma.roomPrice.create({
        data: {
            pricingMode: PricingMode.PER_ROOM,
            pricePerNight: 200.0,
            roomTypeId: roomStandardParis.id,
            contractPeriodId: periodWinterHigh.id,
        },
    });
    // Standard Room - Winter Low (PER_ROOM)
    await prisma.roomPrice.create({
        data: {
            pricingMode: PricingMode.PER_ROOM,
            pricePerNight: 150.0,
            roomTypeId: roomStandardParis.id,
            contractPeriodId: periodWinterLow.id,
        },
    });
    // Suite - Winter High (PER_OCCUPANCY)
    const suiteHighPrice = await prisma.roomPrice.create({
        data: {
            pricingMode: PricingMode.PER_OCCUPANCY,
            roomTypeId: roomSuiteParis.id,
            contractPeriodId: periodWinterHigh.id,
        },
    });
    // OccupancyRates pour Suite Winter High
    await prisma.occupancyRate.createMany({
        data: [
            {
                numAdults: 1,
                numChildren: 0,
                ratesPerAge: JSON.stringify({
                    [ageCatAdultParis.id]: { rate: 120, order: 1 },
                }),
                totalRate: 120,
                roomPriceId: suiteHighPrice.id,
            },
            {
                numAdults: 2,
                numChildren: 0,
                ratesPerAge: JSON.stringify({
                    [ageCatAdultParis.id]: { rate: 90, order: 1, label: "1er adulte" },
                    [ageCatAdultParis.id]: { rate: 90, order: 2, label: "2ème adulte" },
                }),
                totalRate: 180,
                roomPriceId: suiteHighPrice.id,
            },
            {
                numAdults: 2,
                numChildren: 1,
                ratesPerAge: JSON.stringify({
                    [ageCatAdultParis.id]: { rate: 90, order: 1 },
                    [ageCatAdultParis.id]: { rate: 90, order: 2 },
                    [ageCatChildParis.id]: {
                        rate: 0,
                        order: 1,
                        label: "1er enfant gratuit",
                    },
                }),
                totalRate: 180,
                roomPriceId: suiteHighPrice.id,
            },
            {
                numAdults: 2,
                numChildren: 2,
                ratesPerAge: JSON.stringify({
                    [ageCatAdultParis.id]: { rate: 90, order: 1 },
                    [ageCatAdultParis.id]: { rate: 90, order: 2 },
                    [ageCatChildParis.id]: { rate: 0, order: 1 },
                    [ageCatChildParis.id]: {
                        rate: 40,
                        order: 2,
                        label: "2ème enfant payant",
                    },
                }),
                totalRate: 220,
                roomPriceId: suiteHighPrice.id,
            },
        ],
    });
    // 14. Meal Plan Supplements
    console.log("🍽️ Creating Meal Plan Supplements...");
    await prisma.mealPlanSupplement.createMany({
        data: [
            {
                mealPlanId: mpHB.id,
                contractPeriodId: periodWinterHigh.id,
                occupancyRates: JSON.stringify({
                    "1-0": 20, // Single
                    "2-0": 40, // Double
                    "2-1": 50, // Double + 1 enfant
                    "2-2": 60, // Double + 2 enfants
                }),
            },
            {
                mealPlanId: mpFB.id,
                contractPeriodId: periodWinterHigh.id,
                occupancyRates: JSON.stringify({
                    "1-0": 40,
                    "2-0": 80,
                    "2-1": 95,
                    "2-2": 110,
                }),
            },
        ],
    });
    // 15. Offers
    console.log("🎁 Creating Offers...");
    const offerEarlyBooking = await prisma.offer.create({
        data: {
            name: "Early Booking -10%",
            description: "Réservez 30 jours à l'avance",
            type: OfferType.PERCENTAGE,
            value: 10,
            discountMode: DiscountMode.SEQUENTIAL,
            applyToRoomOnly: false,
            applyToMealSupplements: true,
            minStay: 3,
            tourOperatorId: tourOperator.id,
            offerPeriods: {
                create: {
                    startDate: new Date("2024-12-01"),
                    endDate: new Date("2025-01-31"),
                },
            },
        },
    });
    const offerLongStay = await prisma.offer.create({
        data: {
            name: "Long Stay -5%",
            description: "À partir de 7 nuits",
            type: OfferType.PERCENTAGE,
            value: 5,
            discountMode: DiscountMode.SEQUENTIAL,
            applyToRoomOnly: false,
            applyToMealSupplements: true,
            minStay: 7,
            tourOperatorId: tourOperator.id,
            offerPeriods: {
                create: {
                    startDate: new Date("2024-11-01"),
                    endDate: new Date("2025-03-31"),
                },
            },
        },
    });
    const offerLastMinute = await prisma.offer.create({
        data: {
            name: "Last Minute -15%",
            description: "Réservation moins de 7 jours avant",
            type: OfferType.PERCENTAGE,
            value: 15,
            discountMode: DiscountMode.ADDITIVE,
            applyToRoomOnly: true,
            applyToMealSupplements: false,
            minStay: 1,
            tourOperatorId: tourOperator.id,
            offerPeriods: {
                create: {
                    startDate: new Date("2024-12-15"),
                    endDate: new Date("2024-12-20"),
                },
            },
        },
    });
    // 16. Supplements
    console.log("➕ Creating Supplements...");
    const suppTransfer = await prisma.supplement.create({
        data: {
            name: "Transfert aéroport",
            description: "Transfert aller-retour aéroport-hôtel",
            price: 50,
            unit: SupplementUnit.PER_PERSON_PER_STAY,
            canReceiveDiscount: true,
            tourOperatorId: tourOperator.id,
        },
    });
    const suppExcursion = await prisma.supplement.create({
        data: {
            name: "Excursion ville",
            description: "Visite guidée de Paris (4h)",
            price: 80,
            unit: SupplementUnit.PER_PERSON_PER_STAY,
            canReceiveDiscount: true,
            tourOperatorId: tourOperator.id,
        },
    });
    const suppSeaView = await prisma.supplement.create({
        data: {
            name: "Upgrade vue mer",
            description: "Surclassement chambre vue mer",
            price: 30,
            unit: SupplementUnit.PER_ROOM_PER_NIGHT,
            canReceiveDiscount: false,
            tourOperatorId: tourOperator.id,
        },
    });
    const suppRomanticPack = await prisma.supplement.create({
        data: {
            name: "Pack romantique",
            description: "Champagne + fleurs + chocolats",
            price: 100,
            unit: SupplementUnit.PER_ROOM_PER_STAY,
            canReceiveDiscount: false,
            tourOperatorId: tourOperator.id,
        },
    });
    // 17. Link Offers to Supplements
    console.log("🔗 Linking Offers to Supplements...");
    await prisma.offerSupplement.createMany({
        data: [
            {
                offerId: offerEarlyBooking.id,
                supplementId: suppTransfer.id,
                applyDiscount: true,
            },
            {
                offerId: offerEarlyBooking.id,
                supplementId: suppExcursion.id,
                applyDiscount: true,
            },
            {
                offerId: offerLongStay.id,
                supplementId: suppTransfer.id,
                applyDiscount: true,
            },
        ],
    });
    console.log("✅ Seeding finished successfully!");
    console.log("");
    console.log("📊 Summary:");
    console.log("  • Tour Operator: Horizon Travel");
    console.log("  • Users: 3 (Admin, Manager, Agent)");
    console.log("  • Hotels: 2 (Paris, Nice)");
    console.log("  • Seasons: 3");
    console.log("  • Contracts: 1");
    console.log("  • Offers: 3");
    console.log("  • Supplements: 4");
    console.log("");
    console.log("🔑 Test Credentials:");
    console.log("  Admin:   admin@horizon.com / password123");
    console.log("  Manager: manager@horizon.com / password123");
    console.log("  Agent:   agent@horizon.com / password123");
}
main()
    .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map