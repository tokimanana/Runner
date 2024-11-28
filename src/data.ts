import { Hotel, Market, Contract, CurrencySetting, MealPlanType, MarketGroup, Season } from './app/models/types';

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
        name: "Summer 2024 - France",
        startDate: "2024-05-01",
        endDate: "2024-09-30",
        marketId: 1,
        seasonId: 1,
        status: "active",
        rateType: "public",
        terms: {
          cancellationPolicy: [
            { daysBeforeArrival: 7, charge: 100 },
            { daysBeforeArrival: 14, charge: 50 }
          ],
          paymentTerms: "30 days before arrival",
          commission: 15,
          specialConditions: []
        },
        validFrom: new Date("2024-05-01"),
        validTo: new Date("2024-09-30"),
        rates: [
          {
            id: 1,
            name: "Standard BB Rate",
            roomTypeId: 1,
            mealPlanId: "BB",
            seasonId: 1,
            marketId: 1,
            contractId: 1,
            currency: "EUR",
            amount: 200,
            baseRate: 200,
            extraAdult: 80,
            extraChild: 40,
            singleOccupancy: 160,
            supplements: {
              extraAdult: 80,
              extraChild: 40,
              singleOccupancy: 160
            },
            ageCategoryRates: {},
            specialOffers: []
          },
          {
            id: 2,
            name: "Standard HB Rate",
            roomTypeId: 1,
            mealPlanId: "HB",
            seasonId: 1,
            marketId: 1,
            contractId: 1,
            currency: "EUR",
            amount: 250,
            baseRate: 250,
            extraAdult: 100,
            extraChild: 50,
            singleOccupancy: 200,
            supplements: {
              extraAdult: 100,
              extraChild: 50,
              singleOccupancy: 200
            },
            ageCategoryRates: {},
            specialOffers: []
          },
          {
            id: 3,
            name: "Deluxe BB Rate",
            roomTypeId: 2,
            mealPlanId: "BB",
            seasonId: 1,
            marketId: 1,
            contractId: 1,
            currency: "EUR",
            amount: 300,
            baseRate: 300,
            extraAdult: 120,
            extraChild: 60,
            singleOccupancy: 240,
            supplements: {
              extraAdult: 120,
              extraChild: 60,
              singleOccupancy: 240
            },
            ageCategoryRates: {},
            specialOffers: []
          },
          {
            id: 4,
            name: "Deluxe HB Rate",
            roomTypeId: 2,
            mealPlanId: "HB",
            seasonId: 1,
            marketId: 1,
            contractId: 1,
            currency: "EUR",
            amount: 350,
            baseRate: 350,
            extraAdult: 140,
            extraChild: 70,
            singleOccupancy: 280,
            supplements: {
              extraAdult: 140,
              extraChild: 70,
              singleOccupancy: 280
            },
            ageCategoryRates: {},
            specialOffers: []
          }
        ]
      },
      {
        id: 2,
        hotelId: 1,
        name: "Winter 2024 - France",
        startDate: "2024-10-01",
        endDate: "2025-04-30",
        marketId: 1,
        seasonId: 2,
        status: "active",
        rateType: "public",
        terms: {
          cancellationPolicy: [
            { daysBeforeArrival: 7, charge: 100 },
            { daysBeforeArrival: 14, charge: 50 }
          ],
          paymentTerms: "30 days before arrival",
          commission: 15,
          specialConditions: []
        },
        validFrom: new Date("2024-10-01"),
        validTo: new Date("2025-04-30"),
        rates: [
          {
            id: 5,
            name: "Standard BB Winter Rate",
            roomTypeId: 1,
            mealPlanId: "BB",
            seasonId: 2,
            marketId: 1,
            contractId: 2,
            currency: "EUR",
            amount: 180,
            baseRate: 180,
            extraAdult: 70,
            extraChild: 35,
            singleOccupancy: 145,
            supplements: {
              extraAdult: 70,
              extraChild: 35,
              singleOccupancy: 145
            },
            ageCategoryRates: {},
            specialOffers: []
          },
          {
            id: 6,
            name: "Deluxe BB Winter Rate",
            roomTypeId: 2,
            mealPlanId: "BB",
            seasonId: 2,
            marketId: 1,
            contractId: 2,
            currency: "EUR",
            amount: 270,
            baseRate: 270,
            extraAdult: 110,
            extraChild: 55,
            singleOccupancy: 220,
            supplements: {
              extraAdult: 110,
              extraChild: 55,
              singleOccupancy: 220
            },
            ageCategoryRates: {},
            specialOffers: []
          }
        ]
      }
    ],
    2: [
      {
        id: 3,
        hotelId: 2,
        name: "High Season 2024 - UK Market",
        startDate: "2024-01-01",
        endDate: "2024-04-30",
        marketId: 2,
        seasonId: 3,
        status: "active",
        rateType: "public",
        terms: {
          cancellationPolicy: [
            { daysBeforeArrival: 14, charge: 100 },
            { daysBeforeArrival: 30, charge: 50 }
          ],
          paymentTerms: "45 days before arrival",
          commission: 20,
          specialConditions: ["Free airport transfer for stays of 7+ nights"]
        },
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2024-04-30"),
        rates: [
          {
            id: 7,
            name: "Ocean View BB Rate",
            roomTypeId: 3,
            mealPlanId: "BB",
            seasonId: 3,
            marketId: 2,
            contractId: 3,
            currency: "GBP",
            amount: 450,
            baseRate: 450,
            extraAdult: 150,
            extraChild: 75,
            singleOccupancy: 380,
            supplements: {
              extraAdult: 150,
              extraChild: 75,
              singleOccupancy: 380
            },
            ageCategoryRates: {},
            specialOffers: [
              {
                id: 1,
                name: "Early Bird Discount",
                description: "15% off for bookings made 90 days in advance",
                discountType: "percentage",
                discountValue: 15,
                startDate: "2024-01-01",
                endDate: "2024-04-30",
                conditions: ["Must be booked 90 days before arrival"]
              }
            ]
          },
          {
            id: 8,
            name: "Ocean View HB Rate",
            roomTypeId: 3,
            mealPlanId: "HB",
            seasonId: 3,
            marketId: 2,
            contractId: 3,
            currency: "GBP",
            amount: 550,
            baseRate: 550,
            extraAdult: 180,
            extraChild: 90,
            singleOccupancy: 470,
            supplements: {
              extraAdult: 180,
              extraChild: 90,
              singleOccupancy: 470
            },
            ageCategoryRates: {},
            specialOffers: []
          }
        ]
      },
      {
        id: 4,
        hotelId: 2,
        name: "Low Season 2024 - UK Market",
        startDate: "2024-05-01",
        endDate: "2024-12-31",
        marketId: 2,
        seasonId: 4,
        status: "active",
        rateType: "public",
        terms: {
          cancellationPolicy: [
            { daysBeforeArrival: 7, charge: 100 },
            { daysBeforeArrival: 14, charge: 50 }
          ],
          paymentTerms: "30 days before arrival",
          commission: 15,
          specialConditions: []
        },
        validFrom: new Date("2024-05-01"),
        validTo: new Date("2024-12-31"),
        rates: [
          {
            id: 9,
            name: "Ocean View BB Low Season",
            roomTypeId: 3,
            mealPlanId: "BB",
            seasonId: 4,
            marketId: 2,
            contractId: 4,
            currency: "GBP",
            amount: 350,
            baseRate: 350,
            extraAdult: 120,
            extraChild: 60,
            singleOccupancy: 300,
            supplements: {
              extraAdult: 120,
              extraChild: 60,
              singleOccupancy: 300
            },
            ageCategoryRates: {},
            specialOffers: [
              {
                id: 2,
                name: "Stay Longer Special",
                description: "20% off for stays of 7 nights or more",
                discountType: "percentage",
                discountValue: 20,
                startDate: "2024-05-01",
                endDate: "2024-12-31",
                conditions: ["Minimum stay of 7 nights required"]
              }
            ]
          },
          {
            id: 10,
            name: "Ocean View HB Low Season",
            roomTypeId: 3,
            mealPlanId: "HB",
            seasonId: 4,
            marketId: 2,
            contractId: 4,
            currency: "GBP",
            amount: 450,
            baseRate: 450,
            extraAdult: 150,
            extraChild: 75,
            singleOccupancy: 380,
            supplements: {
              extraAdult: 150,
              extraChild: 75,
              singleOccupancy: 380
            },
            ageCategoryRates: {},
            specialOffers: []
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
            mlos: 2,
            description: "Early Summer"
          },
          {
            id: 2,
            startDate: "2024-07-01",
            endDate: "2024-08-31",
            mlos: 3,
            description: "Peak Summer"
          },
          {
            id: 3,
            startDate: "2024-09-01",
            endDate: "2024-09-30",
            mlos: 2,
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
            endDate: "2024-12-19",
            mlos: 2,
            description: "Early Winter"
          },
          {
            id: 5,
            startDate: "2024-12-20",
            endDate: "2025-01-05",
            mlos: 4,
            description: "Holiday Season"
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
        startDate: "2024-01-01",
        endDate: "2024-04-30",
        isActive: true,
        periods: [
          {
            id: 7,
            startDate: "2024-01-01",
            endDate: "2024-02-29",
            mlos: 3,
            description: "Peak Season"
          },
          {
            id: 8,
            startDate: "2024-03-01",
            endDate: "2024-04-30",
            mlos: 2,
            description: "Late High Season"
          }
        ]
      },
      {
        id: 4,
        name: "Low Season 2024",
        startDate: "2024-05-01",
        endDate: "2024-12-31",
        isActive: true,
        periods: [
          {
            id: 9,
            startDate: "2024-05-01",
            endDate: "2024-09-30",
            mlos: 2,
            description: "Low Season"
          },
          {
            id: 10,
            startDate: "2024-10-01",
            endDate: "2024-12-31",
            mlos: 3,
            description: "Shoulder Season"
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
  { id: 4, code: 'MUR', symbol: 'Rs', name: 'Mauritian Rupee', decimals: 2, isActive: false }
];