// Types et interfaces
export interface Hotel {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  ageCategories?: AgeCategory[];
  rooms?: RoomType[];
  seasons?: Season[];
  contracts?: Contract[];
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  policies: HotelPolicies;
  features: HotelFeatures;
  images: string[];
  description: string;
  contactInfo: ContactInfo;
}

export interface AgeCategory {
  id: number;
  type: 'adult' | 'child' | 'infant' | 'teen';
  label: string;
  minAge: number;
  maxAge: number;
  defaultRate: number;
}

export interface RoomType {
  id: number;
  type: string;
  name: string;
  description: string;
  location: string;
  maxOccupancy: {
    adults: number;
    children: number;
    infants: number;
  };
  amenities: string[];
  size: number;
  images: string[];
  bedConfiguration: BedConfig[];
  rates?: Rate[];
}

export interface BedConfig {
  type: string;
  count: number;
}

export interface Season {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  periods: Period[];
}

export interface Period {
  id: number;
  startDate: string;
  endDate: string;
  mlos: number;
  description?: string;
  isBlackout?: boolean;
}

export interface Contract {
  id: number;
  hotelId: number;
  marketId: number;
  seasonId: number;
  roomTypeId: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'draft' | 'expired';
  rateType: 'public' | 'private';
  terms: ContractTerms;
  validFrom: Date;
  validTo: Date;
  rates: Rate[];
}

export interface ContractTerms {
  cancellationPolicy: CancellationPolicy[];
  paymentTerms: string;
  commission: number;
  specialConditions?: string[];
}

export interface CancellationPolicy {
  daysBeforeArrival: number;
  charge: number;
}

export interface Rate {
  id: number;
  name: string;
  marketId: number;
  seasonId: number;
  roomTypeId: number;
  contractId: number;
  currency: string;
  amount: number;
  baseRate: number;
  extraAdult: number;
  extraChild: number;
  singleOccupancy: number | null; // Peut être null si non applicable
  supplements: {
    extraAdult: number;
    extraChild: number;
    singleOccupancy: number | null;
  };
  ageCategoryRates: Record<string, number>;
  mealPlanId?: string;
  specialOffers: SpecialOffer[];
}

export interface SpecialOffer {
  id: number;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  conditions?: string[];
}

export interface Market {
  id: number;
  name: string;
  code: string;
  currency: string;
  region: string;
  isActive: boolean;
}

export interface MarketGroup {
  id: number;
  code: string;
  name: string;
  description?: string;
  defaultCurrency: string;
  markets: Market[];
}

export interface HotelPolicies {
  cancellation: string;
  checkIn: string;
  checkOut: string;
  childPolicy: string;
  petPolicy: string;
  dressCode: string;
}

export interface HotelFeatures {
  restaurants: Restaurant[];
  spa: Spa;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  dressCode: string;
  openingHours: string;
  description: string;
}

export interface Spa {
  name: string;
  treatments: string[];
  openingHours: string;
  description: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
}

