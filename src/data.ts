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
        startDate: '2023-12-01',
        endDate: '2023-12-22',
        mlos: 3,
        isBlackout: false
      },
      {
        id: 2,
        startDate: '2023-12-23',
        endDate: '2024-01-05',
        mlos: 7,
        isBlackout: false,
        description: 'Christmas and New Year Period'
      },
      {
        id: 3,
        startDate: '2024-01-06',
        endDate: '2024-02-09',
        mlos: 3,
        isBlackout: false
      },
      {
        id: 4,
        startDate: '2024-02-10',
        endDate: '2024-02-24',
        mlos: 5,
        isBlackout: false,
        description: 'Chinese New Year Period'
      },
      {
        id: 5,
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
        startDate: '2024-05-01',
        endDate: '2024-05-31',
        mlos: 2,
        isBlackout: false,
        description: 'Early Monsoon Special'
      },
      {
        id: 7,
        startDate: '2024-06-01',
        endDate: '2024-06-30',
        mlos: 3,
        isBlackout: false,
        description: 'June Promotion'
      },
      {
        id: 8,
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
        startDate: '2024-08-01',
        endDate: '2024-09-15',
        mlos: 2,
        isBlackout: false,
        description: 'Summer Special'
      },
      {
        id: 10,
        startDate: '2024-09-16',
        endDate: '2024-10-31',
        mlos: 3,
        isBlackout: false,
        description: 'Fall Promotion'
      },
      {
        id: 11,
        startDate: '2024-11-01',
        endDate: '2024-11-15',
        mlos: 2,
        isBlackout: false
      },
      {
        id: 12,
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
    label: 'Adult (12+)',
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
    label: 'Child (2-11)',
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
    label: 'Infant (0-1)',
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
export const HOTELS: Hotel[] = [
  {
    id: 1,
    name: 'Grand Hotel Riveria',
    address: 'Via Regina Giovanna, 23',
    city: 'Amalfi',
    country: 'Italy',
    description: 'Perched on the stunning Amalfi Coast, the Grand Hotel Riveria is a luxurious sanctuary offering breathtaking views of the Mediterranean Sea. This historic property combines classic Italian elegance with modern luxury, featuring world-class dining, a premium spa, and impeccable service. Each room and suite is meticulously designed to provide the ultimate comfort while capturing the essence of coastal Italian living.',
    rating: 5,
    checkInTime: '16:00',
    checkOutTime: '10:00',
    policies: {
      cancellation: 'Free cancellation up to 30 days prior to arrival. Cancellations within 30 days will incur a charge of one night\'s stay. Cancellations within 7 days or no-shows will be charged the full stay amount. Special events and holidays (Easter, Christmas, New Year\'s Eve) require full prepayment and are non-refundable.',
      checkIn: 'Check-in time starts from 16:00. Early check-in available from 13:00 subject to availability and additional charge of €100. Private transfer from Naples Airport available on request.',
      checkOut: 'Check-out time is 10:00. Late check-out until 15:00 available at 50% of daily rate, subject to availability. Luggage storage available for early arrivals and late departures.',
      childPolicy: 'Children of all ages are welcome. Children under 6 stay free when using existing bedding. Baby cots available upon request for €25 per night. Children\'s activities and babysitting services available at additional charge.',
      petPolicy: 'Small pets (up to 5kg) are welcome with prior arrangement. Additional cleaning fee of €50 per stay applies. Pet amenities provided. Pets not allowed in restaurants or spa areas.',
      dressCode: 'Elegant Mediterranean resort attire required. For restaurants: Breakfast - Smart casual, no beachwear. Lunch - Smart casual, collared shirts for gentlemen. Dinner - Formal attire (jackets required for gentlemen, cocktail attire for ladies). No shorts, flip-flops, or sportswear in restaurants or public areas after 18:00. La Terrazza restaurant requires formal evening attire at all times.'
    },
    ageCategories: [
      {
        id: 1,
        name: 'Infant',
        label: 'Infant',
        minAge: 0,
        maxAge: 2,
        type: 'infant',
        description: 'Infants stay in existing bedding',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 2,
        name: 'Child',
        label: 'Child',
        minAge: 3,
        maxAge: 11,
        type: 'child',
        description: 'Children sharing with adults',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 3,
        name: 'Teen',
        label: 'Teen',
        minAge: 12,
        maxAge: 17,
        type: 'teen',
        description: 'Teens sharing with adults',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 4,
        name: 'Adult',
        label: 'Adult',
        minAge: 18,
        maxAge: 200,
        type: 'adult',
        description: 'Standard adult accommodation',
        defaultRate: 0,
        isActive: true
      }
    ],
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
        treatments: [
          'Signature Mediterranean Massages',
          'Anti-aging Facial Treatments',
          'Couples Treatments',
          'Hydrotherapy',
          'Beauty Salon Services',
          'Traditional Italian Wellness Rituals'
        ],
        openingHours: '09:00 - 20:00',
        description: 'A sanctuary of wellness offering traditional and innovative treatments using premium local ingredients. Features thermal pools, meditation garden, and state-of-the-art fitness center.'
      }
    },
    contactInfo: {
      phone: '+39 089 831 888',
      email: 'info@grandhotelriveria.com',
      website: 'www.grandhotelriveria.com'
    },
    images: [
      'hotel-exterior.jpg',
      'lobby.jpg',
      'restaurant.jpg',
      'pool.jpg',
      'spa.jpg'
    ],
    amenities: [
      'Swimming Pool',
      'Spa',
      'Fine Dining',
      'Beach Access',
      'Fitness Center',
      'Tennis Court',
      'Yacht Charter',
      'Helicopter Pad',
      'Business Center',
      'Concierge Service'
    ],
    rooms: [
      {
        id: 1,
        type: 'classic',
        name: 'Classic Room',
        description: 'Elegant room with garden view',
        location: 'Garden Wing',
        maxOccupancy: {
          adults: 2,
          children: 1,
          infants: 1
        },
        size: 30,
        amenities: ['King Bed', 'En-suite Bathroom', 'Mini Bar', 'Safe', 'Wi-Fi'],
        images: ['classic-room-1.jpg', 'classic-room-2.jpg'],
        bedConfiguration: [
          { type: 'King', count: 1 }
        ]
      },
      {
        id: 2,
        type: 'deluxe',
        name: 'Deluxe Sea View',
        description: 'Spacious room with Mediterranean views',
        location: 'Sea Wing',
        maxOccupancy: {
          adults: 2,
          children: 1,
          infants: 1
        },
        size: 35,
        amenities: ['King Bed', 'Balcony', 'Lounge Area', 'Premium Toiletries', 'Wi-Fi'],
        images: ['deluxe-room-1.jpg', 'deluxe-room-2.jpg'],
        bedConfiguration: [
          { type: 'King', count: 1 }
        ]
      },
      {
        id: 3,
        type: 'junior-suite',
        name: 'Junior Suite',
        description: 'Luxurious suite with separate living area',
        location: 'Main Wing',
        maxOccupancy: {
          adults: 2,
          children: 2,
          infants: 1
        },
        size: 45,
        amenities: ['King Bed', 'Living Room', 'Walk-in Closet', 'Premium Bar', 'Wi-Fi'],
        images: ['junior-suite-1.jpg', 'junior-suite-2.jpg'],
        bedConfiguration: [
          { type: 'King', count: 1 },
          { type: 'Sofa Bed', count: 1 }
        ]
      },
      {
        id: 4,
        type: 'executive-suite',
        name: 'Executive Suite',
        description: 'Premium suite with panoramic sea views',
        location: 'Top Floor',
        maxOccupancy: {
          adults: 2,
          children: 2,
          infants: 1
        },
        size: 60,
        amenities: ['King Bed', 'Living Room', 'Dining Area', 'Private Terrace', 'Butler Service'],
        images: ['executive-suite-1.jpg', 'executive-suite-2.jpg'],
        bedConfiguration: [
          { type: 'King', count: 1 },
          { type: 'Sofa Bed', count: 1 }
        ]
      }
    ],
    mealPlans: [
      {
        id: 'MP-BB-01',
        type: 'BB',
        name: 'Bed & Breakfast',
        description: 'Daily gourmet breakfast at main restaurant',
        includedMeals: ['Breakfast'],
        defaultInclusions: [
          'Full buffet breakfast',
          'Made-to-order eggs and specialties',
          'Fresh juices and smoothies',
          'Premium coffee and tea selection'
        ],
        restrictions: []
      },
      {
        id: 'MP-HB-01',
        type: 'HB',
        name: 'Half Board',
        description: 'Breakfast and dinner included',
        includedMeals: ['Breakfast', 'Dinner'],
        defaultInclusions: [
          'Full buffet breakfast',
          'Three-course dinner at choice of restaurants',
          'Complimentary water with meals',
          'Weekly themed dinner events'
        ],
        restrictions: ['Excluding premium restaurants']
      },
      {
        id: 'MP-FB-01',
        type: 'FB',
        name: 'Full Board',
        description: 'All daily meals included',
        includedMeals: ['Breakfast', 'Lunch', 'Dinner'],
        defaultInclusions: [
          'Full buffet breakfast',
          'Three-course lunch',
          'Three-course dinner',
          'Soft drinks with meals',
          'Access to all restaurants'
        ],
        restrictions: ['Excluding premium beverages']
      },
      {
        id: 'MP-AI-01',
        type: 'AI',
        name: 'All Inclusive Premium',
        description: 'Complete luxury dining experience',
        includedMeals: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
        defaultInclusions: [
          'All meals and snacks',
          'Premium alcoholic beverages',
          'Mini bar included',
          'Room service included',
          'Special dining events',
          'Cooking classes'
        ],
        restrictions: []
      }
    ]
  },
  {
    id: 2,
    name: 'Maldives Paradise Resort',
    address: 'Maafushi Island',
    city: 'Male',
    country: 'Maldives',
    description: 'Nestled in the pristine waters of the Maldives, this exclusive island resort offers an unparalleled luxury experience. Featuring overwater villas, world-class dining, and direct access to vibrant coral reefs, the resort combines natural beauty with exceptional service. Each villa is a private sanctuary, whether perched over turquoise lagoons or nestled along powder-soft beaches. The resort\'s commitment to sustainability and marine conservation makes it a perfect choice for environmentally conscious travelers seeking luxury in paradise.',
    rating: 5,
    checkInTime: '13:00',
    checkOutTime: '12:00',
    policies: {
      cancellation: 'Free cancellation up to 60 days prior to arrival. Cancellations 45-60 days before arrival incur 25% charge. Cancellations 30-45 days before arrival incur 50% charge. Cancellations within 30 days or no-shows incur full stay charge. Peak season (December 20 - January 10, Chinese New Year, Easter) requires full prepayment 90 days prior and is non-refundable.',
      checkIn: 'Check-in from 13:00. Seaplane transfers must be arranged at least 72 hours prior to arrival. Meet & greet service at Male International Airport included. Early check-in subject to availability and resort transfer schedules. Welcome drink and cold towel service provided upon arrival.',
      checkOut: 'Check-out by 12:00. Late check-out until 18:00 at 50% of nightly rate, subject to availability. Complimentary access to facilities and lunch for guests with late flights. Departure lounge with shower facilities available.',
      childPolicy: 'Children of all ages welcome. Special amenities and activities provided. Children under 12 stay and eat free from children\'s menu when dining with parents. Kids Club available for ages 4-12. Babysitting services with 24-hour notice. Special teen activities program available.',
      petPolicy: 'No pets allowed due to island ecosystem preservation policy, seaplane transfer restrictions, and to protect the delicate marine environment.',
      dressCode: 'Relaxed tropical resort attire encouraged. Dining venues: Breakfast/Lunch - Resort casual with appropriate cover-ups, no wet swimwear. Dinner - Smart casual (collared shirts for gentlemen, no sleeveless shirts). Ocean View and Sunset Grill restaurants require smart casual attire for dinner. Barefoot dining encouraged at beach venues. No swimwear in indoor restaurants and facilities. Traditional Maldivian attire welcomed and appreciated.'
    },
    ageCategories: [
      {
        id: 1,
        name: 'Infant',
        label: 'Infant',
        minAge: 0,
        maxAge: 2,
        type: 'infant',
        description: 'Infants with baby cot available',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 2,
        name: 'Child',
        label: 'Child',
        minAge: 3,
        maxAge: 12,
        type: 'child',
        description: 'Children with special amenities',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 3,
        name: 'Teen',
        label: 'Teen',
        minAge: 13,
        maxAge: 17,
        type: 'teen',
        description: 'Teens with special activities',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 4,
        name: 'Adult',
        label: 'Adult',
        minAge: 18,
        maxAge: 200,
        type: 'adult',
        description: 'Standard adult accommodation',
        defaultRate: 0,
        isActive: true
      }
    ],
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
        },
        {
          name: 'Beach Club',
          cuisine: 'Mediterranean & Light Fare',
          dressCode: 'Resort Casual - Beachwear acceptable during day',
          openingHours: '10:00 - 18:00',
          description: 'Relaxed beachside venue offering light meals, wood-fired pizzas, and refreshing cocktails.'
        }
      ],
      spa: {
        name: 'Overwater Spa & Wellness',
        treatments: [
          'Traditional Maldivian Treatments',
          'Ayurvedic Therapies',
          'Couple\'s Rituals',
          'Yoga and Meditation',
          'Beauty Treatments',
          'Holistic Healing Sessions'
        ],
        openingHours: '09:00 - 21:00',
        description: 'Overwater treatment pavilions offering holistic wellness experiences. Features yoga sessions at sunrise, meditation classes, and traditional healing treatments using local ingredients.'
      }
    },
    contactInfo: {
      phone: '+960 400 6000',
      email: 'reservations@maldivesparadise.com',
      website: 'www.maldivesparadise.com'
    },
    images: [
      'aerial-view.jpg',
      'water-villa.jpg',
      'beach.jpg',
      'restaurant.jpg',
      'spa.jpg'
    ],
    amenities: [
      'Private Beach',
      'Overwater Spa',
      'Water Sports Center',
      'Diving Center',
      'Multiple Restaurants',
      'Infinity Pool',
      'Kids Club',
      'Sunset Lounge',
      'Marine Biology Center',
      'Yoga Pavilion'
    ],
    rooms: [
      {
        id: 1,
        type: 'beach-villa',
        name: 'Beach Villa',
        description: 'Spacious villa with direct beach access',
        location: 'Beachfront',
        maxOccupancy: {
          adults: 3,
          children: 2,
          infants: 1
        },
        size: 125,
        amenities: ['King Bed', 'Private Pool', 'Outdoor Shower', 'Terrace', 'Butler Service'],
        images: ['beach-villa-1.jpg', 'beach-villa-2.jpg'],
        bedConfiguration: [
          { type: 'King', count: 1 },
          { type: 'Day Bed', count: 1 }
        ]
      },
      {
        id: 2,
        type: 'water-villa',
        name: 'Water Villa',
        description: 'Overwater villa with ocean views',
        location: 'Lagoon',
        maxOccupancy: {
          adults: 2,
          children: 2,
          infants: 1
        },
        size: 110,
        amenities: ['King Bed', 'Glass Floor', 'Private Deck', 'Ocean Access', 'Mini Bar'],
        images: ['water-villa-1.jpg', 'water-villa-2.jpg'],
        bedConfiguration: [
          { type: 'King', count: 1 }
        ]
      },
      {
        id: 3,
        type: 'sunset-villa',
        name: 'Sunset Water Villa',
        description: 'Premium overwater villa with sunset views',
        location: 'Sunset Side',
        maxOccupancy: {
          adults: 2,
          children: 2,
          infants: 1
        },
        size: 140,
        amenities: ['King Bed', 'Infinity Pool', 'Sunset Deck', 'Butler Service', 'Premium Bar'],
        images: ['sunset-villa-1.jpg', 'sunset-villa-2.jpg'],
        bedConfiguration: [
          { type: 'King', count: 1 },
          { type: 'Day Bed', count: 1 }
        ]
      }
    ],
    mealPlans: [
      {
        id: 'MP-BB-02',
        type: 'BB',
        name: 'Breakfast Experience',
        description: 'Daily breakfast at main restaurant or in-villa dining',
        includedMeals: ['Breakfast'],
        defaultInclusions: [
          'International breakfast buffet',
          'In-villa breakfast option',
          'Premium beverages',
          'Fresh tropical fruits'
        ],
        restrictions: []
      },
      {
        id: 'MP-HB-02',
        type: 'HB',
        name: 'Dine Around Half Board',
        description: 'Breakfast and dinner at selected restaurants',
        includedMeals: ['Breakfast', 'Dinner'],
        defaultInclusions: [
          'Breakfast at any restaurant',
          'Dinner at selected restaurants',
          'Non-alcoholic beverages',
          'Theme night access'
        ],
        restrictions: ['Excluding specialty restaurants']
      },
      {
        id: 'MP-AI-02',
        type: 'AI',
        name: 'Ultimate All Inclusive',
        description: 'Complete resort experience',
        includedMeals: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
        defaultInclusions: [
          'All meals at any restaurant',
          'Premium drinks package',
          'Mini bar included',
          'Water sports activities',
          'Spa treatments'
        ],
        restrictions: []
      }
    ]
  }
];

