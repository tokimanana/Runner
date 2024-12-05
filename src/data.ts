import { 
  Hotel, 
  Market, 
  MarketGroup,
  CurrencySetting,
  Season,
  Contract,
  MealPlan,
  MarketMealPlanRate,
  AgeCategory,
  Rate,
  RoomType,
  Period,
  SpecialOffer,
  HotelPolicies,
  HotelCapacity,
  RoomInventory,
  MealPlanType,
  ContractTerms,
  Restaurant,
  Spa
} from './app/models/types';

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

// Constants
export const MEAL_PLAN_TYPES: MealPlanType[] = [
  'RO',   // Room Only
  'BB',   // Bed & Breakfast
  'HB',   // Half Board
  'FB',   // Full Board
  'AI',   // All Inclusive
  'UAI'   // Ultra All Inclusive
];

// Currency settings
export const currencySettings: CurrencySetting[] = [
  { 
    id: 1, 
    code: 'EUR', 
    symbol: '€', 
    name: 'Euro',
    decimals: 2,
    isActive: true
  },
  { 
    id: 2, 
    code: 'USD', 
    symbol: '$', 
    name: 'US Dollar',
    decimals: 2,
    isActive: true
  },
  { 
    id: 3, 
    code: 'GBP', 
    symbol: '£', 
    name: 'British Pound',
    decimals: 2,
    isActive: true
  },
  { 
    id: 4, 
    code: 'MUR', 
    symbol: 'Rs', 
    name: 'Mauritian Rupee',
    decimals: 2,
    isActive: true
  },
  { 
    id: 5, 
    code: 'CHF', 
    symbol: 'CHF', 
    name: 'Swiss Franc',
    decimals: 2,
    isActive: true
  }
];

// Market definitions and generation
export const defaultMarkets: Market[] = [
  {
    id: 1,
    name: "France",
    code: "FR",
    isActive: true,
    currency: "EUR",
    region: "Europe",
    description: "French market including overseas territories"
  },
  {
    id: 2,
    name: "United Kingdom",
    code: "UK",
    isActive: true,
    currency: "GBP",
    region: "Europe",
    description: "UK and Ireland market"
  },
  {
    id: 3,
    name: "Germany",
    code: "DE",
    isActive: true,
    currency: "EUR",
    region: "Europe",
    description: "German-speaking market"
  },
  {
    id: 4,
    name: "United States",
    code: "US",
    isActive: true,
    currency: "USD",
    region: "North America",
    description: "US market"
  },
  {
    id: 5,
    name: "Canada",
    code: "CA",
    isActive: true,
    currency: "USD",
    region: "North America",
    description: "Canadian market"
  },
  {
    id: 6,
    name: "Japan",
    code: "JP",
    isActive: true,
    currency: "USD",
    region: "Asia",
    description: "Japanese market"
  },
  {
    id: 7,
    name: "China",
    code: "CN",
    isActive: true,
    currency: "USD",
    region: "Asia",
    description: "Chinese market"
  }
];

// Market Groups
export const defaultMarketGroups: MarketGroup[] = [
  {
    id: 1,
    name: 'European Markets',
    region: 'Europe',
    markets: [1, 2, 3],
    defaultCurrency: 'EUR',
    description: 'Markets in the European region',
    isActive: true
  },
  {
    id: 2,
    name: 'North American Markets',
    region: 'North America',
    markets: [4, 5],
    defaultCurrency: 'USD',
    description: 'Markets in North America',
    isActive: true
  },
  {
    id: 3,
    name: 'Asian Markets',
    region: 'Asia',
    markets: [6, 7],
    defaultCurrency: 'USD',
    description: 'Markets in the Asian region',
    isActive: true
  }
];

// Seasons with string dates instead of Date objects
export const defaultSeasons: Season[] = [
  {
    id: 1,
    name: "Summer 2024",
    description: "Peak summer season",
    isActive: true,
    periods: [
      {
        id: 1,
        seasonId: 1,
        name: "Early Summer",
        startDate: "2024-05-01",
        endDate: "2024-06-14",
        mlos: 3,
        description: "Early summer period with moderate rates"
      },
      {
        id: 2,
        seasonId: 1,
        name: "Peak Summer",
        startDate: "2024-06-15",
        endDate: "2024-09-15",
        mlos: 5,
        description: "Peak summer period with premium rates"
      },
      {
        id: 3,
        seasonId: 1,
        name: "Late Summer",
        startDate: "2024-09-16",
        endDate: "2024-10-31",
        mlos: 3,
        description: "Late summer period with moderate rates"
      }
    ]
  },
  {
    id: 2,
    name: "Winter 2024",
    description: "Winter season",
    isActive: true,
    periods: [
      {
        id: 1,
        seasonId: 2,
        name: "Christmas Period",
        startDate: "2024-12-01",
        endDate: "2024-12-31",
        mlos: 4,
        description: "Christmas period with special rates"
      }
    ]
  }
];

