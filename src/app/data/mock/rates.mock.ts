import { ContractPeriodRate } from "src/app/models/types";

export const contractRates: ContractPeriodRate[] = [
  {
    contractId: 1, // Grand Riveria Peak Season 2025 - France
    periodId: 1, // Early Peak Period (2025-01-01 to 2025-03-31)
    roomRates: [
      // Classic Mediterranean Room (id: 1)
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 180, // Single occupancy base rate
              2: 220, // Double occupancy (max adults: 2)
            },
          },
          child: {
            rates: {
              1: 80, // One child (max children: 1)
            },
          },
          infant: {
            rates: {
              1: 0, // One infant (max infants: 1)
            },
          },
        },
        mealPlanRates: {
          RO: { adult: 0, child: 0, infant: 0 }, // Room Only
          BB: { adult: 25, child: 13, infant: 0 }, // Bed & Breakfast
          HB: { adult: 45, child: 23, infant: 0 }, // Half Board
          FB: { adult: 55, child: 28, infant: 0 }, // Full Board
          AI: { adult: 70, child: 35, infant: 0 }, // All Inclusive
        },
      },
      // Superior Sea View (id: 2)
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 220, // Single occupancy
              2: 280, // Double occupancy (max adults: 2)
            },
          },
          child: {
            rates: {
              1: 90, // First child
              2: 80, // Second child (max children: 2)
            },
          },
          infant: {
            rates: {
              1: 0, // One infant (max infants: 1)
            },
          },
        },
        mealPlanRates: {
          RO: { adult: 0, child: 0, infant: 0 },
          BB: { adult: 25, child: 13, infant: 0 },
          HB: { adult: 45, child: 23, infant: 0 },
          FB: { adult: 55, child: 28, infant: 0 },
          AI: { adult: 70, child: 35, infant: 0 },
        },
      },
      // Deluxe Terrace Suite (id: 3)
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 300, // Single
              2: 380, // Double
              3: 450, // Triple (max adults: 3)
            },
          },
          child: {
            rates: {
              1: 100, // First child
              2: 90, // Second child (max children: 2)
            },
          },
          infant: {
            rates: {
              1: 0, // One infant (max infants: 1)
            },
          },
        },
        mealPlanRates: {
          RO: { adult: 0, child: 0, infant: 0 },
          BB: { adult: 25, child: 13, infant: 0 },
          HB: { adult: 45, child: 23, infant: 0 },
          FB: { adult: 55, child: 28, infant: 0 },
          AI: { adult: 70, child: 35, infant: 0 },
        },
      },
    ],
  },
  // Mid Summer (15/06/2024 - 31/07/2024) : +15% sur Early Summer
  {
    contractId: 1,
    periodId: 2,
    roomRates: [
      // Classic Mediterranean Room (id: 1)
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 138, // Single (+15%)
              2: 195, // Double (+15%)
            },
          },
          child: {
            rates: {
              1: 58, // Child rate (+15%)
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          RO: { adult: 0, child: 0, infant: 0 },
          BB: { adult: 23, child: 12, infant: 0 },
          HB: { adult: 46, child: 23, infant: 0 },
          FB: { adult: 52, child: 29, infant: 0 },
          AI: { adult: 69, child: 40, infant: 0 },
        },
      },
      // Superior Sea View (id: 2)
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 173, // Single (+15%)
              2: 253, // Double (+15%)
            },
          },
          child: {
            rates: {
              1: 69, // First child (+15%)
              2: 58, // Second child (+15%)
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          RO: { adult: 0, child: 0, infant: 0 },
          BB: { adult: 23, child: 12, infant: 0 },
          HB: { adult: 46, child: 23, infant: 0 },
          FB: { adult: 52, child: 29, infant: 0 },
          AI: { adult: 69, child: 40, infant: 0 },
        },
      },
      // Deluxe Terrace Suite (id: 3)
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 230, // Single (+15%)
              2: 322, // Double (+15%)
              3: 403, // Triple (+15%)
            },
          },
          child: {
            rates: {
              1: 92, // First child (+15%)
              2: 81, // Second child (+15%)
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          RO: { adult: 0, child: 0, infant: 0 },
          BB: { adult: 23, child: 12, infant: 0 },
          HB: { adult: 46, child: 23, infant: 0 },
          FB: { adult: 52, child: 29, infant: 0 },
          AI: { adult: 69, child: 40, infant: 0 },
        },
      },
    ],
  },
  // Mid Peak Period (2025-04-01 to 2025-06-30) - 15% increase from Period 1
  {
    contractId: 1,
    periodId: 3,
    roomRates: [
      // Classic Mediterranean Room (id: 1)
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 207, // Single (+15%)
              2: 253, // Double (+15%)
            },
          },
          child: {
            rates: {
              1: 92, // One child (+15%)
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          RO: { adult: 0, child: 0, infant: 0 },
          BB: { adult: 29, child: 15, infant: 0 },
          HB: { adult: 52, child: 26, infant: 0 },
          FB: { adult: 63, child: 32, infant: 0 },
          AI: { adult: 81, child: 40, infant: 0 },
        },
      },
      // Superior Sea View (id: 2)
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 253, // Single (+15%)
              2: 322, // Double (+15%)
            },
          },
          child: {
            rates: {
              1: 104, // First child (+15%)
              2: 92, // Second child (+15%)
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          RO: { adult: 0, child: 0, infant: 0 },
          BB: { adult: 29, child: 15, infant: 0 },
          HB: { adult: 52, child: 26, infant: 0 },
          FB: { adult: 63, child: 32, infant: 0 },
          AI: { adult: 81, child: 40, infant: 0 },
        },
      },
      // Deluxe Terrace Suite (id: 3)
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 345, // Single (+15%)
              2: 437, // Double (+15%)
              3: 518, // Triple (+15%)
            },
          },
          child: {
            rates: {
              1: 115, // First child (+15%)
              2: 104, // Second child (+15%)
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          RO: { adult: 0, child: 0, infant: 0 },
          BB: { adult: 29, child: 15, infant: 0 },
          HB: { adult: 52, child: 26, infant: 0 },
          FB: { adult: 63, child: 32, infant: 0 },
          AI: { adult: 81, child: 40, infant: 0 },
        },
      },
    ],
  },

  // Late Peak Period (2025-07-01 to 2025-09-30) - 25% increase from Period 1
  // {
  //   contractId: 1,
  //   periodId: 4,
  //   roomRates: [
  //     // Classic Mediterranean Room (id: 1)
  //     {
  //       roomTypeId: 1,
  //       rateType: "per_pax",
  //       personTypeRates: {
  //         adult: {
  //           rates: {
  //             1: 225, // Single (+25%)
  //             2: 275, // Double (+25%)
  //           },
  //         },
  //         child: {
  //           rates: {
  //             1: 100, // One child (+25%)
  //           },
  //         },
  //         infant: {
  //           rates: {
  //             1: 0,
  //           },
  //         },
  //       },
  //       mealPlanRates: {
  //         RO: { adult: 0, child: 0, infant: 0 },
  //         BB: { adult: 31, child: 16, infant: 0 },
  //         HB: { adult: 56, child: 29, infant: 0 },
  //         FB: { adult: 69, child: 35, infant: 0 },
  //         AI: { adult: 88, child: 44, infant: 0 },
  //       },
  //     },
  //     // Superior Sea View (id: 2)
  //     {
  //       roomTypeId: 2,
  //       rateType: "per_pax",
  //       personTypeRates: {
  //         adult: {
  //           rates: {
  //             1: 275, // Single (+25%)
  //             2: 350, // Double (+25%)
  //           },
  //         },
  //         child: {
  //           rates: {
  //             1: 113, // First child (+25%)
  //             2: 100, // Second child (+25%)
  //           },
  //         },
  //         infant: {
  //           rates: {
  //             1: 0,
  //           },
  //         },
  //       },
  //       mealPlanRates: {
  //         RO: { adult: 0, child: 0, infant: 0 },
  //         BB: { adult: 31, child: 16, infant: 0 },
  //         HB: { adult: 56, child: 29, infant: 0 },
  //         FB: { adult: 69, child: 35, infant: 0 },
  //         AI: { adult: 88, child: 44, infant: 0 },
  //       },
  //     },
  //     // Deluxe Terrace Suite (id: 3)
  //     {
  //       roomTypeId: 3,
  //       rateType: "per_pax",
  //       personTypeRates: {
  //         adult: {
  //           rates: {
  //             1: 375, // Single (+25%)
  //             2: 475, // Double (+25%)
  //             3: 563, // Triple (+25%)
  //           },
  //         },
  //         child: {
  //           rates: {
  //             1: 125, // First child (+25%)
  //             2: 113, // Second child (+25%)
  //           },
  //         },
  //         infant: {
  //           rates: {
  //             1: 0,
  //           },
  //         },
  //       },
  //       mealPlanRates: {
  //         RO: { adult: 0, child: 0, infant: 0 },
  //         BB: { adult: 31, child: 16, infant: 0 },
  //         HB: { adult: 56, child: 29, infant: 0 },
  //         FB: { adult: 69, child: 35, infant: 0 },
  //         AI: { adult: 88, child: 44, infant: 0 },
  //       },
  //     },
  //   ],
  // },

  // Period 7: Peak Season (2025-01-10 to 2025-03-15)
  {
    contractId: 4,
    periodId: 7,
    roomRates: [
      // Garden Villa (id: 6)
      {
        roomTypeId: 6,
        rateType: "per_villa",
        villaRate: 850, // Base villa rate for peak season
        mealPlanRates: {
          FB: { adult: 0, child: 0, teen: 0, infant: 0 }, // Base meal plan
          AI: { adult: 120, child: 60, teen: 90, infant: 0 }, // All Inclusive
          AI_PLUS: { adult: 150, child: 75, teen: 115, infant: 0 }, // Premium AI
          UAI: { adult: 180, child: 90, teen: 135, infant: 0 }, // Ultra AI
        },
      },
      // Beach Villa (id: 7)
      {
        roomTypeId: 7,
        rateType: "per_villa",
        villaRate: 1050, // Premium location
        mealPlanRates: {
          FB: { adult: 0, child: 0, teen: 0, infant: 0 },
          AI: { adult: 120, child: 60, teen: 90, infant: 0 },
          AI_PLUS: { adult: 150, child: 75, teen: 115, infant: 0 },
          UAI: { adult: 180, child: 90, teen: 135, infant: 0 },
        },
      },
      // Overwater Villa (id: 8)
      {
        roomTypeId: 8,
        rateType: "per_villa",
        villaRate: 1250, // Most premium villa type
        mealPlanRates: {
          FB: { adult: 0, child: 0, teen: 0, infant: 0 },
          AI: { adult: 120, child: 60, teen: 90, infant: 0 },
          AI_PLUS: { adult: 150, child: 75, teen: 115, infant: 0 },
          UAI: { adult: 180, child: 90, teen: 135, infant: 0 },
        },
      },
    ],
  },

  // Period 8: Late Peak (2025-03-16 to 2025-04-30) - 15% lower than peak
  {
    contractId: 4,
    periodId: 8,
    roomRates: [
      // Garden Villa (id: 6)
      {
        roomTypeId: 6,
        rateType: "per_villa",
        villaRate: 723, // 15% off peak rate
        mealPlanRates: {
          FB: { adult: 0, child: 0, teen: 0, infant: 0 },
          AI: { adult: 120, child: 60, teen: 90, infant: 0 },
          AI_PLUS: { adult: 150, child: 75, teen: 115, infant: 0 },
          UAI: { adult: 180, child: 90, teen: 135, infant: 0 },
        },
      },
      // Beach Villa (id: 7)
      {
        roomTypeId: 7,
        rateType: "per_villa",
        villaRate: 893, // 15% off peak rate
        mealPlanRates: {
          FB: { adult: 0, child: 0, teen: 0, infant: 0 },
          AI: { adult: 120, child: 60, teen: 90, infant: 0 },
          AI_PLUS: { adult: 150, child: 75, teen: 115, infant: 0 },
          UAI: { adult: 180, child: 90, teen: 135, infant: 0 },
        },
      },
      // Overwater Villa (id: 8)
      {
        roomTypeId: 8,
        rateType: "per_villa",
        villaRate: 1063, // 15% off peak rate
        mealPlanRates: {
          FB: { adult: 0, child: 0, teen: 0, infant: 0 },
          AI: { adult: 120, child: 60, teen: 90, infant: 0 },
          AI_PLUS: { adult: 150, child: 75, teen: 115, infant: 0 },
          UAI: { adult: 180, child: 90, teen: 135, infant: 0 },
        },
      },
    ],
  },

  // Early High Season (Period ID: 16, 2025-01-10 to 2025-03-31)
  {
    contractId: 7,
    periodId: 16,
    roomRates: [
      // Deluxe Garden View (id: 11)
      {
        roomTypeId: 11,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 250, // Single
              2: 180, // Double (per person, max adults: 2)
            },
          },
          child: {
            rates: {
              1: 90, // First child
              2: 80, // Second child (max children: 2)
            },
          },
          infant: {
            rates: {
              1: 0, // One infant (max infants: 1)
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 }, // Base meal plan
          FB: { adult: 35, child: 18, infant: 0 }, // Full Board supplement
          AI: { adult: 65, child: 33, infant: 0 }, // All Inclusive supplement
          AI_PLUS: { adult: 85, child: 43, infant: 0 }, // Premium AI supplement
        },
      },
      // Premium Ocean View (id: 12)
      {
        roomTypeId: 12,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 300, // Single
              2: 220, // Double (per person, max adults: 2)
            },
          },
          child: {
            rates: {
              1: 110, // First child
              2: 100, // Second child (max children: 2)
            },
          },
          infant: {
            rates: {
              1: 0, // One infant (max infants: 1)
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 },
          FB: { adult: 35, child: 18, infant: 0 },
          AI: { adult: 65, child: 33, infant: 0 },
          AI_PLUS: { adult: 85, child: 43, infant: 0 },
        },
      },
      // Family Suite (id: 13)
      {
        roomTypeId: 13,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 380, // Single
              2: 280, // Double (per person, max adults: 2)
            },
          },
          child: {
            rates: {
              1: 140, // First child
              2: 120, // Second child
              3: 100, // Third child (max children: 3)
            },
          },
          infant: {
            rates: {
              1: 0, // One infant (max infants: 1)
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 },
          FB: { adult: 35, child: 18, infant: 0 },
          AI: { adult: 65, child: 33, infant: 0 },
          AI_PLUS: { adult: 85, child: 43, infant: 0 },
        },
      },
    ],
  },

  // Easter Holiday (Period ID: 17, 2025-04-01 to 2025-04-15) - 25% increase
  {
    contractId: 7,
    periodId: 17,
    roomRates: [
      // Deluxe Garden View with 25% increase
      {
        roomTypeId: 11,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 313, // Single (+25%)
              2: 225, // Double (+25%)
            },
          },
          child: {
            rates: {
              1: 113, // First child (+25%)
              2: 100, // Second child (+25%)
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 },
          FB: { adult: 44, child: 22, infant: 0 }, // +25%
          AI: { adult: 81, child: 41, infant: 0 }, // +25%
          AI_PLUS: { adult: 106, child: 54, infant: 0 }, // +25%
        },
      },
      // Continue with Premium Ocean View and Family Suite with similar 25% increases...
    ],
  },

  // Late High Season (Period ID: 18, 2025-04-16 to 2025-05-31) - 10% decrease
  {
    contractId: 7,
    periodId: 18,
    roomRates: [
      // Deluxe Garden View with 10% decrease
      {
        roomTypeId: 11,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 225, // Single (-10%)
              2: 162, // Double (-10%)
            },
          },
          child: {
            rates: {
              1: 81, // First child (-10%)
              2: 72, // Second child (-10%)
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 },
          FB: { adult: 25, child: 12, infant: 0 }, // -10%
          AI: { adult: 59, child: 30, infant: 0 }, // -10%
          AI_PLUS: { adult: 77, child: 39, infant: 0 }, // -10%
        },
      },
    ],
  },

  // Pre-Christmas Period (Period ID: 25, 2025-12-01 to 2025-12-22)
  {
    contractId: 11,
    periodId: 25,
    roomRates: [
      // Deluxe Garden View (id: 11)
      {
        roomTypeId: 11,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 200, // Single Occupancy
              2: 250, // Double Occupancy (per person)
            },
          },
          child: {
            rates: {
              1: 0, // First child
              2: 0, // Second child
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 }, // Base meal plan
          FB: { adult: 25, child: 12, infant: 0 },
          AI: { adult: 55, child: 28, infant: 0 },
          AI_PLUS: { adult: 75, child: 38, infant: 0 },
        },
      },
      // Premium Ocean View (id: 12)
      {
        roomTypeId: 12,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 280,
              2: 210,
            },
          },
          child: {
            rates: {
              1: 105,
              2: 90,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 },
          FB: { adult: 30, child: 15, infant: 0 },
          AI: { adult: 55, child: 28, infant: 0 },
          AI_PLUS: { adult: 75, child: 38, infant: 0 },
        },
      },
      // Family Suite (id: 13)
      {
        roomTypeId: 13,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 350,
              2: 260,
            },
          },
          child: {
            rates: {
              1: 130,
              2: 110,
              3: 90,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 },
          FB: { adult: 30, child: 15, infant: 0 },
          AI: { adult: 55, child: 28, infant: 0 },
          AI_PLUS: { adult: 75, child: 38, infant: 0 },
        },
      },
      // Beach Villa (id: 14)
      {
        roomTypeId: 14,
        rateType: "per_villa",
        villaRate: 1200, // Example base rate per villa
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 },
          FB: { adult: 50, child: 25, infant: 0 },
          AI: { adult: 80, child: 40, infant: 0 },
          AI_PLUS: { adult: 120, child: 60, infant: 0 },
        },
      },
    ],
  },
  // Christmas Period (Period ID: 26, 2025-12-23 to 2026-01-05) - Increased Rates
  {
    contractId: 11,
    periodId: 26,
    roomRates: [
      // Deluxe Garden View (id: 11)
      {
        roomTypeId: 11,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 250, // Single Occupancy (increased)
              2: 350, // Double Occupancy (per person, increased)
            },
          },
          child: {
            rates: {
              1: 75, // First child (increased)
              2: 0, // Second child (increased)
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 }, // Base meal plan
          FB: { adult: 25, child: 12, infant: 0 }, // Increased
          AI: { adult: 69, child: 35, infant: 0 }, // Increased
          AI_PLUS: { adult: 94, child: 47, infant: 0 }, // Increased
        },
      },
      // Premium Ocean View (id: 12)
      {
        roomTypeId: 12,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 350, // Increased
              2: 263, // Increased
            },
          },
          child: {
            rates: {
              1: 131, // Increased
              2: 113, // Increased
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 },
          FB: { adult: 38, child: 19, infant: 0 }, // Increased
          AI: { adult: 69, child: 35, infant: 0 }, // Increased
          AI_PLUS: { adult: 94, child: 47, infant: 0 }, // Increased
        },
      },
      // Family Suite (id: 13)
      {
        roomTypeId: 13,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 438, // Increased
              2: 325, // Increased
            },
          },
          child: {
            rates: {
              1: 163, // Increased
              2: 138, // Increased
              3: 113, // Increased
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 },
          FB: { adult: 38, child: 19, infant: 0 }, // Increased
          AI: { adult: 69, child: 35, infant: 0 }, // Increased
          AI_PLUS: { adult: 94, child: 47, infant: 0 }, // Increased
        },
      },
      // Beach Villa (id: 14)
      {
        roomTypeId: 14,
        rateType: "per_villa",
        villaRate: 1500, // Example base rate per villa - increased
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 }, // No additional cost for HB (base)
          FB: { adult: 63, child: 31, infant: 0 }, // Example FB supplement per person
          AI: { adult: 100, child: 50, infant: 0 }, // Example AI supplement per person
          AI_PLUS: { adult: 150, child: 75, infant: 0 }, // Example AI PLUS supplement
        },
      },
    ],
  },
  {
    contractId: 11,
    periodId: 27,
    roomRates: [
      // Deluxe Garden View (id: 11)
      {
        roomTypeId: 11,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 250, // Single Occupancy
              2: 300, // Double Occupancy (per person)
            },
          },
          child: {
            rates: {
              1: 0, // First child
              2: 0, // Second child
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 }, // Base meal plan
          FB: { adult: 25, child: 12, infant: 0 },
          AI: { adult: 55, child: 28, infant: 0 },
          AI_PLUS: { adult: 75, child: 38, infant: 0 },
        },
      },
      // Premium Ocean View (id: 12)
      {
        roomTypeId: 12,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 330,
              2: 250,
            },
          },
          child: {
            rates: {
              1: 120,
              2: 105,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 },
          FB: { adult: 30, child: 15, infant: 0 },
          AI: { adult: 55, child: 28, infant: 0 },
          AI_PLUS: { adult: 75, child: 38, infant: 0 },
        },
      },
      // Family Suite (id: 13)
      {
        roomTypeId: 13,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 400,
              2: 300,
            },
          },
          child: {
            rates: {
              1: 150,
              2: 125,
              3: 100,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 },
          FB: { adult: 30, child: 15, infant: 0 },
          AI: { adult: 55, child: 28, infant: 0 },
          AI_PLUS: { adult: 75, child: 38, infant: 0 },
        },
      },
      // Beach Villa (id: 14)
      {
        roomTypeId: 14,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 480,
              2: 360,
            },
          },
          child: {
            rates: {
              1: 190,
              2: 165,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          HB: { adult: 0, child: 0, infant: 0 },
          FB: { adult: 30, child: 15, infant: 0 },
          AI: { adult: 55, child: 28, infant: 0 },
          AI_PLUS: { adult: 75, child: 38, infant: 0 },
        },
      },
    ],
  },
];