// Sample data structure
export const sampleData: SampleDataType = {
  hotels: HOTELS,
  markets: defaultMarkets,
  contracts: {
    1: defaultContracts
  },
  hotelData: {
    "1-description": "Perched on the stunning French Riviera, the Grand Hotel Riviera offers breathtaking views of the Mediterranean Sea. This five-star establishment combines classic French elegance with modern luxury.",
    "1-cancellation": "Free cancellation up to 30 days before arrival. Cancellations made within 30 days of arrival are subject to penalties.",
    "1-checkInOut": "Check-in: 14:00, Check-out: 11:00",
    "2-description": "Nestled in the heart of the Maldives, Paradise Resort offers an unparalleled luxury experience with overwater villas and pristine beaches. Experience world-class service in a tropical paradise.",
    "2-cancellation": "Free cancellation up to 45 days before arrival. Cancellations within 45 days are subject to a fee based on the booking value.",
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
    1: defaultSeasons,
    2: maldivesSeasons
  },
  specialOffers: {
    1: defaultSpecialOffers
  },
  rates: defaultRates
};

// Export everything as a single object for easier imports
export const data = {
  sampleData,
  hotels: HOTELS,
  defaultMarkets,
  defaultContracts,
  currencySettings,
  defaultMarketGroups,
  defaultSpecialOffers,
  defaultRates,
  MEAL_PLAN_TYPES,
  ageCategories
};