// Add seasons for Maldives Paradise Resort
export const maldivesSeasons: Season[] = [
  {
    id: 1,
    name: 'Peak Season',
    description: 'December to April - Dry Season',
    isActive: true,
    periods: [
      {
        id: 1,
        seasonId: 1,
        name: 'Early Peak Season',
        startDate: '2023-12-01',
        endDate: '2023-12-22',
        mlos: 3,
        isBlackout: false
      },
      {
        id: 2,
        seasonId: 1,
        name: 'Christmas and New Year Period',
        startDate: '2023-12-23',
        endDate: '2024-01-05',
        mlos: 7,
        isBlackout: false,
        description: 'Christmas and New Year Period'
      },
      {
        id: 3,
        seasonId: 1,
        name: 'Late Peak Season',
        startDate: '2024-01-06',
        endDate: '2024-02-09',
        mlos: 3,
        isBlackout: false
      },
      {
        id: 4,
        seasonId: 1,
        name: 'Chinese New Year Period',
        startDate: '2024-02-10',
        endDate: '2024-02-24',
        mlos: 5,
        isBlackout: false,
        description: 'Chinese New Year Period'
      },
      {
        id: 5,
        seasonId: 1,
        name: 'Late Peak Season',
        startDate: '2024-02-25',
        endDate: '2024-04-30',
        mlos: 3,
        isBlackout: false
      }
    ]
  },
  {
    id: 2,
    name: 'Low Season',
    description: 'May to July - Early Monsoon',
    isActive: true,
    periods: [
      {
        id: 6,
        seasonId: 2,
        name: 'Early Low Season',
        startDate: '2024-05-01',
        endDate: '2024-05-31',
        mlos: 2,
        isBlackout: false,
        description: 'Early Low Season'
      },
      {
        id: 7,
        seasonId: 2,
        name: 'June Promotion',
        startDate: '2024-06-01',
        endDate: '2024-06-30',
        mlos: 3,
        isBlackout: false,
        description: 'June Promotion'
      },
      {
        id: 8,
        seasonId: 2,
        name: 'Late Low Season',
        startDate: '2024-07-01',
        endDate: '2024-07-31',
        mlos: 2,
        isBlackout: false
      }
    ]
  },
  {
    id: 3,
    name: 'Shoulder Season',
    description: 'August to November - Late Monsoon',
    isActive: true,
    periods: [
      {
        id: 9,
        seasonId: 3,
        name: 'Early Shoulder Season',
        startDate: '2024-08-01',
        endDate: '2024-09-15',
        mlos: 2,
        isBlackout : false,
        description: 'Early Shoulder Season'
      },
      {
        id: 10,
        seasonId: 3,
        name: 'Fall Promotion',
        startDate: '2024-09-16',
        endDate: '2024-10-31',
        mlos: 3,
        isBlackout: false,
        description: 'Fall Promotion'
      },
      {
        id: 11,
        seasonId: 3,
        name: 'Late Shoulder Season',
        startDate: '2024-11-01',
        endDate: '2024-11-15',
        mlos: 2,
        isBlackout: false
      },
      {
        id: 12,
        seasonId: 3,
        name: 'Pre-Peak Season',
        startDate: '2024-11-16',
        endDate: '2024-11-30',
        mlos: 3,
        isBlackout: false,
        description: 'Pre-Peak Season'
      }
    ]
  }
];

// Meal plan definitions
export const defaultMealPlans: MealPlanData[] = [
  {
    id: 1,
    name: "Bed & Breakfast",
    code: "BB",
    description: "Includes breakfast daily"
  },
  {
    id: 2,
    name: "Half Board",
    code: "HB",
    description: "Includes breakfast and dinner daily"
  },
  {
    id: 3,
    name: "Full Board",
    code: "FB",
    description: "Includes breakfast, lunch and dinner daily"
  }
];

// Age Categories
export const ageCategories: AgeCategory[] = [
  {
    id: 1,
    name: 'Adult',
    type: 'adult',
    label: 'Adult',
    minAge: 12,
    maxAge: 100,
    description: 'Standard adult rate',
    defaultRate: 0,
    isActive: true
  },
  {
    id: 2,
    name: 'Child',
    type: 'child',
    label: 'Child',
    minAge: 2,
    maxAge: 11,
    description: 'Standard child rate',
    defaultRate: 0,
    isActive: true
  },
  {
    id: 3,
    name: 'Infant',
    type: 'infant',
    label: 'Infant',
    minAge: 0,
    maxAge: 1,
    description: 'Standard infant rate',
    defaultRate: 0,
    isActive: true
  }
];

// Special offers
export const defaultSpecialOffers: SpecialOffer[] = [
  {
    id: 1,
    code: "SUMMER2024",
    name: "Summer Early Booking",
    type: "combinable",
    description: "Early booking discount for summer 2024",
    discountType: "percentage",
    discountValues: [
      {
        nights: 7,
        value: 15,
        startDate: "2024-06-01",
        endDate: "2024-08-31"
      }
    ],
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    conditions: [
      "Must book 60 days in advance",
      "Non-refundable"
    ],
    minimumNights: 7,
    bookingWindow: {
      start: "2024-01-01",
      end: "2024-04-30"
    }
  }
];

// Rates definition
export const defaultRates: Rate[] = [
  {
    id: 1,
    name: "Standard Summer Rate",
    marketId: 1,
    seasonId: 1,
    roomTypeId: 1,
    contractId: 1,
    hotelId: 1,
    periodId: 1,
    rateType: 'per_pax',
    villaRate: null,
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
    // ageCategoryRates: {
    //   "1": 100,
    //   "2": 50,
    //   "3": 0
    // },
    specialOffers: defaultSpecialOffers,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    isActive: true
  }
];