// Données d'exemple
export const sampleData = {
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
      address: "Village Hall Lane, Pointe aux Piments",
      city: "Pointe aux Piments",
      country: "Mauritius",
      rating: 5,
      ageCategories: [
        {
          id: 1,
          type: "adult",
          label: "Adult",
          minAge: 18,
          maxAge: 999,
          defaultRate: 100
        },
        {
          id: 2,
          type: "teen",
          label: "Teen",
          minAge: 13,
          maxAge: 17,
          defaultRate: 75
        },
        {
          id: 3,
          type: "child",
          label: "Child",
          minAge: 2,
          maxAge: 12,
          defaultRate: 50
        },
        {
          id: 4,
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
          type: "Superior",
          name: "Superior Ocean View",
          description: "Elegant room with direct ocean view",
          location: "Main Wing",
          maxOccupancy: {
            adults: 2,
            children: 2,
            infants: 1
          },
          amenities: ["WiFi", "Air Conditioning", "Mini Bar", "Ocean View", "Private Balcony"],
          size: 30,
          images: ["superior1.jpg", "superior2.jpg"],
          bedConfiguration: [
            { type: "King", count: 1 }
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
      currency: "EUR",
      region: "Europe",
      isActive: true
    },
    {
      id: 2,
      name: "United Kingdom",
      code: "UK",
      currency: "GBP",
      region: "Europe",
      isActive: false
    },
    {
      id: 3,
      name: "Germany",
      code: "DE",
      currency: "EUR",
      region: "Europe",
      isActive: false
    },
    {
      id: 4,
      name: "India",
      code: "IN",
      currency: "INR",
      region: "Asia",
      isActive: true
    }
  ],
  marketGroups: [
    {
      id: 1,
      code: "EUR",
      name: "Europe",
      description: "European Markets",
      defaultCurrency: "EUR",
      markets: [
        {
          id: 1,
          name: "France",
          code: "FR",
          currency: "EUR",
          region: "Europe",
          isActive: true
        },
        {
          id: 2,
          name: "United Kingdom",
          code: "UK",
          currency: "GBP",
          region: "Europe",
          isActive: false
        },
        {
          id: 3,
          name: "Germany",
          code: "DE",
          currency: "EUR",
          region: "Europe",
          isActive: false
        }
      ]
    },
    {
      id: 2,
      code: "ASIA",
      name: "Asia",
      description: "Asian Markets",
      defaultCurrency: "USD",
      markets: [
        {
          id: 4,
          name: "India",
          code: "IN",
          currency: "INR",
          region: "Asia",
          isActive: true
        }
      ]
    }
  ],
  seasons: {
    "1": [
      {
        id: 1,
        name: "Summer 2024",
        description: "Peak summer season",
        isActive: true,
        periods: [
          {
            id: 1,
            startDate: "2024-06-01",
            endDate: "2024-07-15",
            mlos: 3,
            description: "Early Summer Period"
          },
          {
            id: 2,
            startDate: "2024-07-16",
            endDate: "2024-08-31",
            mlos: 5,
            description: "Peak Summer Period",
            isBlackout: false
          },
          {
            id: 3,
            startDate: "2024-08-15",
            endDate: "2024-08-20",
            mlos: 7,
            description: "Summer Festival Period",
            isBlackout: true
          }
        ]
      },
      {
        id: 2,
        name: "Winter 2024",
        description: "Winter holiday season",
        isActive: true,
        periods: [
          {
            id: 4,
            startDate: "2024-12-01",
            endDate: "2024-12-19",
            mlos: 2,
            description: "Early Winter Period"
          },
          {
            id: 5,
            startDate: "2024-12-20",
            endDate: "2025-01-05",
            mlos: 7,
            description: "Christmas and New Year Period",
            isBlackout: false
          },
          {
            id: 6,
            startDate: "2025-01-06",
            endDate: "2025-02-28",
            mlos: 3,
            description: "Winter Sports Period"
          }
        ]
      }
    ],
    "2": [
      {
        id: 3,
        name: "Summer 2024 - Mauritius",
        description: "Peak tourist season",
        isActive: true,
        periods: [
          {
            id: 7,
            startDate: "2024-07-01",
            endDate: "2024-08-15",
            mlos: 4,
            description: "Early Peak Season"
          },
          {
            id: 8,
            startDate: "2024-08-16",
            endDate: "2024-09-30",
            mlos: 5,
            description: "Late Summer Period"
          },
          {
            id: 9,
            startDate: "2024-12-20",
            endDate: "2025-01-10",
            mlos: 7,
            description: "Holiday Period",
            isBlackout: true
          }
        ]
      }
    ]
  },
  contracts: {
    "1": [
      {
        id: 1,
        hotelId: 1,
        marketId: 1,
        seasonId: 1,
        roomTypeId: 1,
        name: "Summer Contract 2024 - France",
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        status: "active" as 'active' | 'draft' | 'expired',
        rateType: "public" as 'public' | 'private',
        validFrom: new Date("2024-06-01"),
        validTo: new Date("2024-08-31"),
        terms: {
          cancellationPolicy: [
            {
              daysBeforeArrival: 30,
              charge: 0
            },
            {
              daysBeforeArrival: 14,
              charge: 50
            }
          ],
          paymentTerms: "30% deposit required at booking",
          commission: 15
        },
        rates: [
          {
            id: 1,
            name: "Standard Room Summer Rate - France",
            marketId: 1,
            seasonId: 1,
            roomTypeId: 1,
            contractId: 1,
            currency: "EUR",
            amount: 200,
            baseRate: 200,
            extraAdult: 50,
            extraChild: 25,
            singleOccupancy: -30,
            supplements: {
              extraAdult: 50,
              extraChild: 25,
              singleOccupancy: -30
            },
            ageCategoryRates: {
              adult: 200,
              teen: 150,
              child: 100,
              infant: 0
            },
            specialOffers: []
          }
        ]
      },
      {
        id: 2,
        hotelId: 1,
        marketId: 2,
        seasonId: 1,
        roomTypeId: 2,
        name: "Summer Deluxe Contract 2024 - UK",
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        status: "active" as 'active' | 'draft' | 'expired',
        rateType: "private" as 'public' | 'private',
        validFrom: new Date("2024-06-01"),
        validTo: new Date("2024-08-31"),
        terms: {
          cancellationPolicy: [
            {
              daysBeforeArrival: 45,
              charge: 0
            },
            {
              daysBeforeArrival: 30,
              charge: 25
            },
            {
              daysBeforeArrival: 14,
              charge: 75
            }
          ],
          paymentTerms: "50% deposit required at booking",
          commission: 20
        },
        rates: [
          {
            id: 2,
            name: "Deluxe Room Summer Rate - UK",
            marketId: 2,
            seasonId: 1,
            roomTypeId: 2,
            contractId: 2,
            currency: "GBP",
            amount: 300,
            baseRate: 300,
            extraAdult: 75,
            extraChild: 40,
            singleOccupancy: -45,
            supplements: {
              extraAdult: 75,
              extraChild: 40,
              singleOccupancy: -45
            },
            ageCategoryRates: {
              adult: 300,
              teen: 225,
              child: 150,
              infant: 0
            },
            specialOffers: []
          }
        ]
      }
    ]
  },
  rooms: {
    "1": [
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
    "2": [
      {
        id: 1,
        type: "Superior",
        name: "Superior Ocean View",
        description: "Elegant room with direct ocean view",
        location: "Main Wing",
        maxOccupancy: {
          adults: 2,
          children: 2,
          infants: 1
        },
        amenities: ["WiFi", "Air Conditioning", "Mini Bar", "Ocean View", "Private Balcony"],
        size: 30,
        images: ["superior1.jpg", "superior2.jpg"],
        bedConfiguration: [
          { type: "King", count: 1 }
        ]
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
      symbol: "€",
      name: "Euro",
      decimals: 2,
      isActive: false
    },
    {
      id: 2,
      code: "USD",
      symbol: "$",
      name: "US Dollar",
      decimals: 2,
      isActive: false
    },
    {
      id: 3,
      code: "GBP",
      symbol: "£",
      name: "British Pound",
      decimals: 2,
      isActive: false
    },
    {
      id: 4,
      code: "INR",
      symbol: "₹",
      name: "Indian Rupee",
      decimals: 2,
      isActive: false
    },
    {
      id: 5,
      code: "CNY",
      symbol: "¥",
      name: "Chinese Yuan",
      decimals: 2,
      isActive: false
    }
  ],
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
  }
};

// Constantes
export const MEAL_PLAN_TYPES = [
  'RO',   // Room Only
  'BB',   // Bed & Breakfast
  'BB+',  // Bed & Breakfast Plus
  'HB',   // Half Board
  'HB+',  // Half Board Plus
  'FB',   // Full Board
  'FB+',  // Full Board Plus
  'AI',   // All Inclusive
  'AI+'   // All Inclusive Plus
] as const;

export type MealPlanType = typeof MEAL_PLAN_TYPES[number];

// Configuration des devises
export interface CurrencySetting {
  id: number;
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  isActive: boolean;
}

export const currencySettings: CurrencySetting[] = [
  { id: 1, code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, isActive: false },
  { id: 2, code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, isActive: false },
  { id: 3, code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2, isActive: false },
  { id: 4, code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2, isActive: false },
  { id: 5, code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2, isActive: false }
];