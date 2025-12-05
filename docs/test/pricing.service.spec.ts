import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { PrismaService } from '../prisma/prisma.service';
import { PricingMode, DiscountMode, OfferType } from '@prisma/client';

describe('PricingService', () => {
  let service: PricingService;
  let prisma: PrismaService;

  // Mock data
  const mockHotel = {
    id: 'hotel-1',
    name: 'Grand Hotel Paris',
    ageCategories: [
      { id: 'cat-infant', name: 'Infant', minAge: 0, maxAge: 2 },
      { id: 'cat-child', name: 'Child', minAge: 3, maxAge: 11 },
      { id: 'cat-adult', name: 'Adult', minAge: 12, maxAge: 99 },
    ],
  };

  const mockContract = {
    id: 'contract-1',
    hotelId: 'hotel-1',
    hotel: mockHotel,
    periods: [
      {
        id: 'period-1',
        startDate: new Date('2024-12-20'),
        endDate: new Date('2025-01-05'),
        baseMealPlanId: 'meal-bb',
        roomPrices: [],
        mealPlanSupplements: [],
        stopSalesDates: [],
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: PrismaService,
          useValue: {
            contract: {
              findFirst: jest.fn(),
            },
            offer: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Test 1: PER_ROOM Simple', () => {
    it('should calculate price for PER_ROOM mode', async () => {
      // Arrange
      const roomPrice = {
        id: 'rp-1',
        pricingMode: PricingMode.PER_ROOM,
        pricePerNight: 100.00,
        roomTypeId: 'room-standard',
        occupancyRates: [],
      };

      const contractWithRoom = {
        ...mockContract,
        periods: [
          {
            ...mockContract.periods[0],
            roomPrices: [roomPrice],
          },
        ],
      };

      jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue(contractWithRoom as any);
      jest.spyOn(prisma.offer, 'findMany').mockResolvedValue([]);

      const criteria = {
        hotelId: 'hotel-1',
        marketId: 'market-fr',
        checkIn: new Date('2024-12-20'),
        checkOut: new Date('2024-12-23'),
        totalNights: 3,
        rooms: [
          {
            roomTypeId: 'room-standard',
            numAdults: 2,
            numChildren: 0,
            childrenAges: [],
            mealPlanId: 'meal-bb',
          },
        ],
        offerIds: [],
        supplements: [],
      };

      // Act
      const result = await service.calculatePrice(criteria);

      // Assert
      expect(result.roomsSubtotal).toBe(300.00); // 100€ × 3 nuits
      expect(result.discountAmount).toBe(0);
      expect(result.totalAmount).toBe(300.00);
      expect(result.breakdown).toHaveLength(3);
      expect(result.breakdown[0].baseRoomPrice).toBe(100.00);
    });
  });

  describe('Test 2: PER_OCCUPANCY (Single vs Double)', () => {
    it('should calculate different prices for Single and Double occupancy', async () => {
      // Arrange
      const roomPrice = {
        id: 'rp-1',
        pricingMode: PricingMode.PER_OCCUPANCY,
        pricePerNight: null,
        roomTypeId: 'room-suite',
        occupancyRates: [
          {
            numAdults: 1,
            numChildren: 0,
            ratesPerAge: JSON.stringify({
              'cat-adult': { rate: 120, order: 1 },
            }),
            totalRate: 120,
          },
          {
            numAdults: 2,
            numChildren: 0,
            ratesPerAge: JSON.stringify({
              'cat-adult': { rate: 90, order: 1 },
              'cat-adult': { rate: 90, order: 2 },
            }),
            totalRate: 180,
          },
        ],
      };

      const contractWithOccupancy = {
        ...mockContract,
        periods: [
          {
            ...mockContract.periods[0],
            roomPrices: [roomPrice],
          },
        ],
      };

      jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue(contractWithOccupancy as any);
      jest.spyOn(prisma.offer, 'findMany').mockResolvedValue([]);

      // Test Single
      const criteriaSingle = {
        hotelId: 'hotel-1',
        marketId: 'market-fr',
        checkIn: new Date('2024-12-20'),
        checkOut: new Date('2024-12-22'),
        totalNights: 2,
        rooms: [
          {
            roomTypeId: 'room-suite',
            numAdults: 1,
            numChildren: 0,
            childrenAges: [],
            mealPlanId: 'meal-bb',
          },
        ],
        offerIds: [],
        supplements: [],
      };

      const resultSingle = await service.calculatePrice(criteriaSingle);

      // Assert Single
      expect(resultSingle.roomsSubtotal).toBe(240.00); // 120€ × 2 nuits

      // Test Double
      const criteriaDouble = {
        ...criteriaSingle,
        rooms: [
          {
            roomTypeId: 'room-suite',
            numAdults: 2,
            numChildren: 0,
            childrenAges: [],
            mealPlanId: 'meal-bb',
          },
        ],
      };

      const resultDouble = await service.calculatePrice(criteriaDouble);

      // Assert Double
      expect(resultDouble.roomsSubtotal).toBe(360.00); // 180€ × 2 nuits
    });
  });

  describe('Test 3: PER_OCCUPANCY with Free Child', () => {
    it('should apply free child rate correctly', async () => {
      // Arrange
      const roomPrice = {
        id: 'rp-1',
        pricingMode: PricingMode.PER_OCCUPANCY,
        roomTypeId: 'room-suite',
        occupancyRates: [
          {
            numAdults: 2,
            numChildren: 1,
            ratesPerAge: JSON.stringify({
              'cat-adult': { rate: 90, order: 1 },
              'cat-adult': { rate: 90, order: 2 },
              'cat-child': { rate: 0, order: 1 }, // 1er enfant gratuit
            }),
            totalRate: 180,
          },
          {
            numAdults: 2,
            numChildren: 2,
            ratesPerAge: JSON.stringify({
              'cat-adult': { rate: 90, order: 1 },
              'cat-adult': { rate: 90, order: 2 },
              'cat-child': { rate: 0, order: 1 },
              'cat-child': { rate: 40, order: 2 }, // 2ème enfant payant
            }),
            totalRate: 220,
          },
        ],
      };

      const contractWithChildren = {
        ...mockContract,
        periods: [
          {
            ...mockContract.periods[0],
            roomPrices: [roomPrice],
          },
        ],
      };

      jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue(contractWithChildren as any);
      jest.spyOn(prisma.offer, 'findMany').mockResolvedValue([]);

      // Test 1 enfant gratuit
      const criteria1Child = {
        hotelId: 'hotel-1',
        marketId: 'market-fr',
        checkIn: new Date('2024-12-20'),
        checkOut: new Date('2024-12-22'),
        totalNights: 2,
        rooms: [
          {
            roomTypeId: 'room-suite',
            numAdults: 2,
            numChildren: 1,
            childrenAges: [5],
            mealPlanId: 'meal-bb',
          },
        ],
        offerIds: [],
        supplements: [],
      };

      const result1Child = await service.calculatePrice(criteria1Child);
      expect(result1Child.roomsSubtotal).toBe(360.00); // 180€ × 2 nuits

      // Test 2 enfants (2ème payant)
      const criteria2Children = {
        ...criteria1Child,
        rooms: [
          {
            ...criteria1Child.rooms[0],
            numChildren: 2,
            childrenAges: [5, 8],
          },
        ],
      };

      const result2Children = await service.calculatePrice(criteria2Children);
      expect(result2Children.roomsSubtotal).toBe(440.00); // 220€ × 2 nuits
    });
  });

  describe('Test 4: Offres SEQUENTIAL (-10% puis -5%)', () => {
    it('should apply SEQUENTIAL offers correctly', async () => {
      // Arrange
      const roomPrice = {
        id: 'rp-1',
        pricingMode: PricingMode.PER_ROOM,
        pricePerNight: 200.00,
        roomTypeId: 'room-standard',
        occupancyRates: [],
      };

      const contractWithRoom = {
        ...mockContract,
        periods: [
          {
            ...mockContract.periods[0],
            roomPrices: [roomPrice],
          },
        ],
      };

      const offers = [
        {
          id: 'offer-1',
          name: 'Early Booking -10%',
          type: OfferType.PERCENTAGE,
          value: 10,
          discountMode: DiscountMode.SEQUENTIAL,
          offerPeriods: [
            {
              startDate: new Date('2024-12-01'),
              endDate: new Date('2025-01-31'),
            },
          ],
        },
        {
          id: 'offer-2',
          name: 'Long Stay -5%',
          type: OfferType.PERCENTAGE,
          value: 5,
          discountMode: DiscountMode.SEQUENTIAL,
          offerPeriods: [
            {
              startDate: new Date('2024-12-01'),
              endDate: new Date('2025-01-31'),
            },
          ],
        },
      ];

      jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue(contractWithRoom as any);
      jest.spyOn(prisma.offer, 'findMany').mockResolvedValue(offers as any);

      const criteria = {
        hotelId: 'hotel-1',
        marketId: 'market-fr',
        checkIn: new Date('2024-12-20'),
        checkOut: new Date('2024-12-22'),
        totalNights: 2,
        rooms: [
          {
            roomTypeId: 'room-standard',
            numAdults: 2,
            numChildren: 0,
            childrenAges: [],
            mealPlanId: 'meal-bb',
          },
        ],
        offerIds: ['offer-1', 'offer-2'],
        supplements: [],
      };

      // Act
      const result = await service.calculatePrice(criteria);

      // Assert
      // Prix base : 200€
      // Après -10% : 200 × 0.9 = 180€
      // Après -5% : 180 × 0.95 = 171€
      // Pour 2 nuits : 171 × 2 = 342€
      expect(result.breakdown[0].baseRoomPrice).toBe(200.00);
      expect(result.breakdown[0].finalPriceThisNight).toBe(171.00);
      expect(result.roomsSubtotal).toBe(342.00);
      expect(result.discountAmount).toBe(58.00); // (200 - 171) × 2
    });
  });

  describe('Test 5: Offres ADDITIVE (-10% + -5% = -15%)', () => {
    it('should apply ADDITIVE offers correctly', async () => {
      // Arrange
      const roomPrice = {
        id: 'rp-1',
        pricingMode: PricingMode.PER_ROOM,
        pricePerNight: 200.00,
        roomTypeId: 'room-standard',
        occupancyRates: [],
      };

      const contractWithRoom = {
        ...mockContract,
        periods: [
          {
            ...mockContract.periods[0],
            roomPrices: [roomPrice],
          },
        ],
      };

      const offers = [
        {
          id: 'offer-1',
          name: 'Promo A -10%',
          type: OfferType.PERCENTAGE,
          value: 10,
          discountMode: DiscountMode.ADDITIVE,
          offerPeriods: [
            {
              startDate: new Date('2024-12-01'),
              endDate: new Date('2025-01-31'),
            },
          ],
        },
        {
          id: 'offer-2',
          name: 'Promo B -5%',
          type: OfferType.PERCENTAGE,
          value: 5,
          discountMode: DiscountMode.ADDITIVE,
          offerPeriods: [
            {
              startDate: new Date('2024-12-01'),
              endDate: new Date('2025-01-31'),
            },
          ],
        },
      ];

      jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue(contractWithRoom as any);
      jest.spyOn(prisma.offer, 'findMany').mockResolvedValue(offers as any);

      const criteria = {
        hotelId: 'hotel-1',
        marketId: 'market-fr',
        checkIn: new Date('2024-12-20'),
        checkOut: new Date('2024-12-22'),
        totalNights: 2,
        rooms: [
          {
            roomTypeId: 'room-standard',
            numAdults: 2,
            numChildren: 0,
            childrenAges: [],
            mealPlanId: 'meal-bb',
          },
        ],
        offerIds: ['offer-1', 'offer-2'],
        supplements: [],
      };

      // Act
      const result = await service.calculatePrice(criteria);

      // Assert
      // Prix base : 200€
      // Réduction : 10% + 5% = 15%
      // Prix final : 200 × (1 - 0.15) = 170€
      // Pour 2 nuits : 170 × 2 = 340€
      expect(result.breakdown[0].baseRoomPrice).toBe(200.00);
      expect(result.breakdown[0].finalPriceThisNight).toBe(170.00);
      expect(result.roomsSubtotal).toBe(340.00);
      expect(result.discountAmount).toBe(60.00); // (200 - 170) × 2
    });
  });

  describe('Test 6: Offres Partielles (2 nuits sur 5)', () => {
    it('should apply offers only on valid nights', async () => {
      // Arrange
      const roomPrice = {
        id: 'rp-1',
        pricingMode: PricingMode.PER_ROOM,
        pricePerNight: 200.00,
        roomTypeId: 'room-standard',
        occupancyRates: [],
      };

      const contractWithRoom = {
        ...mockContract,
        periods: [
          {
            ...mockContract.periods[0],
            startDate: new Date('2024-07-01'),
            endDate: new Date('2024-07-31'),
            roomPrices: [roomPrice],
          },
        ],
      };

      const offers = [
        {
          id: 'offer-summer',
          name: 'Summer Promo -20%',
          type: OfferType.PERCENTAGE,
          value: 20,
          discountMode: DiscountMode.SEQUENTIAL,
          offerPeriods: [
            {
              startDate: new Date('2024-07-07'),
              endDate: new Date('2024-07-15'), // Offre valide 07-15 juillet
            },
          ],
        },
      ];

      jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue(contractWithRoom as any);
      jest.spyOn(prisma.offer, 'findMany').mockResolvedValue(offers as any);

      const criteria = {
        hotelId: 'hotel-1',
        marketId: 'market-fr',
        checkIn: new Date('2024-07-14'), // Séjour 14-18 juillet (5 nuits)
        checkOut: new Date('2024-07-19'),
        totalNights: 5,
        rooms: [
          {
            roomTypeId: 'room-standard',
            numAdults: 2,
            numChildren: 0,
            childrenAges: [],
            mealPlanId: 'meal-bb',
          },
        ],
        offerIds: ['offer-summer'],
        supplements: [],
      };

      // Act
      const result = await service.calculatePrice(criteria);

      // Assert
      // Nuit 14/07 : 200€ × 0.8 = 160€ (offre appliquée)
      // Nuit 15/07 : 200€ × 0.8 = 160€ (offre appliquée)
      // Nuit 16/07 : 200€ (pas d'offre)
      // Nuit 17/07 : 200€ (pas d'offre)
      // Nuit 18/07 : 200€ (pas d'offre)
      // Total : 160 + 160 + 200 + 200 + 200 = 920€
      expect(result.breakdown[0].finalPriceThisNight).toBe(160.00);
      expect(result.breakdown[1].finalPriceThisNight).toBe(160.00);
      expect(result.breakdown[2].finalPriceThisNight).toBe(200.00);
      expect(result.roomsSubtotal).toBe(920.00);
      expect(result.discountAmount).toBe(80.00); // 2 nuits × 40€
    });
  });

  describe('Test 7: Suppléments PER_PERSON_PER_STAY', () => {
    it('should calculate PER_PERSON_PER_STAY supplement correctly', () => {
      // Arrange
      const supplement = {
        id: 'supp-transfer',
        name: 'Transfert aéroport',
        price: 50,
        unit: 'PER_PERSON_PER_STAY',
        canReceiveDiscount: true,
      };

      const quantity = 4; // 4 personnes
      const nights = 7; // Pas utilisé pour PER_STAY

      // Act
      const total = service.calculateSupplementPrice(supplement, quantity, nights);

      // Assert
      expect(total).toBe(200.00); // 50€ × 4 personnes (pas × nuits)
    });
  });

  describe('Test 8: Suppléments PER_ROOM_PER_NIGHT', () => {
    it('should calculate PER_ROOM_PER_NIGHT supplement correctly', () => {
      // Arrange
      const supplement = {
        id: 'supp-seaview',
        name: 'Vue mer',
        price: 30,
        unit: 'PER_ROOM_PER_NIGHT',
        canReceiveDiscount: false,
      };

      const quantity = 1; // 1 chambre
      const nights = 7;

      // Act
      const total = service.calculateSupplementPrice(supplement, quantity, nights);

      // Assert
      expect(total).toBe(210.00); // 30€ × 1 chambre × 7 nuits
    });
  });

  describe('Test 9: Meal Plan Supplement avec Occupancy', () => {
    it('should calculate meal plan supplement based on occupancy', async () => {
      // Arrange
      const mealPlanSupplement = {
        mealPlanId: 'meal-hb',
        occupancyRates: JSON.stringify({
          '1-0': 20,  // Single
          '2-0': 40,  // Double
          '2-1': 50,  // Double + 1 enfant
        }),
      };

      const contractWithMeal = {
        ...mockContract,
        periods: [
          {
            ...mockContract.periods[0],
            mealPlanSupplements: [mealPlanSupplement],
          },
        ],
      };

      jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue(contractWithMeal as any);

      // Test Double (2-0)
      const occupancyKey = '2-0';
      const rates = JSON.parse(mealPlanSupplement.occupancyRates);
      const mealPrice = rates[occupancyKey];

      // Assert
      expect(mealPrice).toBe(40); // 40€ pour 2 adultes
    });
  });

  describe('Test 10: Complet - Facture Finale', () => {
    it('should calculate complete booking with all components', async () => {
      // Arrange
      const roomPrice = {
        id: 'rp-1',
        pricingMode: PricingMode.PER_OCCUPANCY,
        roomTypeId: 'room-suite',
        occupancyRates: [
          {
            numAdults: 2,
            numChildren: 1,
            totalRate: 180,
          },
        ],
      };

      const mealPlanSupplement = {
        mealPlanId: 'meal-hb',
        occupancyRates: JSON.stringify({
          '2-1': 40,
        }),
      };

      const contractComplete = {
        ...mockContract,
        periods: [
          {
            ...mockContract.periods[0],
            roomPrices: [roomPrice],
            mealPlanSupplements: [mealPlanSupplement],
          },
        ],
      };

      const offers = [
        {
          id: 'offer-1',
          type: OfferType.PERCENTAGE,
          value: 10,
          discountMode: DiscountMode.SEQUENTIAL,
          applyToMealSupplements: true,
          offerPeriods: [
            {
              startDate: new Date('2024-12-01'),
              endDate: new Date('2025-01-31'),
            },
          ],
        },
      ];

      jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue(contractComplete as any);
      jest.spyOn(prisma.offer, 'findMany').mockResolvedValue(offers as any);

      const criteria = {
        hotelId: 'hotel-1',
        marketId: 'market-fr',
        checkIn: new Date('2024-12-20'),
        checkOut: new Date('2024-12-23'),
        totalNights: 3,
        rooms: [
          {
            roomTypeId: 'room-suite',
            numAdults: 2,
            numChildren: 1,
            childrenAges: [5],
            mealPlanId: 'meal-hb', // Half Board
          },
        ],
        offerIds: ['offer-1'],
        supplements: [
          {
            supplementId: 'supp-transfer',
            quantity: 3, // 3 personnes
          },
        ],
      };

      // Act
      const result = await service.calculatePrice(criteria);

      // Assert
      // Room : 180€/nuit × 3 nuits = 540€
      // Meal HB : 40€/nuit × 3 nuits = 120€
      // Sous-total : 660€
      // Offre -10% : 660€ × 0.9 = 594€
      // Supplement : 50€ × 3 = 150€ (avec -10% = 135€)
      // TOTAL : 594€ + 135€ = 729€
      
      expect(result.roomsSubtotal).toBeCloseTo(594.00, 2);
      expect(result.supplementsTotal).toBeCloseTo(135.00, 2);
      expect(result.totalAmount).toBeCloseTo(729.00, 2);
    });
  });
});