// Applied Rates Examples for the special offers component
export const appliedRatesExamples = [
  {
    id: 1,
    name: "Standard Summer Rate",
    baseRate: 200,
    currency: "EUR",
    amount: 170,
    bookingDates: {
      checkIn: "2024-06-01",
      checkOut: "2024-06-08",
      nights: 7
    },
    selectedMealPlan: {
      name: "Half Board",
      supplement: 30
    },
    specialOffers: [
      {
        name: "Summer Early Booking",
        code: "SUMMER2024",
        type: "combinable",
        description: "Early booking discount for summer 2024",
        discountType: "percentage",
        discountValues: [
          {
            nights: 7,
            value: 15
          }
        ],
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        appliedDiscount: {
          value: 15,
          amountOff: 30,
          additionalBenefits: [
            "Free airport transfer",
            "Welcome drink"
          ]
        }
      }
    ]
  }
];

// Contracts with proper type structure
export const defaultContracts: Contract[] = [
  // Grand Hotel Riveria - Summer Contract for European Market
  {
    id: 1,
    hotelId: 1,
    marketId: 1, // European Market
    seasonId: 1, // Summer Season
    name: "Summer 2024 - European Market",
    status: "draft",
    validFrom: "2024-05-01",
    validTo: "2024-09-30",
    terms: {
      cancellationPolicy: [
        { daysBeforeArrival: 30, charge: 0 },
        { daysBeforeArrival: 14, charge: 30 },
        { daysBeforeArrival: 7, charge: 50 },
        { daysBeforeArrival: 3, charge: 100 }
      ],
      paymentTerms: "30% deposit at booking, full payment 30 days before arrival",
      commission: 15,
      specialConditions: [
        "Minimum stay 3 nights during peak season (July-August)",
        "Group rates available for 10+ rooms",
        "Free airport transfer for stays of 7+ nights",
        "Complimentary spa access for Deluxe rooms"
      ],
      mealPlanTerms: {
        inclusions: ["Breakfast buffet", "Welcome drink", "Afternoon tea"],
        exclusions: ["Room service", "Premium drinks", "Spa treatments"]
      }
    },
    periodRates: [
      {
        periodId: 1,
        startDate: '2024-05-01',
        endDate: '2024-06-30',
        roomTypeId: 1, // Standard Room (2A+1C)
        rateType: 'per_pax',
        baseRates: {
          single: 200,
          double: 150
        },
        supplements: {
          extraAdult: 50,
          child: 25,
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'BB',
            rates: {
              adult: 25,
              child: 13,
              infant: 0
            }
          },
          {
            mealPlanType: 'HB',
            rates: {
              adult: 40,
              child: 20,
              infant: 0
            }
          },
          {
            mealPlanType: 'FB',
            rates: {
              adult: 60,
              child: 30,
              infant: 0
            }
          }
        ]
      },
      {
        periodId: 2,
        startDate: '2024-07-01',
        endDate: '2024-08-31',
        roomTypeId: 2, // Family Suite (3A+2C)
        rateType: 'per_pax',
        baseRates: {
          single: 250,
          double: 180,
          triple: 160
        },
        supplements: {
          extraAdult: 60,
          child: 30,
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'BB',
            rates: {
              adult: 30,
              child: 15,
              infant: 0
            }
          },
          {
            mealPlanType: 'HB',
            rates: {
              adult: 45,
              child: 23,
              infant: 0
            }
          },
          {
            mealPlanType: 'FB',
            rates: {
              adult: 65,
              child: 33,
              infant: 0
            }
          }
        ]
      },
      {
        periodId: 3,
        startDate: '2024-09-01',
        endDate: '2024-10-31',
        roomTypeId: 3, // Deluxe Room (2A+2C)
        rateType: 'per_pax',
        baseRates: {
          single: 220,
          double: 170
        },
        supplements: {
          extraAdult: 85,
          child: 75,
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'RO',    // Room Only
            rates: {
              adult: 0,            // Pas de repas
              child: 0,
              infant: 0
            }
          },
          {
            mealPlanType: 'BB',    // Bed & Breakfast
            rates: {
              adult: 28,           // Petit déjeuner
              child: 14,
              infant: 0
            }
          },
          {
            mealPlanType: 'HB',    // Half Board
            rates: {
              adult: 42,           // Petit déjeuner + Dîner
              child: 21,
              infant: 0
            }
          },
          {
            mealPlanType: 'FB',    // Full Board
            rates: {
              adult: 60,           // Petit déjeuner + Déjeuner + Dîner
              child: 30,
              infant: 0
            }
          },
          {
            mealPlanType: 'AI',    // All Inclusive
            rates: {
              adult: 85,           // Tous les repas + Boissons
              child: 43,
              infant: 0
            }
          }
        ]
      },
      {
        periodId: 4,
        startDate: '2024-11-01',
        endDate: '2024-12-31',
        roomTypeId: 4, // Executive Suite (4A+2C)
        rateType: 'per_pax',
        baseRates: {
          single: 300,
          double: 250,
          triple: 220
        },
        supplements: {
          extraAdult: 120,
          child: 100,
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'BB+',    // Premium Breakfast
            rates: {
              adult: 40,     // Par adulte pour BB+
              child: 20,     // Par enfant pour BB+
              infant: 0
            }
          },
          {
            mealPlanType: 'HB+',    // Premium Half Board
            rates: {
              adult: 65,     // Par adulte pour HB+
              child: 33,     // Par enfant pour HB+
              infant: 0
            }
          },
          {
            mealPlanType: 'FB+',    // Premium Full Board
            rates: {
              adult: 90,     // Par adulte pour FB+
              child: 45,     // Par enfant pour FB+
              infant: 0
            }
          },
          {
            mealPlanType: 'AI',     // All Inclusive
            rates: {
              adult: 120,    // Par adulte pour AI
              child: 60,     // Par enfant pour AI
              infant: 0
            }
          }
        ]
      },
      {
        periodId: 5,
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        roomTypeId: 5, // Villa (4A+2C)
        rateType: 'per_pax',
        baseRates: {
          single: 400,
          double: 350,
          triple: 300,
          quad: 280
        },
        supplements: {
          extraAdult: 150,
          child: 130,
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'BB+',    // Premium Breakfast
            rates: {
              adult: 45,
              child: 23,
              infant: 0
            }
          },
          {
            mealPlanType: 'UAI',
            rates: {
              adult: 120,
              child: 60,
              infant: 0
            }
          }
        ]
      },
      {
        periodId: 6,
        startDate: '2024-07-01',
        endDate: '2024-08-31',
        roomTypeId: 5, // Villa (4A+2C)
        rateType: 'per_unit',
        baseRates: {
          unitRate: 450    // Fixed rate for the villa
        },
        supplements: {
          extraAdult: 0,   // No extra adult charge (included in unit rate)
          child: 0,        // No child supplement (included in unit rate)
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'RO',
            rates: {
              adult: 0,     // No meals, per person
              child: 0,
              infant: 0
            }
          },
          {
            mealPlanType: 'BB',
            rates: {
              adult: 35,    // Breakfast only, per person
              child: 18,
              infant: 0
            }
          },
          {
            mealPlanType: 'HB',
            rates: {
              adult: 55,    // Breakfast + Dinner, per person
              child: 28,
              infant: 0
            }
          },
          {
            mealPlanType: 'FB',
            rates: {
              adult: 75,    // All meals, per person
              child: 38,
              infant: 0
            }
          },
          {
            mealPlanType: 'AI',
            rates: {
              adult: 95,    // All meals + Drinks, per person
              child: 48,
              infant: 0
            }
          }
        ]
      },
      {
        periodId: 7,
        startDate: '2024-09-01',
        endDate: '2024-10-31',
        roomTypeId: 6, // Beach Suite (2A+2C)
        rateType: 'per_unit',
        baseRates: {
          unitRate: 280    // Fixed rate for the suite
        },
        supplements: {
          extraAdult: 0,   // No extra adult charge (included in unit rate)
          child: 0,        // No child supplement (included in unit rate)
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'RO',
            rates: {
              adult: 0,     // No meals, per person
              child: 0,
              infant: 0
            }
          },
          {
            mealPlanType: 'BB+',
            rates: {
              adult: 40,    // Premium Breakfast, per person
              child: 20,
              infant: 0
            }
          },
          {
            mealPlanType: 'HB+',
            rates: {
              adult: 65,    // Premium Half Board, per person
              child: 33,
              infant: 0
            }
          },
          {
            mealPlanType: 'AI',
            rates: {
              adult: 110,   // All Inclusive, per person
              child: 55,
              infant: 0
            }
          }
        ]
      },
      {
        periodId: 6,
        startDate: '2025-04-01',
        endDate: '2025-06-30',
        roomTypeId: 6, // Beach Suite (2A+2C)
        rateType: 'per_pax',
        baseRates: {
          single: 280,
          double: 230
        },
        supplements: {
          extraAdult: 100,
          child: 90,
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'HB+',    // Premium Half Board
            rates: {
              adult: 55,
              child: 28,
              infant: 0
            }
          },
          {
            mealPlanType: 'FB+',    // Premium Full Board
            rates: {
              adult: 80,
              child: 40,
              infant: 0
            }
          },
          {
            mealPlanType: 'AI',
            rates: {
              adult: 100,
              child: 50,
              infant: 0
            }
          }
        ]
      }
    ],
    mealPlanConfig: {
      defaultMealPlan: 'BB',
      includedMealPlans: ['BB', 'HB', 'FB'],
      supplements: {
        'HB': 35,
        'FB': 60
      }
    }
  },
  // Grand Hotel Riveria - Winter Contract for UK Market
  {
    id: 2,
    hotelId: 1,
    marketId: 2, // UK Market
    seasonId: 2, // Winter Season
    name: "Winter 2024-25 - UK Market",
    status: "draft",
    validFrom: "2024-12-01",
    validTo: "2025-03-31",
    terms: {
      cancellationPolicy: [
        { daysBeforeArrival: 45, charge: 0 },
        { daysBeforeArrival: 30, charge: 25 },
        { daysBeforeArrival: 14, charge: 50 },
        { daysBeforeArrival: 7, charge: 100 }
      ],
      paymentTerms: "50% deposit at booking, full payment 45 days before arrival",
      commission: 18,
      specialConditions: [
        "Minimum stay 7 nights during Christmas and New Year (Dec 23 - Jan 2)",
        "Mandatory gala dinner on Dec 24 and Dec 31",
        "Early booking discount: 15% off for bookings made 120+ days in advance",
        "Stay 14+ nights and get free upgrade to next room category"
      ],
      mealPlanTerms: {
        inclusions: [
          "Breakfast buffet",
          "Christmas gala dinner",
          "New Year's Eve gala dinner",
          "Daily afternoon tea"
        ],
        exclusions: ["Room service", "Premium drinks", "Spa treatments"]
      }
    },
    periodRates: [
      {
        periodId: 1,
        startDate: '2024-11-01',
        endDate: '2024-12-20',
        roomTypeId: 1,
        rateType: 'per_pax',
        baseRates: {
          single: 180,
          double: 140,
          triple: 120
        },
        supplements: {
          extraAdult: 70,
          child: 60,
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'BB',
            rates: {
              adult: 25,
              child: 13,
              infant: 0
            }
          },
          {
            mealPlanType: 'HB',
            rates: {
              adult: 40,
              child: 20,
              infant: 0
            }
          },
          {
            mealPlanType: 'FB',
            rates: {
              adult: 60,
              child: 30,
              infant: 0
            }
          }
        ]
      },
      {
        periodId: 2,
        startDate: '2024-12-21',
        endDate: '2025-01-05',
        roomTypeId: 1,
        rateType: 'per_pax',
        baseRates: {
          single: 300,
          double: 220,
          triple: 190
        },
        supplements: {
          extraAdult: 120,
          child: 100,
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'BB',
            rates: {
              adult: 35,
              child: 18,
              infant: 0
            }
          },
          {
            mealPlanType: 'HB',
            rates: {
              adult: 50,
              child: 25,
              infant: 0
            }
          },
          {
            mealPlanType: 'FB',
            rates: {
              adult: 70,
              child: 35,
              infant: 0
            }
          }
        ]
      },
      {
        periodId: 3,
        startDate: '2025-01-06',
        endDate: '2025-02-28',
        roomTypeId: 1,
        rateType: 'per_pax',
        baseRates: {
          single: 200,
          double: 150,
          triple: 130
        },
        supplements: {
          extraAdult: 80,
          child: 70,
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'BB',
            rates: {
              adult: 30,
              child: 15,
              infant: 0
            }
          },
          {
            mealPlanType: 'HB',
            rates: {
              adult: 45,
              child: 23,
              infant: 0
            }
          },
          {
            mealPlanType: 'FB',
            rates: {
              adult: 65,
              child: 33,
              infant: 0
            }
          }
        ]
      }
    ],
    mealPlanConfig: {
      defaultMealPlan: 'HB',
      includedMealPlans: ['BB', 'HB', 'FB'],
      supplements: {
        'BB': -25, // Discount for downgrade to BB
        'FB': 40
      }
    }
  },
  // Maldives Paradise Resort - Peak Season Contract
  {
    id: 3,
    hotelId: 2,
    marketId: 6, // Japanese Market
    seasonId: 1, // Peak Season
    name: "Peak Season 2024-25 - Japanese Market",
    status: "draft",
    validFrom: "2024-12-01",
    validTo: "2025-04-30",
    terms: {
      cancellationPolicy: [
        { daysBeforeArrival: 60, charge: 0 },
        { daysBeforeArrival: 45, charge: 25 },
        { daysBeforeArrival: 30, charge: 50 },
        { daysBeforeArrival: 14, charge: 75 },
        { daysBeforeArrival: 7, charge: 100 }
      ],
      paymentTerms: "25% at booking, 50% 60 days before arrival, 25% 30 days before arrival",
      commission: 20,
      specialConditions: [
        "Minimum stay 5 nights",
        "Complimentary return speedboat transfers for stays of 7+ nights",
        "One complimentary spa treatment per adult for stays of 5+ nights",
        "Free room upgrade subject to availability at check-in",
        "Special honeymoon benefits including romantic dinner and spa treatment"
      ],
      mealPlanTerms: {
        inclusions: [
          "Daily breakfast and dinner",
          "Welcome cocktail",
          "Daily sunset cocktail",
          "Non-motorized water sports"
        ],
        exclusions: [
          "Premium alcohol",
          "Motorized water sports",
          "Spa treatments",
          "Excursions"
        ]
      }
    },
    periodRates: [
      {
        periodId: 1,
        startDate: '2024-05-01',
        endDate: '2024-07-31',
        roomTypeId: 1,
        rateType: 'per_unit',
        baseRates: {
          unitRate: 500
        },
        supplements: {
          extraAdult: 150,
          child: 75,
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'BB',
            roomRates: {
              single: { adult: 40, child: 20, infant: 0 },
              double: { adult: 40, child: 20, infant: 0 },
              triple: { adult: 40, child: 20, infant: 0 },
              quad: { adult: 40, child: 20, infant: 0 },
              quint: { adult: 40, child: 20, infant: 0 }
            }
          },
          {
            mealPlanType: 'HB',
            roomRates: {
              single: { adult: 60, child: 30, infant: 0 },
              double: { adult: 60, child: 30, infant: 0 },
              triple: { adult: 60, child: 30, infant: 0 },
              quad: { adult: 60, child: 30, infant: 0 },
              quint: { adult: 60, child: 30, infant: 0 }
            }
          },
          {
            mealPlanType: 'FB',
            roomRates: {
              single: { adult: 80, child: 40, infant: 0 },
              double: { adult: 80, child: 40, infant: 0 },
              triple: { adult: 80, child: 40, infant: 0 },
              quad: { adult: 80, child: 40, infant: 0 },
              quint: { adult: 80, child: 40, infant: 0 }
            }
          }
        ]
      },
      {
        periodId: 2,
        startDate: '2024-08-01',
        endDate: '2024-09-30',
        roomTypeId: 1,
        rateType: 'per_unit',
        baseRates: {
          unitRate: 600
        },
        supplements: {
          extraAdult: 180,
          child: 90,
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'BB',
            roomRates: {
              single: { adult: 45, child: 23, infant: 0 },
              double: { adult: 45, child: 23, infant: 0 },
              triple: { adult: 45, child: 23, infant: 0 },
              quad: { adult: 45, child: 23, infant: 0 },
              quint: { adult: 45, child: 23, infant: 0 }
            }
          },
          {
            mealPlanType: 'HB',
            roomRates: {
              single: { adult: 65, child: 33, infant: 0 },
              double: { adult: 65, child: 33, infant: 0 },
              triple: { adult: 65, child: 33, infant: 0 },
              quad: { adult: 65, child: 33, infant: 0 },
              quint: { adult: 65, child: 33, infant: 0 }
            }
          },
          {
            mealPlanType: 'FB',
            roomRates: {
              single: { adult: 85, child: 43, infant: 0 },
              double: { adult: 85, child: 43, infant: 0 },
              triple: { adult: 85, child: 43, infant: 0 },
              quad: { adult: 85, child: 43, infant: 0 },
              quint: { adult: 85, child: 43, infant: 0 }
            }
          }
        ]
      },
      {
        periodId: 3,
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        roomTypeId: 1,
        rateType: 'per_unit',
        baseRates: {
          unitRate: 550
        },
        supplements: {
          extraAdult: 165,
          child: 82,
          infant: 0
        },
        mealPlanRates: [
          {
            mealPlanType: 'BB',
            roomRates: {
              single: { adult: 42, child: 21, infant: 0 },
              double: { adult: 42, child: 21, infant: 0 },
              triple: { adult: 42, child: 21, infant: 0 },
              quad: { adult: 42, child: 21, infant: 0 },
              quint: { adult: 42, child: 21, infant: 0 }
            }
          },
          {
            mealPlanType: 'HB',
            roomRates: {
              single: { adult: 62, child: 31, infant: 0 },
              double: { adult: 62, child: 31, infant: 0 },
              triple: { adult: 62, child: 31, infant: 0 },
              quad: { adult: 62, child: 31, infant: 0 },
              quint: { adult: 62, child: 31, infant: 0 }
            }
          },
          {
            mealPlanType: 'FB',
            roomRates: {
              single: { adult: 82, child: 41, infant: 0 },
              double: { adult: 82, child: 41, infant: 0 },
              triple: { adult: 82, child: 41, infant: 0 },
              quad: { adult: 82, child: 41, infant: 0 },
              quint: { adult: 82, child: 41, infant: 0 }
            }
          }
        ]
      }
    ],
    mealPlanConfig: {
      defaultMealPlan: 'HB',
      includedMealPlans: ['HB', 'FB', 'AI'],
      supplements: {
        'FB': 80,
        'AI': 150
      }
    }
  }
];

