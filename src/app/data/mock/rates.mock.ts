import { ContractPeriodRate, RoomTypeRate } from '../../models/types';

export const contractRates: { [contractId: number]: ContractPeriodRate[] } = {
  // Contract 1: GHR-FR-S24 (Grand Riveria Summer 2024 - France)
  1: [
    {
      periodId: 1, // Early Summer
      roomRates: [
        {
          roomTypeId: 1, // Classic Mediterranean
          rateType: 'per_pax',
          personTypeRates: {
            'adult': {
              rates: {
                1: 200, // Single occupancy
                2: 150, // Double occupancy per person
                3: 130  // Triple occupancy per person
              }
            },
            'child': {
              rates: {
                1: 75,  // First child
                2: 60   // Second child
              }
            },
            'infant': {
              rates: {
                1: 0    // Free
              }
            }
          },
          mealPlanRates: {
            'BB': { 'adult': 25, 'child': 15, 'infant': 0 },
            'HB': { 'adult': 45, 'child': 25, 'infant': 0 },
            'FB': { 'adult': 65, 'child': 35, 'infant': 0 },
            'AI': { 'adult': 95, 'child': 50, 'infant': 0 }
          }
        },
        {
          roomTypeId: 2, // Superior Sea View
          rateType: 'per_pax',
          personTypeRates: {
            'adult': {
              rates: {
                1: 280, // Single occupancy
                2: 200, // Double occupancy per person
                3: 180  // Triple occupancy per person
              }
            },
             'child': {
              rates: {
                1: 90,
                2: 75
              }
            },
            'infant': {
              rates: {
                1: 0
              }
            }
          },
          mealPlanRates: {
            'BB': { 'adult': 25, 'child': 15, 'infant': 0 },
            'HB': { 'adult': 45, 'child': 25, 'infant': 0 },
            'FB': { 'adult': 65, 'child': 35, 'infant': 0 },
            'AI': { 'adult': 95, 'child': 50, 'infant': 0 }
          }
        },
         {
          roomTypeId: 3, // Deluxe Terrace Suite
          rateType: 'per_pax',
           personTypeRates: {
            'adult': {
              rates: {
                1: 350,
                2: 250,
                3: 220
              }
            },
            'child': {
              rates: {
                1: 110,
                2: 90
              }
            },
            'infant': {
              rates: {
                1: 0
              }
            }
          },
          mealPlanRates: {
            'BB': { 'adult': 30, 'child': 20, 'infant': 0 },
            'HB': { 'adult': 55, 'child': 35, 'infant': 0 },
            'FB': { 'adult': 80, 'child': 45, 'infant': 0 },
            'AI': { 'adult': 120, 'child': 65, 'infant': 0 }
          }
        }
      ]
    }
  ],

  // Contract 2: MPR-UK-W24 (Maldives Paradise Winter 2024 - UK)
  2: [
    {
      periodId: 1, // Peak Winter
      roomRates: [
        {
          roomTypeId: 6, // Garden Villa
          rateType: 'per_villa',
          villaRate: 700,
           mealPlanRates: {
            'AI': { 'adult': 100, 'child': 50, 'infant': 0 },
            'UAI': { 'adult': 150, 'child': 75, 'infant': 0 }
          }
        },
        {
          roomTypeId: 7, // Beach Villa
          rateType: 'per_villa',
          villaRate: 850,
          mealPlanRates: {
            'AI': { 'adult': 120, 'child': 60, 'infant': 0 },
            'UAI': { 'adult': 180, 'child': 90, 'infant': 0 }
          }
        },
         {
          roomTypeId: 8, // Overwater Villa
          rateType: 'per_villa',
          villaRate: 950,
          mealPlanRates: {
            'AI': { 'adult': 130, 'child': 70, 'infant': 0 },
            'UAI': { 'adult': 200, 'child': 100, 'infant': 0 }
          }
        }
      ]
    }
  ],

  // Contract 7: GHR-US-A24 (Grand Riveria Annual 2024 - USA)
  7: [
    {
      periodId: 1, // Regular Season
      roomRates: [
        {
          roomTypeId: 1, // Classic Mediterranean
          rateType: 'per_pax',
          personTypeRates: {
            'adult': {
              rates: {
                1: 250, // Single occupancy
                2: 180, // Double occupancy per person
                3: 160  // Triple occupancy per person
              }
            },
            'child': {
              rates: {
                1: 85,
                2: 70
              }
            },
            'infant': {
              rates: {
                1: 0
              }
            }
          },
          mealPlanRates: {
            'BB': { 'adult': 30, 'child': 18, 'infant': 0 },
            'HB': { 'adult': 55, 'child': 30, 'infant': 0 },
            'FB': { 'adult': 75, 'child': 40, 'infant': 0 },
            'AI': { 'adult': 110, 'child': 60, 'infant': 0 }
          }
        },
         {
          roomTypeId: 4, // Family Suite
          rateType: 'per_pax',
           personTypeRates: {
            'adult': {
              rates: {
                1: 300,
                2: 220
              }
            },
            'child': {
              rates: {
                1: 100,
                2: 80,
                3: 60
              }
            },
            'infant': {
              rates: {
                1: 0
              }
            }
          },
          mealPlanRates: {
            'BB': { 'adult': 35, 'child': 20, 'infant': 0 },
            'HB': { 'adult': 60, 'child': 35, 'infant': 0 },
            'FB': { 'adult': 85, 'child': 50, 'infant': 0 },
            'AI': { 'adult': 130, 'child': 70, 'infant': 0 }
          }
        }
      ]
    }
  ],

  // Contract 8: MPR-JP-A24 (Maldives Paradise Annual 2024 - Japan)
  8: [
    {
      periodId: 1, // High Season
      roomRates: [
        {
          roomTypeId: 8, // Overwater Villa
          rateType: 'per_villa',
          villaRate: 1200,
          mealPlanRates: {
            'BB': { 'adult': 45, 'child': 25, 'infant': 0 },
            'HB': { 'adult': 85, 'child': 45, 'infant': 0 },
            'FB': { 'adult': 125, 'child': 65, 'infant': 0 },
            'AI': { 'adult': 180, 'child': 90, 'infant': 0 },
            'UAI': { 'adult': 250, 'child': 125, 'infant': 0 }
          }
        },
         {
          roomTypeId: 9, // Premium Pool Villa
          rateType: 'per_villa',
          villaRate: 1500,
          mealPlanRates: {
            'BB': { 'adult': 50, 'child': 30, 'infant': 0 },
            'HB': { 'adult': 90, 'child': 50, 'infant': 0 },
            'FB': { 'adult': 130, 'child': 70, 'infant': 0 },
            'AI': { 'adult': 200, 'child': 100, 'infant': 0 },
            'UAI': { 'adult': 280, 'child': 140, 'infant': 0 }
          }
        }
      ]
    }
  ]
};
