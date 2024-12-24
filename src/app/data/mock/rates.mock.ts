import { ContractPeriodRate } from "src/app/models/types";

export const contractRates: ContractPeriodRate[] = [
  // Mediterranean Resort - Early Summer (01/05/2024 - 14/06/2024)
  {
    contractId: 1,
    periodId: 1,
    roomRates: [
      // Classic Mediterranean Room (id: 1)
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 120, // Single
              2: 170  // Double (max adults: 2)
            }
          },
          child: {
            rates: {
              1: 50  // One child (max children: 1)
            }
          },
          infant: {
            rates: {
              1: 0   // One infant (max infants: 1)
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 20, child: 10, infant: 0 },
          "HB": { adult: 40, child: 20, infant: 0 },
          "FB": { adult: 45, child: 25, infant: 0 },
          "AI": { adult: 60, child: 35, infant: 0 }
        }
      },
      // Superior Sea View (id: 2)
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 150, // Single
              2: 220  // Double (max adults: 2)
            }
          },
          child: {
            rates: {
              1: 60, // First child
              2: 50  // Second child (max children: 2)
            }
          },
          infant: {
            rates: {
              1: 0   // One infant (max infants: 1)
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 20, child: 10, infant: 0 },
          "HB": { adult: 40, child: 20, infant: 0 },
          "FB": { adult: 45, child: 25, infant: 0 },
          "AI": { adult: 60, child: 35, infant: 0 }
        }
      },
      // Deluxe Terrace Suite (id: 3)
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 200, // Single
              2: 280, // Double
              3: 350  // Triple (max adults: 3)
            }
          },
          child: {
            rates: {
              1: 80, // First child
              2: 70  // Second child (max children: 2)
            }
          },
          infant: {
            rates: {
              1: 0   // One infant (max infants: 1)
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 20, child: 10, infant: 0 },
          "HB": { adult: 40, child: 20, infant: 0 },
          "FB": { adult: 45, child: 25, infant: 0 },
          "AI": { adult: 60, child: 35, infant: 0 }
        }
      }
    ]
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
              2: 195  // Double (+15%)
            }
          },
          child: {
            rates: {
              1: 58  // Child rate (+15%)
            }
          },
          infant: {
            rates: {
              1: 0
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 23, child: 12, infant: 0 },
          "HB": { adult: 46, child: 23, infant: 0 },
          "FB": { adult: 52, child: 29, infant: 0 },
          "AI": { adult: 69, child: 40, infant: 0 }
        }
      },
      // Superior Sea View (id: 2)
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 173, // Single (+15%)
              2: 253  // Double (+15%)
            }
          },
          child: {
            rates: {
              1: 69, // First child (+15%)
              2: 58  // Second child (+15%)
            }
          },
          infant: {
            rates: {
              1: 0
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 23, child: 12, infant: 0 },
          "HB": { adult: 46, child: 23, infant: 0 },
          "FB": { adult: 52, child: 29, infant: 0 },
          "AI": { adult: 69, child: 40, infant: 0 }
        }
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
              3: 403  // Triple (+15%)
            }
          },
          child: {
            rates: {
              1: 92, // First child (+15%)
              2: 81  // Second child (+15%)
            }
          },
          infant: {
            rates: {
              1: 0
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 23, child: 12, infant: 0 },
          "HB": { adult: 46, child: 23, infant: 0 },
          "FB": { adult: 52, child: 29, infant: 0 },
          "AI": { adult: 69, child: 40, infant: 0 }
        }
      }
    ]
  },
  // High Summer (01/08/2024 - 15/09/2024) : +25% sur Early Summer
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
              1: 150, // Single (+25%)
              2: 213  // Double (+25%)
            }
          },
          child: {
            rates: {
              1: 63  // Child rate (+25%)
            }
          },
          infant: {
            rates: {
              1: 0
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 25, child: 13, infant: 0 },
          "HB": { adult: 50, child: 26, infant: 0 },
          "FB": { adult: 56, child: 31, infant: 0 },
          "AI": { adult: 75, child: 44, infant: 0 }
        }
      },
      // Superior Sea View (id: 2)
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 188, // Single (+25%)
              2: 275  // Double (+25%)
            }
          },
          child: {
            rates: {
              1: 75, // First child (+25%)
              2: 63  // Second child (+25%)
            }
          },
          infant: {
            rates: {
              1: 0
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 25, child: 13, infant: 0 },
          "HB": { adult: 50, child: 26, infant: 0 },
          "FB": { adult: 56, child: 31, infant: 0 },
          "AI": { adult: 75, child: 44, infant: 0 }
        }
      },
      // Deluxe Terrace Suite (id: 3)
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 250, // Single (+25%)
              2: 350, // Double (+25%)
              3: 438  // Triple (+25%)
            }
          },
          child: {
            rates: {
              1: 100, // First child (+25%)
              2: 88   // Second child (+25%)
            }
          },
          infant: {
            rates: {
              1: 0
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 25, child: 13, infant: 0 },
          "HB": { adult: 50, child: 26, infant: 0 },
          "FB": { adult: 56, child: 31, infant: 0 },
          "AI": { adult: 75, child: 44, infant: 0 }
        }
      }
    ]
  },
  // Late Summer (16/09/2024 - 31/10/2024) : -10% sur Early Summer
  {
    contractId: 1,
    periodId: 4,
    roomRates: [
      // Classic Mediterranean Room (id: 1)
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 108, // Single (-10%)
              2: 153  // Double (-10%)
            }
          },
          child: {
            rates: {
              1: 45  // Child rate (-10%)
            }
          },
          infant: {
            rates: {
              1: 0
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 18, child: 9, infant: 0 },
          "HB": { adult: 36, child: 19, infant: 0 },
          "FB": { adult: 41, child: 23, infant: 0 },
          "AI": { adult: 54, child: 32, infant: 0 }
        }
      },
      // Superior Sea View (id: 2)
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 135, // Single (-10%)
              2: 198  // Double (-10%)
            }
          },
          child: {
            rates: {
              1: 54, // First child (-10%)
              2: 45  // Second child (-10%)
            }
          },
          infant: {
            rates: {
              1: 0
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 18, child: 9, infant: 0 },
          "HB": { adult: 36, child: 19, infant: 0 },
          "FB": { adult: 41, child: 23, infant: 0 },
          "AI": { adult: 54, child: 32, infant: 0 }
        }
      },
      // Deluxe Terrace Suite (id: 3)
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 180, // Single (-10%)
              2: 252, // Double (-10%)
              3: 315  // Triple (-10%)
            }
          },
          child: {
            rates: {
              1: 72, // First child (-10%)
              2: 63  // Second child (-10%)
            }
          },
          infant: {
            rates: {
              1: 0
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 18, child: 9, infant: 0 },
          "HB": { adult: 36, child: 19, infant: 0 },
          "FB": { adult: 41, child: 23, infant: 0 },
          "AI": { adult: 54, child: 32, infant: 0 }
        }
      }
    ]
  },

  // Maldives Paradise Resort - Early Peak (01/05/2024 - 14/06/2024)
  {
    contractId: 4,
    periodId: 1,
    roomRates: [
      // Water Villa
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 280, // Single
              2: 380  // Double (max adults: 2)
            }
          },
          child: {
            rates: {
              1: 95  // One child (max children: 1)
            }
          },
          infant: {
            rates: {
              1: 0   // One infant (max infants: 1)
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 35, child: 18, infant: 0 },
          "HB": { adult: 65, child: 33, infant: 0 },
          "FB": { adult: 85, child: 43, infant: 0 },
          "AI": { adult: 120, child: 60, infant: 0 }
        }
      },
      // Beach Villa
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 320, // Single
              2: 440  // Double (max adults: 2)
            }
          },
          child: {
            rates: {
              1: 110, // First child
              2: 95   // Second child (max children: 2)
            }
          },
          infant: {
            rates: {
              1: 0    // One infant (max infants: 1)
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 35, child: 18, infant: 0 },
          "HB": { adult: 65, child: 33, infant: 0 },
          "FB": { adult: 85, child: 43, infant: 0 },
          "AI": { adult: 120, child: 60, infant: 0 }
        }
      }
    ]
  },

  // Le Tropical Paradise Resort - Early High Season (01/05/2024 - 14/06/2024)
  {
    contractId: 7,
    periodId: 1,
    roomRates: [
      // Garden View Room
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 180, // Single
              2: 240  // Double (max adults: 2)
            }
          },
          child: {
            rates: {
              1: 70  // One child (max children: 1)
            }
          },
          infant: {
            rates: {
              1: 0   // One infant (max infants: 1)
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 25, child: 13, infant: 0 },
          "HB": { adult: 45, child: 23, infant: 0 },
          "FB": { adult: 60, child: 30, infant: 0 },
          "AI": { adult: 85, child: 43, infant: 0 }
        }
      },
      // Ocean View Suite
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 250, // Single
              2: 340, // Double
              3: 420  // Triple (max adults: 3)
            }
          },
          child: {
            rates: {
              1: 85, // First child
              2: 75  // Second child (max children: 2)
            }
          },
          infant: {
            rates: {
              1: 0   // One infant (max infants: 1)
            }
          }
        },
        mealPlanRates: {
          "RO": { adult: 0, child: 0, infant: 0 },
          "BB": { adult: 25, child: 13, infant: 0 },
          "HB": { adult: 45, child: 23, infant: 0 },
          "FB": { adult: 60, child: 30, infant: 0 },
          "AI": { adult: 85, child: 43, infant: 0 }
        }
      }
    ]
  }
];