// Room definitions
export const roomTypes: RoomType[] = [
  {
    id: 1,
    name: 'Deluxe Room',
    type: 'Deluxe',
    description: 'Spacious room with modern amenities',
    maxOccupancy: {
      adults: 2,
      children: 1,
      infants: 1
    },
    location: 'Main Building',
    amenities: [
      'Air Conditioning',
      'Mini Bar',
      'Safe',
      'TV',
      'WiFi'
    ],
    size: 35,
    images: ['deluxe-1.jpg', 'deluxe-2.jpg'],
    bedConfiguration: [
      { type: 'King', count: 1 }
    ],
    isVilla: false,
    baseOccupancy: 2
  },
  {
    id: 2,
    name: 'Ocean View Suite',
    type: 'Suite',
    description: 'Luxurious suite with ocean views',
    maxOccupancy: {
      adults: 3,
      children: 2,
      infants: 1
    },
    location: 'Beachfront',
    amenities: [
      'Air Conditioning',
      'Mini Bar',
      'Safe',
      'TV',
      'WiFi',
      'Ocean View',
      'Balcony'
    ],
    size: 55,
    images: ['suite-1.jpg', 'suite-2.jpg'],
    bedConfiguration: [
      { type: 'King', count: 1 },
      { type: 'Sofa Bed', count: 1 }
    ],
    isVilla: false,
    baseOccupancy: 2
  },
  {
    id: 3,
    name: 'Deluxe Room',
    type: 'Deluxe',
    description: 'Spacious room with modern amenities',
    maxOccupancy: {
      adults: 2,
      children: 2,
      infants: 1
    },
    location: 'Main Building',
    amenities: [
      'Air Conditioning',
      'Mini Bar',
      'Safe',
      'TV',
      'WiFi'
    ],
    size: 35,
    images: ['deluxe-1.jpg', 'deluxe-2.jpg'],
    bedConfiguration: [
      { type: 'King', count: 1 }
    ],
    isVilla: false,
    baseOccupancy: 2
  },
  {
    id: 4,
    name: 'Executive Suite',
    type: 'Suite',
    description: 'Luxurious suite with ocean views',
    maxOccupancy: {
      adults: 4,
      children: 2,
      infants: 1
    },
    location: 'Beachfront',
    amenities: [
      'Air Conditioning',
      'Mini Bar',
      'Safe',
      'TV',
      'WiFi',
      'Ocean View',
      'Balcony'
    ],
    size: 55,
    images: ['suite-1.jpg', 'suite-2.jpg'],
    bedConfiguration: [
      { type: 'King', count: 1 },
      { type: 'Sofa Bed', count: 1 }
    ],
    isVilla: false,
    baseOccupancy: 2
  },
  {
    id: 5,
    name: 'Connecting Rooms',
    type: 'Connecting Rooms',
    description: 'Two rooms connected by a door',
    maxOccupancy: {
      adults: 4,
      children: 3,
      infants: 1
    },
    location: 'Main Building',
    amenities: [
      'Air Conditioning',
      'Mini Bar',
      'Safe',
      'TV',
      'WiFi'
    ],
    size: 70,
    images: ['connecting-rooms-1.jpg', 'connecting-rooms-2.jpg'],
    bedConfiguration: [
      { type: 'King', count: 1 },
      { type: 'Queen', count: 1 }
    ],
    isVilla: false,
    baseOccupancy: 2
  }
];

