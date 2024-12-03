import { Hotel, Market, Contract, CurrencySetting, MealPlanType, MarketGroup, Season, SpecialOffer, Rate } from './app/models/types';

// Données d'exemple
// Type definitions for sample data
interface HotelDataRecord {
  [key: `${number}-description`]: string;
  [key: `${number}-cancellation`]: string;
  [key: `${number}-checkInOut`]: string;
}

interface MealPlanData {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface SampleDataType {
  hotels: Hotel[];
  markets: Market[];
  contracts: {
    [key: number]: Contract[];
  };
  hotelData: HotelDataRecord;
  currencySettings: CurrencySetting[];
  mealPlans: {
    [key: number]: MealPlanData[];
  };
  marketGroups: MarketGroup[];
  seasons: {
    [key: number]: Season[];
  };
  specialOffers: {
    [key: number]: SpecialOffer[];
  };
  rates: Rate[];
}

export const sampleData: SampleDataType = {
  hotels: [
    {
      id: 1,
      name: "Grand Hotel Riviera",
      address: "58 Boulevard de la Croisette",
      city: "Nice",
      country: "France",
      rating: 5,
      specialOffers: [
        {
          id: 1,
          code: "SUMMER2024",
          name: "Summer Early Bird",
          type: "combinable",
          description: "Book early for summer 2024 and save up to 25%",
          discountType: "percentage",
          discountValues: [
            { nights: 3, value: 15, startDate: "2024-06-01", endDate: "2024-08-31" },
            { nights: 5, value: 20, startDate: "2024-06-01", endDate: "2024-08-31" },
            { nights: 7, value: 25, startDate: "2024-06-01", endDate: "2024-08-31" }
          ],
          startDate: "2024-01-01",
          endDate: "2024-05-31",
          conditions: [
            "Valid for all room types",
            "Non-refundable",
            "Full prepayment required"
          ],
          minimumNights: 3,
          maximumNights: 14,
          blackoutDates: ["2024-07-14", "2024-07-15"],
          bookingWindow: {
            start: "2024-01-01",
            end: "2024-05-31"
          }
        },
        {
          id: 2,
          code: "FAMILY2024",
          name: "Family Package",
          type: "cumulative",
          description: "Special rates for families with children",
          discountType: "fixed",
          discountValues: [
            { nights: 4, value: 100, startDate: "2024-04-01", endDate: "2024-10-31" },
            { nights: 7, value: 200, startDate: "2024-04-01", endDate: "2024-10-31" }
          ],
          startDate: "2024-04-01",
          endDate: "2024-10-31",
          conditions: [
            "Valid for family rooms only",
            "Includes free meals for children under 12",
            "Free access to kids club"
          ],
          minimumNights: 4,
          bookingWindow: {
            start: "2024-01-01",
            end: "2024-09-30"
          }
        }
      ],
      ageCategories: [
        {
          id: 1,
          type: "adult",
          label: "Adult",
          minAge: 18,
          maxAge: 99,
          defaultRate: 0
        },
        {
          id: 2,
          type: "child",
          label: "Child",
          minAge: 2,
          maxAge: 17,
          defaultRate: 50
        },
        {
          id: 3,
          type: "infant",
          label: "Infant",
          minAge: 0,
          maxAge: 1,
          defaultRate: 0
        }
      ],
      rooms: [
        {
          id: 1,
          type: "Standard",
          name: "Standard Sea View",
          description: "Comfortable room with sea view",
          location: "Main Building",
          maxOccupancy: {
            adults: 2,
            children: 1,
            infants: 1
          },
          amenities: ["WiFi", "Air Conditioning", "Mini Bar"],
          size: 25,
          images: ["room1.jpg", "room1-2.jpg"],
          bedConfiguration: [
            { type: "Double", count: 1 },
            { type: "Single", count: 1 }
          ]
        },
        {
          id: 2,
          type: "Deluxe",
          name: "Deluxe Ocean View",
          description: "Luxurious room with panoramic ocean view",
          location: "Main Building",
          maxOccupancy: {
            adults: 3,
            children: 2,
            infants: 1
          },
          amenities: ["WiFi", "Air Conditioning", "Mini Bar", "Ocean View", "Balcony"],
          size: 35,
          images: ["deluxe1.jpg", "deluxe2.jpg"],
          bedConfiguration: [
            { type: "King", count: 1 },
            { type: "Sofa", count: 1 }
          ]
        }
      ],
      amenities: ["Pool", "Spa", "Restaurant", "Beach Access"],
      checkInTime: "14:00",
      checkOutTime: "11:00",
      policies: {
        cancellation: "Free cancellation up to 30 days before arrival",
        checkIn: "From 14:00",
        checkOut: "Until 11:00",
        childPolicy: "Children of all ages welcome",
        petPolicy: "No pets allowed",
        dressCode: "Smart casual attire is required in all restaurants and public areas after 6:00 PM. Beachwear is not permitted in restaurants and bars."
      },
      features: {
        restaurants: [
          {
            name: "L'Azur",
            cuisine: "Mediterranean Fine Dining",
            dressCode: "Smart Elegant - Gentlemen are required to wear long trousers and closed shoes. No shorts, t-shirts, or sandals.",
            openingHours: "19:00 - 22:30",
            description: "Our signature restaurant offering refined Mediterranean cuisine with panoramic sea views."
          },
          {
            name: "La Terrasse",
            cuisine: "French Bistro",
            dressCode: "Smart Casual - No beachwear or sports attire.",
            openingHours: "12:00 - 15:00, 19:00 - 22:00",
            description: "Casual dining venue serving classic French dishes on a beautiful terrace."
          }
        ],
        spa: {
          name: "Riviera Wellness",
          treatments: ["Massages", "Facials", "Body Treatments", "Hydrotherapy"],
          openingHours: "09:00 - 20:00",
          description: "A haven of tranquility offering traditional and innovative treatments."
        }
      },
      images: ["hotel1.jpg", "hotel1-2.jpg"],
      description: "Perched on the stunning French Riviera, the Grand Hotel Riviera is a masterpiece of luxury and elegance. This five-star establishment offers breathtaking views of the Mediterranean Sea from its privileged location in Nice. The hotel seamlessly blends classic French architecture with modern amenities, featuring meticulously designed rooms and suites, each offering a unique perspective of the azure coastline. Our world-class restaurants serve exquisite Mediterranean and French cuisine, while our spa provides the ultimate relaxation experience. With direct beach access, a stunning infinity pool, and proximity to Nice's vibrant cultural attractions, the Grand Hotel Riviera represents the pinnacle of French Riviera hospitality.",
      contactInfo: {
        phone: "+33 1 23 45 67 89",
        email: "contact@grandhotelriviera.com",
        website: "www.grandhotelriviera.com"
      }
    },
    {
      id: 2,
      name: "Le Meridien Ile Maurice",
      address: "Village Hall Lane, Pointe Aux Piments",
      city: "Pointe Aux Piments",
      country: "Mauritius",
      rating: 5,
      ageCategories: [
        {
          id: 1,
          type: "adult",
          label: "Adult",
          minAge: 18,
          maxAge: 99,
          defaultRate: 0
        },
        {
          id: 2,
          type: "child",
          label: "Child",
          minAge: 2,
          maxAge: 17,
          defaultRate: 50
        },
        {
          id: 3,
          type: "infant",
          label: "Infant",
          minAge: 0,
          maxAge: 1,
          defaultRate: 0
        }
      ],
      rooms: [
        {
          id: 1,
          type: "Deluxe",
          name: "Deluxe Ocean View",
          description: "Elegant room with stunning ocean views and modern amenities",
          location: "Main Building",
          maxOccupancy: {
            adults: 2,
            children: 1,
            infants: 1
          },
          amenities: ["WiFi", "Air Conditioning", "Mini Bar", "Ocean View", "Private Balcony"],
          size: 30,
          images: ["deluxe-room1.jpg", "deluxe-room2.jpg"],
          bedConfiguration: [
            { type: "King", count: 1 }
          ]
        },
        {
          id: 2,
          type: "Premium",
          name: "Premium Ocean View",
          description: "Spacious premium room with panoramic ocean views",
          location: "Main Building",
          maxOccupancy: {
            adults: 3,
            children: 1,
            infants: 1
          },
          amenities: ["WiFi", "Air Conditioning", "Mini Bar", "Ocean View", "Private Balcony", "Lounge Access"],
          size: 35,
          images: ["premium-room1.jpg", "premium-room2.jpg"],
          bedConfiguration: [
            { type: "King", count: 1 },
            { type: "Sofa Bed", count: 1 }
          ]
        },
        {
          id: 3,
          type: "Suite",
          name: "Royal Suite",
          description: "Luxurious suite with separate living area and premium ocean views",
          location: "Main Building",
          maxOccupancy: {
            adults: 3,
            children: 2,
            infants: 1
          },
          amenities: ["WiFi", "Air Conditioning", "Mini Bar", "Ocean View", "Private Balcony", "Lounge Access", "Butler Service"],
          size: 45,
          images: ["suite-room1.jpg", "suite-room2.jpg"],
          bedConfiguration: [
            { type: "King", count: 1 },
            { type: "Sofa Bed", count: 1 }
          ]
        }
      ],
      amenities: ["Pool", "Spa", "Beach Access", "Water Sports", "Kids Club", "Fitness Center"],
      checkInTime: "14:00",
      checkOutTime: "11:00",
      policies: {
        cancellation: "Free cancellation up to 45 days before arrival",
        checkIn: "From 15:00",
        checkOut: "Until 11:00",
        childPolicy: "Children of all ages welcome. Free kids club for ages 4-12",
        petPolicy: "No pets allowed",
        dressCode: "Resort casual attire is accepted throughout the day. Smart casual required in all restaurants for dinner. No wet clothing in restaurants and bars."
      },
      features: {
        restaurants: [
          {
            name: "La Faya",
            cuisine: "Contemporary Mauritian",
            dressCode: "Smart Casual - Closed shoes and collared shirts required for dinner. No shorts or beachwear.",
            openingHours: "19:00 - 22:30",
            description: "Fine dining restaurant showcasing modern interpretations of Mauritian cuisine."
          },
          {
            name: "Shells",
            cuisine: "Seafood",
            dressCode: "Resort Casual - No wet attire or uncovered swimwear.",
            openingHours: "12:00 - 15:00, 18:30 - 22:00",
            description: "Beachfront seafood restaurant offering the freshest local catch."
          }
        ],
        spa: {
          name: "Le Spa",
          treatments: ["Ayurvedic Treatments", "Couples Massages", "Beauty Treatments", "Yoga Sessions"],
          openingHours: "09:00 - 19:00",
          description: "A serene sanctuary combining ancient wisdom with modern techniques."
        }
      },
      images: ["meridien1.jpg", "meridien2.jpg", "meridien3.jpg"],
      description: "Nestled along the pristine shores of Pointe aux Piments, Le Meridien Ile Maurice embodies the essence of tropical luxury. This beachfront paradise combines contemporary elegance with authentic Mauritian charm, offering an unparalleled resort experience. Set against the backdrop of the crystal-clear Indian Ocean, the resort features extensive tropical gardens, a world-class spa, and one of the island's finest water sports centers. Our diverse dining venues showcase both local and international cuisines, while our specially designed Kids' Club ensures memorable experiences for our younger guests. Whether you're seeking romantic seclusion, family adventure, or cultural immersion, Le Meridien Ile Maurice provides the perfect setting for an unforgettable island getaway.",
      contactInfo: {
        phone: "+230 204 3333",
        email: "reservations@meridien-mauritius.com",
        website: "www.marriott.com/meridien-mauritius"
      }
    }
  ],
  markets: [
    {
      id: 1,
      name: "France",
      code: "FR",
      isActive: true,
      currency: "EUR",
      region: "Europe",
      description: "French market"
    },
    {
      id: 2,
      name: "United Kingdom",
      code: "UK",
      isActive: true,
      currency: "GBP",
      region: "Europe",
      description: "UK market"
    },
    {
      id: 3,
      name: "Germany",
      code: "DE",
      isActive: true,
      currency: "EUR",
      region: "Europe",
      description: "German market"
    },
    {
      id: 4,
      name: "Switzerland",
      code: "CH",
      isActive: true,
      currency: "CHF",
      region: "Europe",
      description: "Swiss market"
    }
  ],
  contracts: {
    1: [
      {
        id: 1,
        hotelId: 1,
        marketId: 1,
        seasonId: 1,
        name: "Standard Rate Contract",
        startDate: "2024-05-01",
        endDate: "2024-10-31",
        status: "active",
        rateType: "public",
        terms: {
          cancellationPolicy: [
            {
              daysBeforeArrival: 7,
              charge: 50
            }
          ],
          paymentTerms: "30 days",
          commission: 10,
          specialConditions: []
        },
        validFrom: new Date("2024-05-01"),
        validTo: new Date("2024-10-31"),
        rates: [
          {
            id: 1,
            name: "Standard Room BB Rate",
            marketId: 1,
            seasonId: 1,
            roomTypeId: 1,
            contractId: 1,
            hotelId: 1,
            currency: "EUR",
            amount: 200,
            baseRate: 200,
            extraAdult: 50,
            extraChild: 25,
            singleOccupancy: 150,
            supplements: {
              extraAdult: 50,
              extraChild: 25,
              singleOccupancy: 150,
              mealPlan: {
                BB: 0,
                HB: 30,
                FB: 50
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 5,
            name: "Standard Room HB Rate",
            marketId: 1,
            seasonId: 1,
            roomTypeId: 1,
            contractId: 1,
            hotelId: 1,
            currency: "EUR",
            amount: 230,
            baseRate: 230,
            extraAdult: 50,
            extraChild: 25,
            singleOccupancy: 180,
            supplements: {
              extraAdult: 50,
              extraChild: 25,
              singleOccupancy: 180,
              mealPlan: {
                BB: 0,
                HB: 30,
                FB: 50
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 6,
            name: "Standard Room FB Rate",
            marketId: 1,
            seasonId: 1,
            roomTypeId: 1,
            contractId: 1,
            hotelId: 1,
            currency: "EUR",
            amount: 250,
            baseRate: 250,
            extraAdult: 50,
            extraChild: 25,
            singleOccupancy: 200,
            supplements: {
              extraAdult: 50,
              extraChild: 25,
              singleOccupancy: 200,
              mealPlan: {
                BB: 0,
                HB: 30,
                FB: 50
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      },
      {
        id: 2,
        hotelId: 1,
        marketId: 2,
        seasonId: 1,
        name: "International Rate Contract",
        startDate: "2024-05-01",
        endDate: "2024-10-31",
        status: "active",
        rateType: "public",
        terms: {
          cancellationPolicy: [
            {
              daysBeforeArrival: 14,
              charge: 50
            }
          ],
          paymentTerms: "30 days",
          commission: 15,
          specialConditions: []
        },
        validFrom: new Date("2024-05-01"),
        validTo: new Date("2024-10-31"),
        rates: [
          {
            id: 2,
            name: "International Room BB Rate",
            marketId: 2,
            seasonId: 1,
            roomTypeId: 1,
            contractId: 2,
            hotelId: 1,
            currency: "USD",
            amount: 220,
            baseRate: 220,
            extraAdult: 55,
            extraChild: 28,
            singleOccupancy: 165,
            supplements: {
              extraAdult: 55,
              extraChild: 28,
              singleOccupancy: 165,
              mealPlan: {
                BB: 0,
                HB: 35,
                FB: 60
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 7,
            name: "International Room HB Rate",
            marketId: 2,
            seasonId: 1,
            roomTypeId: 1,
            contractId: 2,
            hotelId: 1,
            currency: "USD",
            amount: 255,
            baseRate: 255,
            extraAdult: 55,
            extraChild: 28,
            singleOccupancy: 200,
            supplements: {
              extraAdult: 55,
              extraChild: 28,
              singleOccupancy: 200,
              mealPlan: {
                BB: 0,
                HB: 35,
                FB: 60
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 8,
            name: "International Room FB Rate",
            marketId: 2,
            seasonId: 1,
            roomTypeId: 1,
            contractId: 2,
            hotelId: 1,
            currency: "USD",
            amount: 280,
            baseRate: 280,
            extraAdult: 55,
            extraChild: 28,
            singleOccupancy: 225,
            supplements: {
              extraAdult: 55,
              extraChild: 28,
              singleOccupancy: 225,
              mealPlan: {
                BB: 0,
                HB: 35,
                FB: 60
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      },
      {
        id: 3,
        hotelId: 1,
        marketId: 3,
        seasonId: 1,
        name: "Tour Operator Rate Contract",
        startDate: "2024-05-01",
        endDate: "2024-10-31",
        status: "active",
        rateType: "private",
        terms: {
          cancellationPolicy: [
            {
              daysBeforeArrival: 21,
              charge: 50
            }
          ],
          paymentTerms: "45 days",
          commission: 20,
          specialConditions: ["Minimum group size: 10 rooms"]
        },
        validFrom: new Date("2024-05-01"),
        validTo: new Date("2024-10-31"),
        rates: [
          {
            id: 3,
            name: "Tour Operator Room BB Rate",
            marketId: 3,
            seasonId: 1,
            roomTypeId: 1,
            contractId: 3,
            hotelId: 1,
            currency: "EUR",
            amount: 180,
            baseRate: 180,
            extraAdult: 45,
            extraChild: 23,
            singleOccupancy: 135,
            supplements: {
              extraAdult: 45,
              extraChild: 23,
              singleOccupancy: 135,
              mealPlan: {
                BB: 0,
                HB: 25,
                FB: 45
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 3,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 11,
            name: "Tour Operator Room HB Rate",
            marketId: 3,
            seasonId: 1,
            roomTypeId: 1,
            contractId: 3,
            hotelId: 1,
            currency: "EUR",
            amount: 205,
            baseRate: 205,
            extraAdult: 45,
            extraChild: 23,
            singleOccupancy: 160,
            supplements: {
              extraAdult: 45,
              extraChild: 23,
              singleOccupancy: 160,
              mealPlan: {
                BB: 0,
                HB: 25,
                FB: 45
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 3,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 12,
            name: "Tour Operator Room FB Rate",
            marketId: 3,
            seasonId: 1,
            roomTypeId: 1,
            contractId: 3,
            hotelId: 1,
            currency: "EUR",
            amount: 225,
            baseRate: 225,
            extraAdult: 45,
            extraChild: 23,
            singleOccupancy: 180,
            supplements: {
              extraAdult: 45,
              extraChild: 23,
              singleOccupancy: 180,
              mealPlan: {
                BB: 0,
                HB: 25,
                FB: 45
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 3,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }
    ],
    2: [
      {
        id: 3,
        hotelId: 2,
        marketId: 3,
        seasonId: 4,  // Low Season
        name: "Local Market Contract - Low Season 2024",
        startDate: "2024-05-01",
        endDate: "2024-10-31",
        status: "active",
        rateType: "public",
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2024-12-31"),
        terms: {
          cancellationPolicy: [
            { daysBeforeArrival: 30, charge: 0 },
            { daysBeforeArrival: 14, charge: 50 },
            { daysBeforeArrival: 7, charge: 100 }
          ],
          paymentTerms: "30 days before arrival",
          commission: 10,
          specialConditions: []
        },
        rates: [
          {
            id: 5,
            name: "Standard Room HB Rate",
            marketId: 3,
            seasonId: 4,
            roomTypeId: 1,
            contractId: 3,
            hotelId: 2,
            currency: "EUR",
            amount: 230,
            baseRate: 230,
            extraAdult: 50,
            extraChild: 25,
            singleOccupancy: 180,
            supplements: {
              extraAdult: 50,
              extraChild: 25,
              singleOccupancy: 40,
              mealPlan: {
                BB: 0,
                HB: 25,
                FB: 45
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date("2024-01-15T10:00:00Z"),
            updatedAt: new Date("2024-01-15T10:00:00Z")
          },
          {
            id: 6,
            name: "Standard Room FB Rate",
            marketId: 3,
            seasonId: 4,
            roomTypeId: 1,
            contractId: 3,
            hotelId: 2,
            currency: "EUR",
            amount: 250,
            baseRate: 250,
            extraAdult: 50,
            extraChild: 25,
            singleOccupancy: 200,
            supplements: {
              extraAdult: 50,
              extraChild: 25,
              singleOccupancy: 40,
              mealPlan: {
                BB: 0,
                HB: 25,
                FB: 45
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date("2024-01-15T10:00:00Z"),
            updatedAt: new Date("2024-01-15T10:00:00Z")
          },
          {
            id: 7,
            name: "International Room HB Rate",
            marketId: 4,
            seasonId: 4,
            roomTypeId: 1,
            contractId: 4,
            hotelId: 2,
            currency: "USD",
            amount: 255,
            baseRate: 255,
            extraAdult: 55,
            extraChild: 28,
            singleOccupancy: 200,
            supplements: {
              extraAdult: 55,
              extraChild: 28,
              singleOccupancy: 45,
              mealPlan: {
                BB: 0,
                HB: 35,
                FB: 60
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date("2024-01-15T10:00:00Z"),
            updatedAt: new Date("2024-01-15T10:00:00Z")
          },
          {
            id: 8,
            name: "International Room FB Rate",
            marketId: 4,
            seasonId: 4,
            roomTypeId: 1,
            contractId: 4,
            hotelId: 2,
            currency: "USD",
            amount: 280,
            baseRate: 280,
            extraAdult: 55,
            extraChild: 28,
            singleOccupancy: 225,
            supplements: {
              extraAdult: 55,
              extraChild: 28,
              singleOccupancy: 45,
              mealPlan: {
                BB: 0,
                HB: 35,
                FB: 60
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date("2024-01-15T10:00:00Z"),
            updatedAt: new Date("2024-01-15T10:00:00Z")
          }
        ]
      },
      {
        id: 4,
        hotelId: 2,
        marketId: 3,
        seasonId: 3,  // High Season
        name: "Local Market Contract - High Season 2024",
        startDate: "2024-11-01",
        endDate: "2025-03-31",
        status: "active",
        rateType: "public",
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2024-12-31"),
        terms: {
          cancellationPolicy: [
            { daysBeforeArrival: 30, charge: 0 },
            { daysBeforeArrival: 14, charge: 50 },
            { daysBeforeArrival: 7, charge: 100 }
          ],
          paymentTerms: "30 days before arrival",
          commission: 10,
          specialConditions: []
        },
        rates: [
          {
            id: 9,
            name: "Standard Room HB Rate",
            marketId: 3,
            seasonId: 3,
            roomTypeId: 1,
            contractId: 5,
            hotelId: 2,
            currency: "EUR",
            amount: 230,
            baseRate: 230,
            extraAdult: 50,
            extraChild: 25,
            singleOccupancy: 180,
            supplements: {
              extraAdult: 50,
              extraChild: 25,
              singleOccupancy: 40,
              mealPlan: {
                BB: 0,
                HB: 25,
                FB: 45
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date("2024-01-15T10:00:00Z"),
            updatedAt: new Date("2024-01-15T10:00:00Z")
          },
          {
            id: 10,
            name: "Standard Room FB Rate",
            marketId: 3,
            seasonId: 3,
            roomTypeId: 1,
            contractId: 5,
            hotelId: 2,
            currency: "EUR",
            amount: 250,
            baseRate: 250,
            extraAdult: 50,
            extraChild: 25,
            singleOccupancy: 200,
            supplements: {
              extraAdult: 50,
              extraChild: 25,
              singleOccupancy: 40,
              mealPlan: {
                BB: 0,
                HB: 25,
                FB: 45
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date("2024-01-15T10:00:00Z"),
            updatedAt: new Date("2024-01-15T10:00:00Z")
          },
          {
            id: 11,
            name: "Tour Operator Room HB Rate",
            marketId: 3,
            seasonId: 3,
            roomTypeId: 1,
            contractId: 5,
            hotelId: 2,
            currency: "EUR",
            amount: 205,
            baseRate: 205,
            extraAdult: 45,
            extraChild: 23,
            singleOccupancy: 160,
            supplements: {
              extraAdult: 45,
              extraChild: 23,
              singleOccupancy: 40,
              mealPlan: {
                BB: 0,
                HB: 25,
                FB: 45
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 3,
            maximumStay: 14,
            isActive: true,
            createdAt: new Date("2024-01-15T10:00:00Z"),
            updatedAt: new Date("2024-01-15T10:00:00Z")
          },
          {
            id: 12,
            name: "Tour Operator Room FB Rate",
            marketId: 3,
            seasonId: 3,
            roomTypeId: 1,
            contractId: 5,
            hotelId: 2,
            currency: "EUR",
            amount: 225,
            baseRate: 225,
            extraAdult: 45,
            extraChild: 23,
            singleOccupancy: 180,
            supplements: {
              extraAdult: 45,
              extraChild: 23,
              singleOccupancy: 40,
              mealPlan: {
                BB: 0,
                HB: 25,
                FB: 45
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 3,
            maximumStay: 14,
            isActive: true,
            createdAt: new Date("2024-01-15T10:00:00Z"),
            updatedAt: new Date("2024-01-15T10:00:00Z")
          }
        ]
      },
      {
        id: 6,
        hotelId: 2,
        marketId: 4,
        seasonId: 3,  // High Season
        name: "International Contract - High Season 2024",
        startDate: "2024-11-01",
        endDate: "2025-03-31",
        status: "active",
        rateType: "public",
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2024-12-31"),
        terms: {
          cancellationPolicy: [
            { daysBeforeArrival: 30, charge: 0 },
            { daysBeforeArrival: 14, charge: 50 },
            { daysBeforeArrival: 7, charge: 100 }
          ],
          paymentTerms: "30 days before arrival",
          commission: 15,
          specialConditions: []
        },
        rates: [
          {
            id: 11,
            name: "International Room HB Rate",
            marketId: 4,
            seasonId: 3,
            roomTypeId: 1,
            contractId: 6,
            hotelId: 2,
            currency: "USD",
            amount: 255,
            baseRate: 255,
            extraAdult: 55,
            extraChild: 28,
            singleOccupancy: 200,
            supplements: {
              extraAdult: 55,
              extraChild: 28,
              singleOccupancy: 45,
              mealPlan: {
                BB: 0,
                HB: 35,
                FB: 60
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date("2024-01-15T10:00:00Z"),
            updatedAt: new Date("2024-01-15T10:00:00Z")
          },
          {
            id: 12,
            name: "International Room FB Rate",
            marketId: 4,
            seasonId: 3,
            roomTypeId: 1,
            contractId: 6,
            hotelId: 2,
            currency: "USD",
            amount: 280,
            baseRate: 280,
            extraAdult: 55,
            extraChild: 28,
            singleOccupancy: 225,
            supplements: {
              extraAdult: 55,
              extraChild: 28,
              singleOccupancy: 45,
              mealPlan: {
                BB: 0,
                HB: 35,
                FB: 60
              }
            },
            ageCategoryRates: {},
            specialOffers: [],
            minimumStay: 1,
            maximumStay: 30,
            isActive: true,
            createdAt: new Date("2024-01-15T10:00:00Z"),
            updatedAt: new Date("2024-01-15T10:00:00Z")
          }
        ]
      }
    ]
  },
  marketGroups: [
    {
      id: 1,
      name: "Western Europe",
      description: "Markets in Western Europe",
      markets: [1, 2],
      region: "Europe",
      defaultCurrency: "EUR",
      isActive: true
    },
    {
      id: 2,
      name: "DACH",
      description: "German-speaking markets",
      markets: [3, 4],
      region: "Europe",
      defaultCurrency: "EUR",
      isActive: true
    }
  ],
  seasons: {
    1: [
      {
        id: 1,
        name: "Summer 2024",
        startDate: "2024-05-01",
        endDate: "2024-09-30",
        isActive: true,
        periods: [
          {
            id: 1,
            startDate: "2024-05-01",
            endDate: "2024-06-30",
            mlos: 3,
            description: "Early Summer"
          },
          {
            id: 2,
            startDate: "2024-07-01",
            endDate: "2024-08-31",
            mlos: 5,
            description: "Peak Summer"
          },
          {
            id: 3,
            startDate: "2024-09-01",
            endDate: "2024-09-30",
            mlos: 3,
            description: "Late Summer"
          }
        ]
      },
      {
        id: 2,
        name: "Winter 2024",
        startDate: "2024-10-01",
        endDate: "2025-04-30",
        isActive: true,
        periods: [
          {
            id: 4,
            startDate: "2024-10-01",
            endDate: "2024-12-20",
            mlos: 2,
            description: "Early Winter"
          },
          {
            id: 5,
            startDate: "2024-12-21",
            endDate: "2025-01-05",
            mlos: 7,
            description: "Holiday Season",
            isBlackout: true
          },
          {
            id: 6,
            startDate: "2025-01-06",
            endDate: "2025-04-30",
            mlos: 2,
            description: "Late Winter"
          }
        ]
      }
    ],
    2: [
      {
        id: 3,
        name: "High Season 2024",
        startDate: "2024-11-01",
        endDate: "2025-03-31",
        isActive: true,
        description: "Peak tourist season in Mauritius",
        periods: [
          {
            id: 7,
            startDate: "2024-11-01",
            endDate: "2024-12-19",
            mlos: 3,
            description: "Early High Season"
          },
          {
            id: 8,
            startDate: "2024-12-20",
            endDate: "2025-01-10",
            mlos: 7,
            description: "Festive Season",
            isBlackout: true
          },
          {
            id: 9,
            startDate: "2025-01-11",
            endDate: "2025-03-31",
            mlos: 3,
            description: "Late High Season"
          }
        ]
      },
      {
        id: 4,
        name: "Low Season 2024",
        startDate: "2024-05-01",
        endDate: "2024-10-31",
        isActive: true,
        description: "Off-peak season with mild weather",
        periods: [
          {
            id: 10,
            startDate: "2024-05-01",
            endDate: "2024-07-31",
            mlos: 2,
            description: "Early Low Season"
          },
          {
            id: 11,
            startDate: "2024-08-01",
            endDate: "2024-10-31",
            mlos: 2,
            description: "Late Low Season"
          }
        ]
      }
    ]
  },
  mealPlans: {
    "1": [
      {
        id: 1,
        name: "Room Only",
        code: "RO",
        description: "No meals included"
      },
      {
        id: 2,
        name: "Bed & Breakfast",
        code: "BB",
        description: "Breakfast included"
      },
      {
        id: 3,
        name: "Half Board",
        code: "HB",
        description: "Breakfast and dinner included"
      },
      {
        id: 4,
        name: "Full Board",
        code: "FB",
        description: "All meals included"
      },
      {
        id: 5,
        name: "All Inclusive",
        code: "AI",
        description: "All meals and selected drinks included"
      }
    ],
    "2": [
      {
        id: 1,
        name: "Room Only",
        code: "RO",
        description: "Accommodation only"
      },
      {
        id: 2,
        name: "Bed & Breakfast",
        code: "BB",
        description: "Includes breakfast buffet"
      },
      {
        id: 3,
        name: "Half Board",
        code: "HB",
        description: "Breakfast and dinner at main restaurant"
      },
      {
        id: 4,
        name: "Full Board",
        code: "FB",
        description: "All meals at main restaurant"
      },
      {
        id: 5,
        name: "All Inclusive",
        code: "AI",
        description: "All meals, snacks and selected beverages"
      },
      {
        id: 6,
        name: "Premium All Inclusive",
        code: "PAI",
        description: "All inclusive plus premium drinks and services"
      }
    ]
  },
  specialOffers: {
    1: [
      {
        id: 1,
        code: "SUMMER2024",
        name: "Summer Early Bird",
        type: "combinable",
        description: "Book early for summer 2024 and save up to 25%",
        discountType: "percentage",
        discountValues: [
          {
            nights: 3,
            value: 15,
            startDate: "2024-06-01",
            endDate: "2024-08-31"
          },
          {
            nights: 5,
            value: 20,
            startDate: "2024-06-01",
            endDate: "2024-08-31"
          },
          {
            nights: 7,
            value: 25,
            startDate: "2024-06-01",
            endDate: "2024-08-31"
          }
        ],
        startDate: "2024-01-01",
        endDate: "2024-05-31",
        conditions: [
          "Valid for all room types",
          "Non-refundable",
          "Full prepayment required"
        ],
        minimumNights: 3,
        maximumNights: 14,
        blackoutDates: ["2024-07-14", "2024-07-15"],
        bookingWindow: {
          start: "2024-01-01",
          end: "2024-05-31"
        }
      },
      {
        id: 2,
        code: "FAMILY2024",
        name: "Family Package",
        type: "cumulative",
        description: "Special rates for families with children",
        discountType: "fixed",
        discountValues: [
          {
            nights: 4,
            value: 100,
            startDate: "2024-04-01",
            endDate: "2024-10-31"
          },
          {
            nights: 7,
            value: 200,
            startDate: "2024-04-01",
            endDate: "2024-10-31"
          }
        ],
        startDate: "2024-04-01",
        endDate: "2024-10-31",
        conditions: [
          "Valid for family rooms only",
          "Includes free meals for children under 12",
          "Free access to kids club"
        ],
        minimumNights: 4,
        bookingWindow: {
          start: "2024-01-01",
          end: "2024-09-30"
        }
      }
    ]
  },
  rates: [
    {
      id: 1,
      name: "Standard Sea View - Summer 2024",
      marketId: 1,
      seasonId: 1,
      roomTypeId: 1,
      contractId: 1,
      hotelId: 1,
      currency: "EUR",
      amount: 350,
      baseRate: 350,
      extraAdult: 80,
      extraChild: 40,
      singleOccupancy: 300,
      supplements: {
        extraAdult: 80,
        extraChild: 40,
        singleOccupancy: 300,
        mealPlan: {
          HB: 45,
          FB: 80
        }
      },
      minimumStay: 1,
      maximumStay: 21,
      restrictions: {
        closedToArrival: ["2024-07-14"],
        closedToDeparture: ["2024-07-15"],
        minimumStayThrough: ["2024-08-01", "2024-08-15"]
      },
      ageCategoryRates: {
        "1": 0,    // Adult
        "2": 50,   // Child
        "3": 0     // Infant
      },
      specialOffers: [
        {
          id: 1,
          code: "SUMMER2024",
          name: "Summer Early Bird",
          type: "combinable",
          description: "Book early for summer 2024 and save up to 25%",
          discountType: "percentage",
          discountValues: [
            { nights: 3, value: 15 },
            { nights: 5, value: 20 },
            { nights: 7, value: 25 }
          ],
          startDate: "2024-01-01",
          endDate: "2024-05-31",
          conditions: [
            "Non-refundable",
            "Full prepayment required"
          ],
          minimumNights: 3,
          maximumNights: 14,
          blackoutDates: ["2024-07-14", "2024-07-15"],
          bookingWindow: {
            start: "2024-01-01",
            end: "2024-05-31"
          }
        }
      ],
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      isActive: true
    },
    {
      id: 2,
      name: "Deluxe Ocean View - Family Summer",
      marketId: 1,
      seasonId: 1,
      roomTypeId: 2,
      contractId: 1,
      hotelId: 1,
      currency: "EUR",
      amount: 550,
      baseRate: 550,
      extraAdult: 100,
      extraChild: 50,
      singleOccupancy: 470,
      supplements: {
        extraAdult: 100,
        extraChild: 50,
        singleOccupancy: 470,
        mealPlan: {
          HB: 45,
          FB: 80
        }
      },
      minimumStay: 4,
      maximumStay: 21,
      ageCategoryRates: {
        "1": 0,    // Adult
        "2": 50,   // Child
        "3": 0     // Infant
      },
      specialOffers: [
        {
          id: 2,
          code: "FAMILY2024",
          name: "Family Package",
          type: "cumulative",
          description: "Special rates for families with children",
          discountType: "fixed",
          discountValues: [
            { nights: 4, value: 100 },
            { nights: 7, value: 200 }
          ],
          startDate: "2024-04-01",
          endDate: "2024-10-31",
          conditions: [
            "Includes free meals for children under 12",
            "Free access to kids club"
          ],
          minimumNights: 4,
          bookingWindow: {
            start: "2024-01-01",
            end: "2024-09-30"
          }
        },
        {
          id: 3,
          code: "LONGSTAY2024",
          name: "Long Stay Discount",
          type: "combinable",
          description: "Special discounts for stays of 7 nights or more",
          discountType: "percentage",
          discountValues: [
            { nights: 7, value: 15 },
            { nights: 14, value: 25 }
          ],
          startDate: "2024-04-01",
          endDate: "2024-10-31",
          conditions: [
            "Cannot be combined with other offers",
            "Valid for all meal plans"
          ],
          minimumNights: 7,
          blackoutDates: ["2024-07-14", "2024-07-15", "2024-08-01", "2024-08-15"],
          bookingWindow: {
            start: "2024-01-01",
            end: "2024-09-30"
          }
        }
      ],
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      isActive: true
    },
    {
      id: 3,
      name: "Standard Sea View - Winter 2024",
      marketId: 1,
      seasonId: 2,
      roomTypeId: 1,
      contractId: 1,
      hotelId: 1,
      currency: "EUR",
      amount: 250,
      baseRate: 250,
      extraAdult: 60,
      extraChild: 30,
      singleOccupancy: 200,
      supplements: {
        extraAdult: 60,
        extraChild: 30,
        singleOccupancy: 200,
        mealPlan: {
          HB: 45,
          FB: 80
        }
      },
      minimumStay: 1,
      maximumStay: 28,
      ageCategoryRates: {
        "1": 0,    // Adult
        "2": 40,   // Child
        "3": 0     // Infant
      },
      specialOffers: [
        {
          id: 4,
          code: "WINTER2024",
          name: "Winter Escape",
          type: "cumulative",
          description: "Special winter rates with flexible cancellation",
          discountType: "percentage",
          discountValues: [
            { nights: 3, value: 10 },
            { nights: 5, value: 15 },
            { nights: 7, value: 20 }
          ],
          startDate: "2024-11-01",
          endDate: "2024-12-20",
          conditions: [
            "Free cancellation up to 7 days before arrival",
            "Includes daily breakfast"
          ],
          minimumNights: 3,
          blackoutDates: ["2024-12-24", "2024-12-25", "2024-12-31"],
          bookingWindow: {
            start: "2024-09-01",
            end: "2024-11-30"
          }
        }
      ],
      startDate: "2024-11-01",
      endDate: "2024-12-31",
      isActive: true
    }
  ],
  hotelData: {
    "1-description": "Perched on the stunning French Riviera, the Grand Hotel Riviera is a masterpiece of luxury and elegance. This five-star establishment offers breathtaking views of the Mediterranean Sea from its privileged location in Nice. The hotel seamlessly blends classic French architecture with modern amenities, featuring meticulously designed rooms and suites, each offering a unique perspective of the azure coastline. Our world-class restaurants serve exquisite Mediterranean and French cuisine, while our spa provides the ultimate relaxation experience. With direct beach access, a stunning infinity pool, and proximity to Nice's vibrant cultural attractions, the Grand Hotel Riviera represents the pinnacle of French Riviera hospitality.",
    "1-cancellation": "Free cancellation up to 30 days before arrival",
    "1-checkInOut": "Check-in: 2:00 PM, Check-out: 11:00 AM",
    "2-description": "Nestled along the pristine shores of Pointe aux Piments, Le Meridien Ile Maurice embodies the essence of tropical luxury. This beachfront paradise combines contemporary elegance with authentic Mauritian charm, offering an unparalleled resort experience. Set against the backdrop of the crystal-clear Indian Ocean, the resort features extensive tropical gardens, a world-class spa, and one of the island's finest water sports centers. Our diverse dining venues showcase both local and international cuisines, while our specially designed Kids' Club ensures memorable experiences for our younger guests. Whether you're seeking romantic seclusion, family adventure, or cultural immersion, Le Meridien Ile Maurice provides the perfect setting for an unforgettable island getaway.",
    "2-cancellation": "Free cancellation up to 45 days before arrival",
    "2-checkInOut": "Check-in: 3:00 PM, Check-out: 12:00 PM"
  },
  currencySettings: [
    {
      id: 1,
      code: "EUR",
      name: "Euro",
      symbol: "€",
      isActive: true,
      decimals: 2
    },
    {
      id: 2,
      code: "GBP",
      name: "British Pound",
      symbol: "£",
      isActive: true,
      decimals: 2
    },
    {
      id: 3,
      code: "CHF",
      name: "Swiss Franc",
      symbol: "CHF",
      isActive: true,
      decimals: 2
    }
  ]
};

export const appliedRatesExamples = [
  {
    // Example 1: Standard Room with Summer Early Bird
    id: 101,
    name: "Standard Sea View - Summer 2024 (with Early Bird)",
    marketId: 1,
    seasonId: 1,
    roomTypeId: 1,
    contractId: 1,
    hotelId: 1,
    currency: "EUR",
    baseRate: 350,
    amount: 297.50,
    extraAdult: 80,
    extraChild: 40,
    singleOccupancy: 300,
    supplements: {
      extraAdult: 80,
      extraChild: 40,
      singleOccupancy: 300,
      mealPlan: {
        HB: 45,
        FB: 80
      }
    },
    specialOffers: [
      {
        id: 1,
        code: "SUMMER2024",
        name: "Summer Early Bird",
        type: "combinable",
        description: "Book early for summer 2024 and save up to 25%",
        discountType: "percentage",
        discountValues: [
          { nights: 3, value: 15 }
        ],
        startDate: "2024-01-01",
        endDate: "2024-05-31",
        appliedDiscount: {
          value: 15,
          amountOff: 52.50
        }
      }
    ],
    bookingDates: {
      checkIn: "2024-06-15",
      checkOut: "2024-06-18",
      nights: 3
    },
    isActive: true
  },
  {
    // Example 2: Deluxe Room with Family Package and Long Stay
    id: 102,
    name: "Deluxe Ocean View - Family Summer (with Family Package + Long Stay)",
    marketId: 1,
    seasonId: 1,
    roomTypeId: 2,
    contractId: 1,
    hotelId: 1,
    currency: "EUR",
    baseRate: 550,
    amount: 367.50,
    extraAdult: 100,
    extraChild: 50,
    singleOccupancy: 470,
    supplements: {
      extraAdult: 100,
      extraChild: 50,
      singleOccupancy: 470,
      mealPlan: {
        HB: 45,
        FB: 80
      }
    },
    specialOffers: [
      {
        id: 2,
        code: "FAMILY2024",
        name: "Family Package",
        type: "cumulative",
        description: "Special rates for families with children",
        discountType: "fixed",
        discountValues: [
          { nights: 7, value: 200 }
        ],
        startDate: "2024-04-01",
        endDate: "2024-10-31",
        appliedDiscount: {
          value: 200,
          amountOff: 200,
          additionalBenefits: ["Free meals for children", "Kids club access"]
        }
      },
      {
        id: 3,
        code: "LONGSTAY2024",
        name: "Long Stay Discount",
        type: "combinable",
        description: "Special discounts for stays of 7 nights or more",
        discountType: "percentage",
        discountValues: [
          { nights: 7, value: 15 }
        ],
        startDate: "2024-04-01",
        endDate: "2024-10-31",
        appliedDiscount: {
          value: 15,
          amountOff: 82.50
        }
      }
    ],
    bookingDates: {
      checkIn: "2024-06-20",
      checkOut: "2024-06-27",
      nights: 7
    },
    isActive: true
  },
  {
    // Example 3: Winter Rate with Half Board and Winter Escape
    id: 103,
    name: "Standard Sea View - Winter 2024 (with HB and Winter Escape)",
    marketId: 1,
    seasonId: 2,
    roomTypeId: 1,
    contractId: 1,
    hotelId: 1,
    currency: "EUR",
    baseRate: 250,
    amount: 265.50,
    extraAdult: 60,
    extraChild: 30,
    singleOccupancy: 200,
    supplements: {
      extraAdult: 60,
      extraChild: 30,
      singleOccupancy: 200,
      mealPlan: {
        HB: 45,
        FB: 80
      }
    },
    specialOffers: [
      {
        id: 4,
        code: "WINTER2024",
        name: "Winter Escape",
        type: "cumulative",
        description: "Special winter rates with flexible cancellation",
        discountType: "percentage",
        discountValues: [
          { nights: 3, value: 10 }
        ],
        startDate: "2024-11-01",
        endDate: "2024-12-20",
        appliedDiscount: {
          value: 10,
          amountOff: 29.50,
          includedBenefits: ["Free cancellation", "Daily breakfast"]
        }
      }
    ],
    bookingDates: {
      checkIn: "2024-11-15",
      checkOut: "2024-11-18",
      nights: 3
    },
    selectedMealPlan: {
      code: "HB",
      name: "Half Board",
      supplement: 45
    },
    isActive: true
  }
];

// Constantes
export const MEAL_PLAN_TYPES: MealPlanType[] = [
  'RO',   // Room Only
  'BB',   // Bed & Breakfast
  'HB',   // Half Board
  'FB',   // Full Board
  'AI',   // All Inclusive
  'UAI'   // Ultra All Inclusive
];

// Configuration des devises
export const currencySettings: CurrencySetting[] = [
  { id: 1, code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, isActive: false },
  { id: 2, code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, isActive: false },
  { id: 3, code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2, isActive: false },
  { id: 4, code: 'MUR', symbol: 'Rs', name: 'Mauritian Rupee', decimals: 2, isActive: false },
  { id: 5, code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimals: 2, isActive: false }
];