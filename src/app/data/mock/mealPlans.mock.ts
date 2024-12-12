// src/data/mock/mealPlans.mock.ts
import { MealPlan, MealPlanType } from '../../models/types';

// Default meal plans available for all hotels
export const defaultMealPlans: MealPlan[] = [
  {
    id: 'default-ro',
    type: MealPlanType.RO,
    name: 'Room Only',
    description: "Accommodation only, no meals included",
    mealTimes: [],
    inclusions: [],
    restrictions: [
      'No meals included',
      'Room service and restaurant charges are extra'
    ],
    isActive: true
  },
  {
    id: 'default-bb',
    type: MealPlanType.BB,
    name: 'Bed & Breakfast',
    description: "Start your day with our extensive breakfast buffet",
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
    id: 'default-hb',
    type: MealPlanType.HB,
    name: 'Half Board',
    description: "Enjoy breakfast and dinner at our restaurants",
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
        description: 'Full breakfast buffet',
        isIncluded: true
      },
      {
        name: 'Dinner Buffet',
        description: 'International dinner buffet with themed nights',
        isIncluded: true
      }
    ],
    restrictions: [
      'Meals must be taken in designated restaurants',
      'Beverages not included'
    ],
    isActive: true
  },
  {
    id: 'default-fb',
    type: MealPlanType.FB,
    name: 'Full Board',
    description: "All daily meals included",
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
        endTime: '14:30',
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
        description: 'Water during meals',
        isIncluded: true
      }
    ],
    restrictions: [
      'Meals must be taken in designated restaurants',
      'Additional beverages not included'
    ],
    isActive: true
  },
  {
    id: 'default-ai',
    type: MealPlanType.AI,
    name: 'All Inclusive',
    description: "Complete package with all meals and selected beverages",
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
        endTime: '14:30',
        location: 'Main Restaurant'
      },
      {
        name: 'Dinner',
        startTime: '19:00',
        endTime: '22:30',
        location: 'Main Restaurant'
      },
      {
        name: 'Snacks',
        startTime: '11:00',
        endTime: '18:00',
        location: 'Pool Bar'
      }
    ],
    inclusions: [
      {
        name: 'All Meals',
        description: 'All meals and snacks throughout the day',
        isIncluded: true
      },
      {
        name: 'Beverages',
        description: 'Selected alcoholic and non-alcoholic beverages',
        isIncluded: true
      },
      {
        name: 'Snacks',
        description: 'Light snacks and refreshments',
        isIncluded: true
      }
    ],
    restrictions: [
      'Premium drinks may incur additional charges',
      'All-inclusive benefits valid from check-in to check-out'
    ],
    isActive: true
  }
];