// Update hotel structure
export const HOTELS: Hotel[] = [
  {
    id: 1,
    name: 'Grand Hotel Riveria',
    address: 'Via Regina Giovanna, 23',
    city: 'Amalfi',
    country: 'Italy',
    description: 'Perched on the stunning Amalfi Coast, the Grand Hotel Riveria is a luxurious sanctuary offering breathtaking views of the Mediterranean Sea. This historic property combines classic Italian elegance with modern luxury, featuring world-class dining, a premium spa, and impeccable service. Each room and suite is meticulously designed to provide the ultimate comfort while capturing the essence of coastal Italian living.',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    rating: 5,
    amenities: ['Swimming Pool', 'Spa', 'Fine Dining', 'Beach Access', 'Fitness Center'],
    ageCategories: [
      {
        id: 1,
        type: 'adult',
        name: 'Adult',
        label: 'Adult',
        minAge: 12,
        maxAge: 100,
        description: 'Adult age category (12-100 years)',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 2,
        type: 'child',
        name: 'Child',
        label: 'Child',
        minAge: 2,
        maxAge: 11,
        description: 'Child age category (2-11 years)',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 3,
        type: 'infant',
        name: 'Infant',
        label: 'Infant',
        minAge: 0,
        maxAge: 1,
        description: 'Infant age category (0-1 years)',
        defaultRate: 0,
        isActive: true
      }
    ],
    policies: {
      cancellation: 'Free cancellation up to 30 days prior to arrival. Cancellations within 30 days will incur a charge of one night\'s stay. Cancellations within 7 days or no-shows will be charged the full stay amount. Special events and holidays (Easter, Christmas, New Year\'s Eve) require full prepayment and are non-refundable.',
      checkIn: 'Check-in time starts from 14:00. Early check-in available from 11:00 subject to availability and additional charge of €100. Private transfer from Naples Airport available on request.',
      checkOut: 'Check-out time is 11:00. Late check-out until 15:00 available at 50% of daily rate, subject to availability. Luggage storage available for early arrivals and late departures.',
      childPolicy: 'Children of all ages are welcome. Children under 6 stay free when using existing bedding. Baby cots available upon request for €25 per night. Children\'s activities and babysitting services available at additional charge.',
      petPolicy: 'Small pets (up to 5kg) are welcome with prior arrangement. Additional cleaning fee of €50 per stay applies. Pet amenities provided. Pets not allowed in restaurants or spa areas.',
      dressCode: 'Elegant Mediterranean resort attire required. For restaurants: Breakfast - Smart casual, no beachwear. Lunch - Smart casual, collared shirts for gentlemen. Dinner - Formal attire (jackets required for gentlemen, cocktail attire for ladies). No shorts, flip-flops, or sportswear in restaurants or public areas after 18:00.'
    },
    features: {
      restaurants: [
        {
          name: 'La Terrazza',
          cuisine: 'Mediterranean Fine Dining',
          dressCode: 'Smart Elegant - Jacket required for gentlemen, evening wear for ladies',
          openingHours: '19:00 - 23:00',
          description: 'Michelin-starred restaurant offering innovative Mediterranean cuisine with panoramic sea views. Advance reservations required.'
        },
        {
          name: 'Il Giardino',
          cuisine: 'Traditional Italian',
          dressCode: 'Smart Casual - Collared shirts required for gentlemen',
          openingHours: '12:00 - 15:00, 19:00 - 22:30',
          description: 'Authentic Italian cuisine served in a romantic garden setting. Features wood-fired pizza and homemade pasta.'
        },
        {
          name: 'Pool Bar & Grill',
          cuisine: 'International Light Dining',
          dressCode: 'Resort Casual - Cover-ups required',
          openingHours: '10:00 - 18:00',
          description: 'Casual poolside dining offering light meals, salads, and refreshing cocktails.'
        }
      ],
      spa: {
        name: 'Riveria Wellness & Spa',
        treatments: ['Massage', 'Facial', 'Body Treatments'],
        openingHours: '09:00 - 20:00',
        description: 'Luxury spa treatments with premium local ingredients.'
      }
    },
    images: ['hotel-exterior.jpg', 'lobby.jpg', 'restaurant.jpg'],
    contactInfo: {
      phone: '+39 089 831 888',
      email: 'info@grandhotelriveria.com',
      website: 'www.grandhotelriveria.com'
    }
  },
  {
    id: 2,
    name: 'Maldives Paradise Resort',
    address: 'Maafushi Island',
    city: 'Male',
    country: 'Maldives',
    description: 'Nestled in the pristine waters of the Maldives, this exclusive island resort offers an unparalleled luxury experience. Featuring overwater villas, world-class dining, and direct access to vibrant coral reefs, the resort combines natural beauty with exceptional service. Each villa is a private sanctuary, whether perched over turquoise lagoons or nestled along powder-soft beaches.',
    checkInTime: '15:00',
    checkOutTime: '12:00',
    rating: 5,
    amenities: ['Private Beach', 'Overwater Spa', 'Water Sports', 'Multiple Restaurants', 'Infinity Pool'],
    ageCategories: [
      {
        id: 1,
        type: 'adult',
        name: 'Adult',
        label: 'Adult',
        minAge: 16,
        maxAge: 100,
        description: 'Adult age category (16-100 years)',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 2,
        type: 'teen',
        name: 'Teen',
        label: 'Teen',
        minAge: 12,
        maxAge: 15,
        description: 'Teen age category (12-15 years)',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 3,
        type: 'child',
        name: 'Child',
        label: 'Child',
        minAge: 2,
        maxAge: 11,
        description: 'Child age category (2-11 years)',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 4,
        type: 'infant',
        name: 'Infant',
        label: 'Infant',
        minAge: 0,
        maxAge: 1,
        description: 'Infant age category (0-1 years)',
        defaultRate: 0,
        isActive: true
      }
    ],
    policies: {
      cancellation: 'Free cancellation up to 45 days prior to arrival. Cancellations 45-60 days before arrival incur 25% charge. Cancellations 30-45 days before arrival incur 50% charge. Cancellations within 30 days or no-shows incur full stay charge. Peak season requires full prepayment and is non-refundable.',
      checkIn: 'Check-in from 15:00. Seaplane transfers must be arranged at least 72 hours prior to arrival. Meet & greet service at Male International Airport included.',
      checkOut: 'Check-out by 12:00. Late check-out until 18:00 at 50% of nightly rate, subject to availability. Departure lounge with shower facilities available.',
      childPolicy: 'Children of all ages welcome. Special amenities and activities provided. Children under 12 stay and eat free from children\'s menu when dining with parents. Kids Club available for ages 4-12.',
      petPolicy: 'No pets allowed due to island ecosystem preservation policy and seaplane transfer restrictions.',
      dressCode: 'Relaxed tropical resort attire encouraged. Smart casual attire required for indoor restaurants. Barefoot dining encouraged at beach venues.'
    },
    features: {
      restaurants: [
        {
          name: 'Ocean View',
          cuisine: 'International',
          dressCode: 'Smart Casual - No beachwear or uncovered swimwear',
          openingHours: '06:30 - 23:00',
          description: 'All-day dining venue offering international cuisine with Asian influences. Features live cooking stations and themed dinner nights.'
        },
        {
          name: 'Sunset Grill',
          cuisine: 'Fresh Seafood & Grills',
          dressCode: 'Smart Casual - Covered beachwear for lunch, smart casual for dinner',
          openingHours: '19:00 - 22:30',
          description: 'Overwater restaurant specializing in fresh seafood and premium grills. Stunning sunset views and wine pairing available.'
        },
        {
          name: 'Teppanyaki',
          cuisine: 'Japanese',
          dressCode: 'Smart Casual - No beachwear',
          openingHours: '19:00 - 22:30',
          description: 'Interactive dining experience featuring skilled teppanyaki chefs and premium ingredients.'
        }
      ],
      spa: {
        name: 'Overwater Spa & Wellness',
        treatments: ['Massage', 'Yoga', 'Meditation'],
        openingHours: '09:00 - 21:00',
        description: 'Luxury overwater spa pavilions.'
      }
    },
    images: ['aerial-view.jpg', 'water-villa.jpg', 'beach.jpg'],
    contactInfo: {
      phone: '+960 400 6000',
      email: 'reservations@maldivesparadise.com',
      website: 'www.maldivesparadise.com'
    }
  }
];

