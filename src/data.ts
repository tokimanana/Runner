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
    description: "Summer season with peak rates",
    isActive: true,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    periods: [
      {
        id: 1,
        startDate: "2024-06-01",
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
      }
    ]
  },
  {
    id: 2,
    name: "Winter 2024",
    description: "Winter season",
    isActive: true,
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    periods: [
      {
        id: 1,
        startDate: "2024-12-01",
        endDate: "2024-12-31",
        mlos: 4,
        description: "Christmas Period"
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

// Age Categories with defaultRate as required by AgeCategory interface
export const ageCategories: AgeCategory[] = [
  {
    id: 1,
    name: 'Adult',
    type: 'adult',
    label: 'Adult (12+)',
    minAge: 12,
    maxAge: 100,
    defaultRate: 100,
    description: 'Standard adult rate',
    isActive: true
  },
  {
    id: 2,
    name: 'Child',
    type: 'child',
    label: 'Child (2-11)',
    minAge: 2,
    maxAge: 11,
    defaultRate: 50,
    description: 'Standard child rate',
    isActive: true
  },
  {
    id: 3,
    name: 'Infant',
    type: 'infant',
    label: 'Infant (0-1)',
    minAge: 0,
    maxAge: 1,
    defaultRate: 0,
    description: 'Standard infant rate',
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
    ageCategoryRates: {
      "1": 100,
      "2": 50,
      "3": 0
    },
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
  {
    id: 1,
    hotelId: 1,
    marketId: 1,
    seasonId: 1,
    name: "Summer 2024 Contract",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    status: "active",
    rateType: "public",
    terms: {
      cancellationPolicy: [
        { daysBeforeArrival: 30, charge: 0 },
        { daysBeforeArrival: 14, charge: 50 },
        { daysBeforeArrival: 7, charge: 100 }
      ],
      paymentTerms: "30% deposit at booking, full payment 30 days before arrival",
      commission: 10,
      specialConditions: [
        "Early booking discounts available",
        "Group rates available for 10+ rooms"
      ]
    },
    validFrom: new Date("2024-06-01"),
    validTo: new Date("2024-08-31"),
    rates: defaultRates
  },
  {
    id: 2,
    hotelId: 1,
    marketId: 1,
    seasonId: 2,
    name: "Winter 2024 Contract",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    status: "active",
    rateType: "public",
    terms: {
      cancellationPolicy: [
        { daysBeforeArrival: 60, charge: 0 },
        { daysBeforeArrival: 30, charge: 50 },
        { daysBeforeArrival: 14, charge: 100 }
      ],
      paymentTerms: "50% deposit at booking, full payment 60 days before arrival",
      commission: 12,
      specialConditions: [
        "Peak season rates apply",
        "Minimum stay of 4 nights during Christmas period",
        "Gala dinner mandatory on Dec 24 and 31"
      ]
    },
    validFrom: new Date("2024-12-01"),
    validTo: new Date("2024-12-31"),
    rates: defaultRates
  }
];

// Room definitions
export const defaultRooms: RoomType[] = [
  {
    id: 1,
    type: "STD",
    name: "Standard Room",
    description: "Comfortable standard room with modern amenities",
    location: "Main Building",
    maxOccupancy: {
      adults: 2,
      children: 1,
      infants: 1
    },
    amenities: ["WiFi", "Air Conditioning", "Mini Bar"],
    size: 25,
    images: ["room1.jpg"],
    bedConfiguration: [
      {
        type: "Double",
        count: 1
      }
    ]
  },
  {
    id: 2,
    type: "DLX",
    name: "Deluxe Room",
    description: "Spacious deluxe room with premium amenities",
    location: "Main Building",
    maxOccupancy: {
      adults: 2,
      children: 2,
      infants: 1
    },
    amenities: ["WiFi", "Air Conditioning", "Mini Bar", "Ocean View"],
    size: 35,
    images: ["deluxe1.jpg"],
    bedConfiguration: [
      {
        type: "King",
        count: 1
      }
    ]
  }
];

// Update hotel structure
export const hotels: Hotel[] = [
  {
    id: 1,
    name: "Grand Hotel Riviera",
    address: "58 Boulevard de la Croisette",
    city: "Nice",
    country: "France",
    rating: 5,
    ageCategories: ageCategories,
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
        amenities: ["WiFi", "Air Conditioning", "Mini Bar", "Sea View", "Balcony"],
        size: 25,
        images: ["room1.jpg", "room1-2.jpg"],
        bedConfiguration: [
          { type: "Double", count: 1 },
          { type: "Single", count: 1 }
        ]
      }
    ],
    amenities: ["Pool", "Spa", "Restaurant", "Beach Access", "Fitness Center", "Kids Club"],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    policies: {
      cancellation: "Free cancellation up to 30 days before arrival",
      checkIn: "From 14:00",
      checkOut: "Until 11:00",
      childPolicy: "Children of all ages welcome",
      petPolicy: "Small pets allowed (max 5kg)",
      dressCode: "Smart casual attire required in restaurants"
    },
    features: {
      restaurants: [
        {
          name: "L'Azur",
          cuisine: "Mediterranean",
          dressCode: "Smart Casual",
          openingHours: "19:00 - 22:30",
          description: "Fine dining restaurant with Mediterranean cuisine"
        }
      ],
      spa: {
        name: "Riviera Wellness",
        treatments: ["Massages", "Facials", "Body Treatments", "Hydrotherapy"],
        openingHours: "09:00 - 20:00",
        description: "Luxury spa offering a range of treatments"
      }
    },
    images: ["hotel1.jpg", "hotel2.jpg"],
    description: "Perched on the stunning French Riviera, the Grand Hotel Riviera offers breathtaking views of the Mediterranean Sea.",
    contactInfo: {
      phone: "+33 1 23 45 67 89",
      email: "contact@grandhotelriviera.com",
      website: "www.grandhotelriviera.com"
    }
  },
  {
    id: 2,
    name: "Constance Prince Maurice",
    address: "Choisy Road, Poste de Flacq",
    city: "Poste de Flacq",
    country: "Mauritius",
    rating: 5,
    ageCategories: ageCategories,
    rooms: [
      {
        id: 1,
        type: "Junior Suite",
        name: "Junior Suite",
        description: "Elegant 70m² suite with terrace or balcony overlooking the tropical gardens. Features a spacious sitting area and modern amenities.",
        location: "Main Wing",
        maxOccupancy: {
          adults: 2,
          children: 1,
          infants: 1
        },
        amenities: [
          "Free WiFi",
          "Air Conditioning",
          "LCD TV",
          "Apple Mac Mini",
          "Mini Bar",
          "Nespresso Machine",
          "Walk-in Wardrobe",
          "Bathroom with Bathtub",
          "Separate Shower",
          "Double Vanity",
          "Private Terrace/Balcony"
        ],
        size: 70,
        images: ["junior-suite-1.jpg", "junior-suite-2.jpg"],
        bedConfiguration: [
          { type: "King", count: 1 }
        ]
      },
      {
        id: 2,
        type: "Beach Villa",
        name: "Beach Villa with Private Pool",
        description: "Luxurious 130m² villa directly on the beach with private heated pool, outdoor dining area and stunning ocean views.",
        location: "Beachfront",
        maxOccupancy: {
          adults: 3,
          children: 2,
          infants: 1
        },
        amenities: [
          "Private Heated Pool",
          "Direct Beach Access",
          "Free WiFi",
          "Air Conditioning",
          "65-inch LCD TV",
          "Apple Mac Mini",
          "Premium Mini Bar",
          "Nespresso Machine",
          "Wine Cooler",
          "Walk-in Wardrobe",
          "Outdoor Shower",
          "Indoor Rain Shower",
          "Luxury Bathroom",
          "Private Garden",
          "Butler Service"
        ],
        size: 130,
        images: ["beach-villa-1.jpg", "beach-villa-2.jpg"],
        bedConfiguration: [
          { type: "King", count: 1 },
          { type: "Sofa Bed", count: 1 }
        ]
      }
    ],
    amenities: [
      "2 Championship Golf Courses",
      "U Spa by Constance",
      "Infinity Pool",
      "Private Beach",
      "Tennis Courts",
      "Water Sports Center",
      "Kids Club",
      "Wine Cellar",
      "Fitness Center",
      "Yoga Pavilion",
      "Library",
      "Helipad"
    ],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    policies: {
      cancellation: "Free cancellation up to 30 days before arrival for non-peak seasons. Special cancellation policies apply for peak seasons.",
      checkIn: "From 14:00",
      checkOut: "Until 12:00",
      childPolicy: "Children of all ages are welcome. One child under 12 years stays free when using existing bedding. Baby cots available on request.",
      petPolicy: "No pets allowed",
      dressCode: "Smart casual required in all restaurants. No beachwear at dinner."
    },
    features: {
      restaurants: [
        {
          name: "L'Archipel",
          cuisine: "International",
          dressCode: "Smart Casual",
          openingHours: "07:00 - 22:30",
          description: "Main restaurant offering breakfast and themed dinner buffets with live cooking stations. Stunning views over the pool and ocean."
        },
        {
          name: "Le Barachois",
          cuisine: "Seafood",
          dressCode: "Smart Elegant",
          openingHours: "19:00 - 22:30",
          description: "Unique floating restaurant comprising five decks, located amongst the natural fish reserve, serving fresh seafood and Mauritian specialties."
        },
        {
          name: "Asian",
          cuisine: "Asian Fusion",
          dressCode: "Smart Casual",
          openingHours: "19:00 - 22:30",
          description: "Contemporary Asian cuisine including sushi, sashimi and other Asian specialties with lagoon views."
        }
      ],
      spa: {
        name: "U Spa by Constance",
        treatments: [
          "Signature Massages",
          "Couples Treatments",
          "Ayurvedic Treatments",
          "Facials",
          "Body Wraps",
          "Hot Stone Therapy",
          "Yoga Sessions",
          "Meditation Classes"
        ],
        openingHours: "09:00 - 20:00",
        description: "Luxurious spa offering holistic treatments using natural products. Features couples treatment rooms, heated pool, steam room, and relaxation areas."
      }
    },
    images: [
      "hotel-aerial.jpg",
      "beach-view.jpg",
      "pool-sunset.jpg",
      "restaurant-floating.jpg",
      "spa-treatment.jpg"
    ],
    description: "Set along a pristine private beach on the northeast coast of Mauritius, Constance Prince Maurice epitomizes tropical luxury. This intimate suites and villas resort combines traditional Mauritian style with modern luxury, offering exceptional service and world-class facilities including a natural fish reserve, floating restaurant, and two 18-hole championship golf courses.",
    contactInfo: {
      phone: "+230 402 3636",
      email: "contact@princemaurice.com",
      website: "www.constanceprincemaurice.com"
    },
    mealPlans: [
      {
        id: "RO",
        type: "RO",
        name: "Room Only",
        description: "Accommodation only without any meals included",
        includedMeals: [],
        defaultInclusions: [
          "Access to fitness center",
          "Free WiFi",
          "Water sports (non-motorized)"
        ],
        restrictions: [
          "All meals will be charged as per consumption",
          "Room service charges apply"
        ]
      },
      {
        id: "BB",
        type: "BB",
        name: "Bed & Breakfast",
        description: "Includes daily breakfast at L'Archipel restaurant",
        includedMeals: ["Breakfast"],
        defaultInclusions: [
          "Welcome drink",
          "Daily breakfast buffet",
          "Access to fitness center",
          "Free WiFi",
          "Water sports (non-motorized)"
        ],
        restrictions: []
      },
      {
        id: "HB",
        type: "HB",
        name: "Half Board",
        description: "Includes daily breakfast and dinner at selected restaurants",
        includedMeals: ["Breakfast", "Dinner"],
        defaultInclusions: [
          "Welcome drink",
          "Daily breakfast buffet",
          "Daily dinner at selected restaurants",
          "Access to fitness center",
          "Free WiFi",
          "Water sports (non-motorized)"
        ],
        restrictions: [
          "Excluding drinks at dinner",
          "Some menu items may carry supplements"
        ]
      }
    ]
  }
];

// Sample data structure
export const sampleData: SampleDataType = {
  hotels: hotels,
  markets: defaultMarkets,
  contracts: {
    1: defaultContracts
  },
  hotelData: {
    "1-description": "Perched on the stunning French Riviera, the Grand Hotel Riviera offers breathtaking views of the Mediterranean Sea. This five-star establishment combines classic French elegance with modern luxury.",
    "1-cancellation": "Free cancellation up to 30 days before arrival. Cancellations made within 30 days of arrival are subject to penalties.",
    "1-checkInOut": "Check-in: 14:00, Check-out: 11:00"
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
      },
      {
        id: 3,
        name: "Full Board",
        code: "FB",
        description: "All daily meals included"
      }
    ]
  },
  marketGroups: defaultMarketGroups,
  seasons: {
    1: defaultSeasons
  },
  specialOffers: {
    1: defaultSpecialOffers
  },
  rates: defaultRates
};

// Export everything as a single object for easier imports
export const data = {
  sampleData,
  hotels,
  defaultMarkets,
  defaultContracts,
  currencySettings,
  defaultMarketGroups,
  defaultSpecialOffers,
  defaultRates,
  MEAL_PLAN_TYPES,
  ageCategories
};