// Hotel-specific meal plans
export const hotelMealPlans: Record<number, MealPlan[]> = {
  // Grand Hotel Riveria (id: 1) specific meal plans
  1: [
    {
      id: 'riveria-bb-plus',
      type: MealPlanType.BB_PLUS,
      name: 'Mediterranean Breakfast Experience',
      description: "Enhanced breakfast experience with local specialties",
      mealTimes: [
        {
          name: 'Breakfast',
          startTime: '07:00',
          endTime: '11:00',
          location: 'La Terrazza'
        }
      ],
      inclusions: [
        {
          name: 'Gourmet Breakfast',
          description: 'Extended breakfast with local specialties and prosecco',
          isIncluded: true
        },
        {
          name: 'Room Service Breakfast',
          description: 'Optional in-room breakfast service',
          isIncluded: true
        }
      ],
      restrictions: [
        'Room service breakfast must be ordered the night before',
        'Premium champagne available at additional cost'
      ],
      isActive: true
    },
    {
      id: 'riveria-hb-plus',
      type: MealPlanType.HB_PLUS,
      name: 'Gourmet Half Board',
      description: "Premium half board with fine dining options",
      mealTimes: [
        {
          name: 'Breakfast',
          startTime: '07:00',
          endTime: '11:00',
          location: 'La Terrazza'
        },
        {
          name: 'Dinner',
          startTime: '19:00',
          endTime: '23:00',
          location: 'Il Giardino'
        }
      ],
      inclusions: [
        {
          name: 'Fine Dining',
          description: 'À la carte dinner at signature restaurants',
          isIncluded: true
        },
        {
          name: 'Beverages',
          description: 'Selected wines with dinner',
          isIncluded: true
        }
      ],
      restrictions: [
        'Reservation required for dinner',
        'Some specialty dishes may incur supplements'
      ],
      isActive: true
    }
  ],
  // Maldives Paradise Resort (id: 2) specific meal plans
  2: [
    {
      id: 'maldives-ai-plus',
      type: MealPlanType.AI_PLUS,
      name: 'Premium All Inclusive',
      description: "Enhanced all-inclusive experience with premium benefits",
      mealTimes: [
        {
          name: 'Breakfast',
          startTime: '07:00',
          endTime: '10:30',
          location: 'Ocean View Restaurant'
        },
        {
          name: 'Lunch',
          startTime: '12:30',
          endTime: '15:00',
          location: 'Beach Club'
        },
        {
          name: 'Afternoon Tea',
          startTime: '16:00',
          endTime: '17:30',
          location: 'Sunset Lounge'
        },
        {
          name: 'Dinner',
          startTime: '19:00',
          endTime: '22:30',
          location: 'Multiple Restaurants'
        }
      ],
      inclusions: [
        {
          name: 'Premium Dining',
          description: 'Dine-around at all restaurants including specialty venues',
          isIncluded: true
        },
        {
          name: 'Premium Beverages',
          description: 'Premium branded drinks and cocktails',
          isIncluded: true
        },
        {
          name: 'Mini Bar',
          description: 'Daily restocked premium mini bar',
          isIncluded: true
        },
        {
          name: 'Activities',
          description: 'Selected water sports and excursions',
          isIncluded: true
        }
      ],
      restrictions: [
        'Some premium wines and champagnes may incur charges',
        'Advance booking required for specialty restaurants'
      ],
      isActive: true
    },
    {
      id: 'maldives-uai',
      type: MealPlanType.UAI,
      name: 'Ultimate Luxury All Inclusive',
      description: "The most comprehensive all-inclusive experience with exclusive privileges and luxury services",
      mealTimes: [
        {
          name: 'Breakfast',
          startTime: '07:00',
          endTime: '11:00',
          location: 'Any Restaurant'
        },
        {
          name: 'Lunch',
          startTime: '12:00',
          endTime: '15:30',
          location: 'Any Restaurant'
        },
        {
          name: 'Afternoon Tea',
          startTime: '15:30',
          endTime: '17:30',
          location: 'Sunset Lounge'
        },
        {
          name: 'Dinner',
          startTime: '18:30',
          endTime: '23:00',
          location: 'Any Restaurant'
        },
        {
          name: '24/7 Service',
          startTime: '00:00',
          endTime: '23:59',
          location: 'In-Villa Dining'
        }
      ],
      inclusions: [
        {
          name: 'Premium Dining',
          description: 'Unlimited access to all restaurants including specialty venues with no restrictions',
          isIncluded: true
        },
        {
          name: 'Luxury Beverages',
          description: 'Premium spirits, champagnes, and rare wines from our collection',
          isIncluded: true
        },
        {
          name: 'Exclusive Services',
          description: '24/7 butler service, private chef experiences, and exclusive dining setups',
          isIncluded: true
        },
        {
          name: 'Activities',
          description: 'Unlimited water sports, excursions, and spa treatments',
          isIncluded: true
        },
        {
          name: 'Transportation',
          description: 'Complimentary seaplane transfers and luxury yacht services',
          isIncluded: true
        }
      ],
      restrictions: [
        'Some ultra-premium wines from the reserve list may incur additional charges',
        'Private chef experiences require 24-hour advance booking',
        'Spa treatments limited to two per day per person'
      ],
      isActive: true
    }
  ]
};

// Helper functions for meal plan management
export const mealPlanUtils = {
  getMealPlansByHotel: (hotelId: number): MealPlan[] => {
    return [
      ...defaultMealPlans,
      ...(hotelMealPlans[hotelId] || [])
    ];
  },
  
  getMealPlanById: (planId: string): MealPlan | undefined => {
    const allPlans = [
      ...defaultMealPlans,
      ...Object.values(hotelMealPlans).flat()
    ];
    return allPlans.find(plan => plan.id === planId);
  },

  isDefaultPlan: (planId: string): boolean => {
    return planId.startsWith('default-');
  }
};

// Export types for meal plan management
export type MealPlanOperation = {
  hotelId: number;
  planId: string;
  operation: 'add' | 'update' | 'remove';
  data?: Partial<MealPlan>;
};