// Sample data structure
export const sampleData: SampleDataType = {
  hotels: HOTELS,
  markets: defaultMarkets,
  contracts: {
    1: defaultContracts.filter(c => c.hotelId === 1),
    2: defaultContracts.filter(c => c.hotelId === 2)
  },
  hotelData: {
    "1-description": "Perched on the stunning French Riviera, the Grand Hotel Riveria offers breathtaking views of the Mediterranean Sea.",
    "1-cancellation": "Free cancellation up to 30 days before arrival.",
    "1-checkInOut": "Check-in: 14:00, Check-out: 11:00",
    "2-description": "Nestled in the heart of the Maldives, Paradise Resort offers an unparalleled luxury experience.",
    "2-cancellation": "Free cancellation up to 45 days before arrival.",
    "2-checkInOut": "Check-in: 15:00, Check-out: 12:00"
  },
  currencySettings: currencySettings,
  mealPlans: {
    1: [
      {
        id: 1,
        name: "Bed & Breakfast",
        code: "BB",
        description: "Start your day with our gourmet breakfast buffet"
      },
      {
        id: 2,
        name: "Half Board",
        code: "HB",
        description: "Breakfast and dinner included"
      }
    ]
  },
  marketGroups: defaultMarketGroups,
  seasons: {
    1: defaultSeasons,
    2: maldivesSeasons
  },
  specialOffers: {
    1: defaultSpecialOffers
  },
  rates: defaultRates
};