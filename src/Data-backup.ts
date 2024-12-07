import { 
  Hotel, 
  Market, 
  MarketGroup,
  CurrencySetting,
  RoomType,
  RoomCategory,
  Season,
  Contract,
  MealPlan,
  MealPlanType,
  CuisineType,
  AgeCategory,
  Rate,
  Period,
  SpecialOffer,
  HotelPolicies,
  HotelCapacity,
  RoomInventory,
  Restaurant,
  Spa,
  SpaServiceType,
  SpaService,
  AmenityCategory,
  RestaurantType,
  CancellationChargeType,
  CancellationRule,
  CancellationPolicy,
  AgeCategoryRate,
  RateConfiguration
} from './app/models/types';

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

// Meal plan definitions
export const defaultMealPlans: MealPlan[] = [
  {
    id: '1',
    type: MealPlanType.BB,
    name: 'Bed & Breakfast',
    description: "Start your day with our extensive breakfast buffet featuring local and international cuisine",
    mealTimes: [
      {
        name: 'Breakfast',
        startTime: '07:00',
        endTime: '10:30',
        location: 'Main Restaurant'
      }
    ],
    inclusions: [
      {
        name: 'Breakfast Buffet',
        description: 'Full breakfast buffet with hot and cold items',
        isIncluded: true
      },
      {
        name: 'Beverages',
        description: 'Coffee, tea, juices during breakfast',
        isIncluded: true
      }
    ],
    restrictions: [
      'Breakfast service ends strictly at 10:30',
      'Room service breakfast available at additional charge'
    ],
    isActive: true
  },
  {
    id: '2',
    type: MealPlanType.HB,
    name: 'Half Board',
    description: "Enjoy breakfast and dinner at our main restaurant",
    mealTimes: [
      {
        name: 'Breakfast',
        startTime: '07:00',
        endTime: '10:30',
        location: 'Main Restaurant'
      },
      {
        name: 'Dinner',
        startTime: '19:00',
        endTime: '22:30',
        location: 'Main Restaurant'
      }
    ],
    inclusions: [
      {
        name: 'Breakfast Buffet',
        description: 'Full breakfast buffet with hot and cold items',
        isIncluded: true
      },
      {
        name: 'Dinner Buffet',
        description: 'International dinner buffet with themed nights',
        isIncluded: true
      },
      {
        name: 'Beverages',
        description: 'Water, soft drinks during meals',
        isIncluded: true
      }
    ],
    restrictions: [
      'Meals must be taken in the main restaurant',
      'Specialty restaurants available at additional charge'
    ],
    isActive: true
  },
  {
    id: '3',
    type: MealPlanType.FB,
    name: 'Full Board',
    description: "All daily meals included - breakfast, lunch and dinner",
    mealTimes: [
      {
        name: 'Breakfast',
        startTime: '07:00',
        endTime: '10:30',
        location: 'Main Restaurant'
      },
      {
        name: 'Lunch',
        startTime: '12:30',
        endTime: '15:00',
        location: 'Main Restaurant'
      },
      {
        name: 'Dinner',
        startTime: '19:00',
        endTime: '22:30',
        location: 'Main Restaurant'
      }
    ],
    inclusions: [
      {
        name: 'All Meals',
        description: 'Breakfast, lunch and dinner buffets',
        isIncluded: true
      },
      {
        name: 'Beverages',
        description: 'Water, soft drinks during meals',
        isIncluded: true
      }
    ],
    restrictions: [
      'Meals must be taken in the main restaurant',
      'Specialty restaurants available at additional charge',
      'Alcoholic beverages not included'
    ],
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

// Contracts with proper type structure
export const defaultContracts: Contract[] = [
  {
    id: 1,
    name: "Grand Riveria Summer 2024 - France",
    hotelId: 1,
    marketId: 1,
    seasonId: 1,
    selectedRooms: [1, 2, 3], // Deluxe Room, Ocean View Suite, Beach Villa
    selectedMealPlans: ['RO', 'BB', 'HB', 'FB'],
    status: "active",
    validFrom: new Date("2024-05-01"),
    validTo: new Date("2024-09-30"),
    periodRates: [
      {
        periodId: 1,  // High Season
        roomRates: [
          {
            roomTypeId: 1, // Deluxe Room (max: 2A+1C+1I)
            rateType: "per_pax",
            personTypeRates: {
              'adult': {
                rates: {
                  1: 200,  // Single occupancy
                  2: 150   // Rate per adult when 2 adults
                }
              },
              'child': {
                rates: {
                  1: 80    // One child
                }
              },
              'infant': {
                rates: {
                  1: 0     // One infant
                }
              }
            },
            mealPlanRates: {
              'RO': { 'adult': 0, 'child': 0, 'infant': 0 },
              'BB': { 'adult': 25, 'child': 15, 'infant': 0 },
              'HB': { 'adult': 40, 'child': 25, 'infant': 0 },
              'FB': { 'adult': 60, 'child': 35, 'infant': 0 }
            }
          },
          {
            roomTypeId: 2, // Ocean View Suite (max: 3A+2C+1I)
            rateType: "per_pax",
            personTypeRates: {
              'adult': {
                rates: {
                  1: 280,  // Single adult
                  2: 200,  // Rate per adult when 2 adults
                  3: 180   // Rate per adult when 3 adults
                }
              },
              'child': {
                rates: {
                  1: 100,  // First child
                  2: 90    // Second child
                }
              },
              'infant': {
                rates: {
                  1: 0     // One infant
                }
              }
            },
            mealPlanRates: {
              'RO': { 'adult': 0, 'child': 0, 'infant': 0 },
              'BB': { 'adult': 30, 'child': 20, 'infant': 0 },
              'HB': { 'adult': 50, 'child': 30, 'infant': 0 },
              'FB': { 'adult': 70, 'child': 40, 'infant': 0 }
            }
          },
          {
            roomTypeId: 3, // Beach Villa (max: 4A+2C+1I)
            rateType: "per_villa",
            personTypeRates: {
              'base': {  // Base villa rate regardless of occupancy
                rates: {
                  1: 800  // Base rate for the villa
                }
              },
              'adult': {  // Additional person charges
                rates: {
                  1: 0,    // First 2 adults included in base rate (baseOccupancy)
                  2: 0,
                  3: 100,  // Third adult extra
                  4: 100   // Fourth adult extra
                }
              },
              'child': {
                rates: {
                  1: 0,    // First child included
                  2: 50    // Second child extra
                }
              },
              'infant': {
                rates: {
                  1: 0     // One infant included
                }
              }
            },
            mealPlanRates: {
              'RO': { 'adult': 0, 'child': 0, 'infant': 0 },
              'BB': { 'adult': 35, 'child': 25, 'infant': 0 },
              'HB': { 'adult': 55, 'child': 35, 'infant': 0 },
              'FB': { 'adult': 75, 'child': 45, 'infant': 0 }
            }
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Grand Riveria Winter 2024 - UK",
    hotelId: 1,
    marketId: 2,
    seasonId: 2,
    selectedRooms: [1, 2, 3], // Same room selection
    selectedMealPlans: ['BB', 'HB', 'FB'], // No RO in winter
    status: "draft",
    validFrom: new Date("2024-11-01"),
    validTo: new Date("2025-03-31"),
    periodRates: [
      {
        periodId: 1,
        roomRates: [
          {
            roomTypeId: 1, // Deluxe Room (max: 2A+1C+1I)
            rateType: "per_pax",
            personTypeRates: {
              'adult': {
                rates: {
                  1: 180,  // Single occupancy (winter rate)
                  2: 130   // Rate per adult when 2 adults
                }
              },
              'child': {
                rates: {
                  1: 70    // One child
                }
              },
              'infant': {
                rates: {
                  1: 0     // One infant
                }
              }
            },
            mealPlanRates: {
              'BB': { 'adult': 20, 'child': 12, 'infant': 0 },
              'HB': { 'adult': 35, 'child': 20, 'infant': 0 },
              'FB': { 'adult': 50, 'child': 30, 'infant': 0 }
            }
          },
          {
            roomTypeId: 2, // Ocean View Suite (max: 3A+2C+1I)
            rateType: "per_pax",
            personTypeRates: {
              'adult': {
                rates: {
                  1: 250,  // Single adult
                  2: 180,  // Rate per adult when 2 adults
                  3: 150   // Rate per adult when 3 adults
                }
              },
              'child': {
                rates: {
                  1: 90,   // First child
                  2: 80    // Second child
                }
              },
              'infant': {
                rates: {
                  1: 0     // One infant
                }
              }
            },
            mealPlanRates: {
              'BB': { 'adult': 25, 'child': 15, 'infant': 0 },
              'HB': { 'adult': 45, 'child': 25, 'infant': 0 },
              'FB': { 'adult': 65, 'child': 35, 'infant': 0 }
            }
          },
          {
            roomTypeId: 3, // Beach Villa (max: 4A+2C+1I)
            rateType: "per_villa",
            personTypeRates: {
              'base': {
                rates: {
                  1: 700  // Lower base rate for winter
                }
              },
              'adult': {
                rates: {
                  1: 0,    // First 2 adults included
                  2: 0,
                  3: 80,   // Third adult extra
                  4: 80    // Fourth adult extra
                }
              },
              'child': {
                rates: {
                  1: 0,    // First child included
                  2: 40    // Second child extra
                }
              },
              'infant': {
                rates: {
                  1: 0     // One infant included
                }
              }
            },
            mealPlanRates: {
              'BB': { 'adult': 30, 'child': 20, 'infant': 0 },
              'HB': { 'adult': 45, 'child': 30, 'infant': 0 },
              'FB': { 'adult': 65, 'child': 40, 'infant': 0 }
            }
          }
        ]
      }
    ]
  }
];

// Room definitions
export const roomTypes: RoomType[] = [
  {
    id: 1,
    name: 'Deluxe Room',
    category: RoomCategory.DELUXE,
    description: 'Spacious room with modern amenities',
    maxOccupancy: {
      adults: 2,
      children: 1,
      infants: 1
    },
    baseOccupancy: 2,
    amenities: [
      'Air Conditioning',
      'Mini Bar',
      'Safe',
      'TV',
      'WiFi'
    ],
    size: 35,
    images: ['deluxe-1.jpg', 'deluxe-2.jpg']
  },
  {
    id: 2,
    name: 'Ocean View Suite',
    category: RoomCategory.SUITE,
    description: 'Luxurious suite with ocean views',
    maxOccupancy: {
      adults: 3,
      children: 2,
      infants: 1
    },
    baseOccupancy: 2,
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
    images: ['suite-1.jpg', 'suite-2.jpg']
  },
  {
    id: 3,
    name: 'Beach Villa',
    category: RoomCategory.VILLA,
    description: 'Luxurious beachfront villa',
    maxOccupancy: {
      adults: 4,
      children: 2,
      infants: 1
    },
    baseOccupancy: 2,
    amenities: [
      'Air Conditioning',
      'Private Pool',
      'Mini Bar',
      'Safe',
      'TV',
      'WiFi',
      'Beach Access',
      'Butler Service'
    ],
    size: 150,
    images: ['villa-1.jpg', 'villa-2.jpg']
  },
  {
    id: 4,
    name: 'Standard Room',
    category: RoomCategory.STANDARD,
    description: 'Comfortable room with essential amenities',
    maxOccupancy: {
      adults: 2,
      children: 1,
      infants: 1
    },
    baseOccupancy: 2,
    amenities: [
      'Air Conditioning',
      'Mini Bar',
      'Safe',
      'TV',
      'WiFi'
    ],
    size: 28,
    images: ['standard-1.jpg', 'standard-2.jpg']
  }
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
    code: 'MVR',
    symbol: 'ރ',
    name: 'Maldivian Rufiyaa',
    decimals: 2,
    isActive: true
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
    description: 'Perched on the stunning Amalfi Coast, the Grand Hotel Riveria is a luxurious sanctuary offering breathtaking views of the Mediterranean Sea. This historic property combines classic Italian elegance with modern luxury, featuring world-class dining, a premium spa, and impeccable service.',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    rating: 5,
    amenities: {
      [AmenityCategory.POOL]: ['Swimming Pool'],
      [AmenityCategory.SPA]: ['Spa', 'Wellness Center'],
      [AmenityCategory.DINING]: ['Fine Dining', 'Room Service'],
      [AmenityCategory.BEACH]: ['Beach Access'],
      [AmenityCategory.FITNESS]: ['Fitness Center'],
      [AmenityCategory.SERVICES]: ['Concierge', 'Airport Transfer']
    },
    ageCategories: [
      {
        id: 1,
        type: 'adult',
        name: 'Adult',
        label: `Adult (${12}+ years)`,
        minAge: 12,
        maxAge: 100,
        description: 'Adult age category (12+ years)',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 2,
        type: 'child',
        name: 'Child',
        label: `Child (${2}-${11} years)`,
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
        label: `Infant (${0}-${1} years)`,
        minAge: 0,
        maxAge: 1,
        description: 'Infant age category (0-1 years)',
        defaultRate: 0,
        isActive: true
      }
    ],
    policies: {
      cancellation: {
        description: "Our cancellation policy is designed to be fair and flexible for our guests while maintaining operational efficiency.",
        rules: [
          {
            daysBeforeArrival: 14,
            chargeType: CancellationChargeType.PERCENTAGE,
            charge: 0
          },
          {
            daysBeforeArrival: 7,
            chargeType: CancellationChargeType.PERCENTAGE,
            charge: 50
          },
          {
            daysBeforeArrival: 3,
            chargeType: CancellationChargeType.PERCENTAGE,
            charge: 100
          }
        ],
        noShowCharge: 100,
        noShowChargeType: CancellationChargeType.PERCENTAGE
      },
      checkIn: {
        standardTime: "15:00",
        earliestTime: "12:00",
        latestTime: "23:00",
        additionalCharges: {
          early: {
            beforeTime: "12:00",
            charge: 50,
            description: "Early check-in subject to availability"
          },
          late: {
            afterTime: "23:00",
            charge: 50,
            description: "Late check-in must be arranged in advance"
          }
        },
        requirements: [
          "Valid government-issued ID",
          "Credit card for incidentals",
          "Booking confirmation"
        ]
      },
      checkOut: {
        standardTime: "11:00",
        earliestTime: "06:00",
        latestTime: "12:00",
        additionalCharges: {
          late: {
            afterTime: "12:00",
            charge: 50,
            description: "Late check-out subject to availability"
          }
        },
        requirements: [
          "Room key return",
          "Settlement of outstanding charges"
        ]
      },
      child: {
        maxChildAge: 12,
        maxInfantAge: 2,
        allowChildren: true,
        childrenStayFree: true,
        maxChildrenFree: 2,
        requiresAdult: true,
        minAdultAge: 18,
        extraBedPolicy: {
          available: true,
          maxExtraBeds: 1,
          charge: 30,
          chargeType: "per_night"
        },
        restrictions: [
          "Children under 12 must be accompanied by an adult in pool areas",
          "Children's access to spa facilities is limited"
        ]
      },
      pet: {
        allowPets: true,
        maxPets: 2,
        petTypes: ["Dogs", "Cats"],
        maxWeight: 20,
        weightUnit: "kg",
        charge: 25,
        chargeType: "per_night",
        restrictions: [
          "Pets must be kept on leash in public areas",
          "Pets are not allowed in restaurant areas",
          "Pet owners must clean up after their pets"
        ],
        requirements: [
          "Valid vaccination records",
          "Pet deposit required",
          "Advance notification required"
        ]
      },
      dressCode: {
        general: "Smart casual attire is required in all public areas after 18:00",
        restaurants: [
          {
            name: "La Terrazza",
            code: "Smart Elegant",
            description: "Collared shirts and closed shoes required. No beachwear or sportswear.",
            restrictions: [
              "No flip-flops or sandals",
              "No shorts or t-shirts during dinner",
              "Jacket required for gentlemen during dinner"
            ]
          },
          {
            name: "Pool Bar",
            code: "Casual",
            description: "Casual attire permitted. Cover-ups required.",
            restrictions: [
              "Appropriate swimwear cover-ups required",
              "Footwear required at all times"
            ]
          }
        ],
        publicAreas: [
          {
            area: "Lobby & Reception",
            code: "Smart Casual",
            description: "Neat, clean and appropriate attire required",
            restrictions: [
              "No swimwear",
              "No bare feet"
            ]
          }
        ]
      }
    },
    features: {
      restaurants: [
        {
          name: 'La Terrazza',
          cuisine: CuisineType.MEDITERRANEAN,
          type: RestaurantType.FINE_DINING,
          dressCode: 'Smart Elegant',
          openingHours: '19:00-23:00',
          description: 'Michelin-starred restaurant offering innovative Mediterranean cuisine with panoramic sea views.'
        },
        {
          name: 'Il Giardino',
          cuisine: CuisineType.ITALIAN,
          type: RestaurantType.CASUAL,
          dressCode: 'Smart Casual',
          openingHours: '12:00-15:00,19:00-22:30',
          description: 'Authentic Italian cuisine served in a romantic garden setting.'
        },
        {
          name: 'Pool Bar & Grill',
          cuisine: CuisineType.INTERNATIONAL,
          type: RestaurantType.POOL,
          dressCode: 'Resort Casual',
          openingHours: '10:00-18:00',
          description: 'Casual poolside dining offering light meals and refreshments.'
        }
      ],
      spa: {
        name: 'Riveria Wellness & Spa',
        treatments: [
          'Massage',
          'Facial',
          'Body Treatments',
          'Mediterranean Rituals',
          'Couples Treatments'
        ],
        openingHours: '09:00-20:00',
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
    description: 'Nestled in the pristine waters of the Maldives, this exclusive island resort offers an unparalleled luxury experience. Featuring overwater villas, world-class dining, and direct access to vibrant coral reefs.',
    checkInTime: '15:00',
    checkOutTime: '12:00',
    rating: 5,
    amenities: {
      [AmenityCategory.BEACH]: ['Private Beach', 'Water Sports', 'Beach Club'],
      [AmenityCategory.POOL]: ['Infinity Pool'],
      [AmenityCategory.SPA]: ['Overwater Spa', 'Wellness Center'],
      [AmenityCategory.DINING]: ['Multiple Restaurants', 'Private Dining'],
      [AmenityCategory.ACTIVITIES]: ['Water Sports', 'Excursions'],
      [AmenityCategory.SERVICES]: ['Butler Service', 'Airport Transfer']
    },
    ageCategories: [
      {
        id: 1,
        type: 'adult',
        name: 'Adult',
        label: `Adult (${16}+ years)`,
        minAge: 16,
        maxAge: 100,
        description: 'Adult age category (16+ years)',
        defaultRate: 0,
        isActive: true
      },
      {
        id: 2,
        type: 'teen',
        name: 'Teen',
        label: `Teen (${12}-${15} years)`,
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
        label: `Child (${2}-${11} years)`,
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
        label: `Infant (${0}-${1} years)`,
        minAge: 0,
        maxAge: 1,
        description: 'Infant age category (0-1 years)',
        defaultRate: 0,
        isActive: true
      }
    ],
    policies: {
      cancellation: {
        description: "Flexible cancellation policy designed for our island resort guests.",
        rules: [
          {
            daysBeforeArrival: 30,
            chargeType: CancellationChargeType.PERCENTAGE,
            charge: 0
          },
          {
            daysBeforeArrival: 14,
            chargeType: CancellationChargeType.PERCENTAGE,
            charge: 50
          },
          {
            daysBeforeArrival: 7,
            chargeType: CancellationChargeType.PERCENTAGE,
            charge: 100
          }
        ],
        noShowCharge: 100,
        noShowChargeType: CancellationChargeType.PERCENTAGE
      },
      checkIn: {
        standardTime: "14:00",
        earliestTime: "10:00",
        latestTime: "22:00",
        additionalCharges: {
          early: {
            beforeTime: "10:00",
            charge: 100,
            description: "Early check-in based on availability and arrival time"
          },
          late: {
            afterTime: "22:00",
            charge: 100,
            description: "Late check-in requires advance notice due to transfer arrangements"
          }
        },
        requirements: [
          "Valid passport",
          "Credit card for incidentals",
          "Booking confirmation",
          "Transfer details"
        ]
      },
      checkOut: {
        standardTime: "12:00",
        earliestTime: "06:00",
        latestTime: "14:00",
        additionalCharges: {
          late: {
            afterTime: "14:00",
            charge: 100,
            description: "Late check-out subject to availability and transfer schedule"
          }
        },
        requirements: [
          "Room key return",
          "Settlement of all charges",
          "Transfer confirmation"
        ]
      },
      child: {
        maxChildAge: 11,
        maxInfantAge: 2,
        allowChildren: true,
        childrenStayFree: true,
        maxChildrenFree: 2,
        requiresAdult: true,
        minAdultAge: 18,
        extraBedPolicy: {
          available: true,
          maxExtraBeds: 1,
          charge: 50,
          chargeType: "per_night"
        },
        restrictions: [
          "Children must be supervised at all times near water",
          "Age restrictions apply for certain water activities",
          "Children under 16 not allowed in spa"
        ]
      },
      pet: {
        allowPets: false,
        maxPets: 0,
        petTypes: [],
        restrictions: [
          "No pets allowed due to island environmental regulations",
          "Exception made for service animals with proper documentation"
        ],
        requirements: [
          "Service animals require advance notification",
          "Valid documentation for service animals required"
        ]
      },
      dressCode: {
        general: "Resort casual attire appropriate to tropical climate",
        restaurants: [
          {
            name: "Ocean View",
            code: "Smart Casual",
            description: "Evening dress code applies after 18:30",
            restrictions: [
              "No wet swimwear",
              "Shirts and footwear required",
              "Smart casual attire for dinner"
            ]
          },
          {
            name: "Beach Bar & Grill",
            code: "Casual",
            description: "Relaxed beachwear acceptable during day",
            restrictions: [
              "Cover-ups required",
              "Footwear required"
            ]
          }
        ],
        publicAreas: [
          {
            area: "Reception & Lounge",
            code: "Resort Casual",
            description: "Appropriate resort wear required",
            restrictions: [
              "No wet clothing",
              "Footwear required"
            ]
          }
        ]
      }
    },
    features: {
      restaurants: [
        {
          name: 'Ocean View',
          cuisine: CuisineType.INTERNATIONAL,
          type: RestaurantType.BUFFET,
          dressCode: 'Smart Casual',
          openingHours: '06:30-23:00',
          description: 'All-day dining venue offering international cuisine with Asian influences.'
        },
        {
          name: 'Sunset Grill',
          cuisine: CuisineType.SEAFOOD,
          type: RestaurantType.FINE_DINING,
          dressCode: 'Smart Casual',
          openingHours: '19:00-22:30',
          description: 'Overwater restaurant specializing in fresh seafood and premium grills.'
        },
        {
          name: 'Teppanyaki',
          cuisine: CuisineType.JAPANESE,
          type: RestaurantType.SPECIALTY,
          dressCode: 'Smart Casual',
          openingHours: '19:00-22:30',
          description: 'Interactive dining experience featuring skilled teppanyaki chefs.'
        }
      ],
      spa: {
        name: 'Overwater Spa & Wellness',
        treatments: [
          'Massage',
          'Yoga',
          'Meditation',
          'Traditional Asian Treatments',
          'Ocean Healing Rituals',
          'Couple Experiences'
        ],
        openingHours: '09:00-21:00',
        description: 'Luxury overwater spa pavilions offering signature treatments.'
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
export const sampleData: any = {
  hotels: HOTELS.map(hotel => ({
    ...hotel,
    rooms: roomTypes.filter((room, index) => {
      // Assign different room types to each hotel
      if (hotel.id === 1) { // Grand Hotel Riveria
        return index < 2; // Deluxe Room and Ocean View Suite
      } else if (hotel.id === 2) { // Maldives Paradise Resort
        return index >= 2; // Beach Villa and Standard Room
      }
      return false;
    }),
    rates: defaultContracts[0].periodRates[0].roomRates[0].personTypeRates
  })),
  markets: defaultMarkets,
  marketGroups: defaultMarketGroups,
  contracts: defaultContracts,
  mealPlans: defaultMealPlans,
  currencySettings: currencySettings
};