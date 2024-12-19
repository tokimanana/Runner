import { ContractPeriodRate } from "src/app/models/types";

export const contractRates: ContractPeriodRate[] = [
  {
    id: 1,
    periodId: 1,
    roomRates: [
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 180,
              2: 130,
            },
          },
          child: {
            rates: {
              1: 70,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 20, child: 12, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 50, child: 30, infant: 0 },
          "default-ai": { adult: 60, child: 35, infant: 0 },
        },
      },
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 220,
              2: 160,
              3: 140,
              4: 120,
            },
          },
          child: {
            rates: {
              1: 80,
              2: 60,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 25, child: 15, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 35, infant: 0 },
          "default-ai": { adult: 70, child: 40, infant: 0 },
        },
      },
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 300,
              2: 250,
              3: 220,
              4: 200,
            },
          },
          child: {
            rates: {
              1: 100,
              2: 80,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 30, child: 20, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 70, child: 40, infant: 0 },
          "default-ai": { adult: 80, child: 50, infant: 0 },
        },
      },
    ],
  },
  {
    id: 1,
    periodId: 2,
    roomRates: [
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 120,
              2: 160,
            },
          },
          child: {
            rates: {
              1: 60,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 18, child: 10, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 45, child: 25, infant: 0 },
          "default-ai": { adult: 55, child: 30, infant: 0 },
        },
      },
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 110,
              2: 130,
              3: 150,
              4: 200,
            },
          },
          child: {
            rates: {
              1: 55,
              2: 70,

            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 22, child: 13, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 55, child: 32, infant: 0 },
          "default-ai": { adult: 65, child: 38, infant: 0 },
        },
      },
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 180,
              2: 200,
              3: 230,
              4: 280,
            },
          },
          child: {
            rates: {
              1: 70,
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
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 28, child: 18, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 65, child: 38, infant: 0 },
          "default-ai": { adult: 75, child: 45, infant: 0 },
        },
      },
    ],
  },
  {
    id: 1,
    periodId: 3,
    roomRates: [
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 150,
              2: 200,
            },
          },
          child: {
            rates: {
              1: 80,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 22, child: 12, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 55, child: 32, infant: 0 },
          "default-ai": { adult: 65, child: 38, infant: 0 },
        },
      },
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 140,
              2: 160,
              3: 180,
              4: 250,
            },
          },
          child: {
            rates: {
              1: 70,
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
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 28, child: 16, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 65, child: 40, infant: 0 },
          "default-ai": { adult: 75, child: 45, infant: 0 },
        },
      },
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 220,
              2: 240,
              3: 270,
              4: 320,
            },
          },
          child: {
            rates: {
              1: 90,
              2: 110,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 32, child: 20, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 75, child: 45, infant: 0 },
          "default-ai": { adult: 85, child: 55, infant: 0 },
        },
      },
    ],
  },
  {
    id: 1,
    periodId: 4,
    roomRates: [
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 120,
              2: 170,
            },
          },
          child: {
            rates: {
              1: 60,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 19, child: 11, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 48, child: 28, infant: 0 },
          "default-ai": { adult: 58, child: 33, infant: 0 },
        },
      },
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 115,
              2: 135,
              3: 155,
              4: 210,
            },
          },
          child: {
            rates: {
              1: 60,
              2: 75,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 24, child: 14, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 58, child: 34, infant: 0 },
          "default-ai": { adult: 68, child: 40, infant: 0 },
        },
      },
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 190,
              2: 210,
              3: 240,
              4: 290,
            },
          },
          child: {
            rates: {
              1: 80,
              2: 100,  
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 30, child: 19, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 68, child: 42, infant: 0 },
          "default-ai": { adult: 78, child: 50, infant: 0 },
        },
      },
    ],
  },
  {
    id: 2,
    periodId: 5,
    roomRates: [
      {
        roomTypeId: 4,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 150,
              2: 150,
              3: 150,
              4: 150,
            },
          },
          child: {
            rates: {
              1: 75,
              2: 75,
              3: 75,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 15, child: 7.5, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 45, child: 22.5, infant: 0 },
          "default-ai": { adult: 60, child: 30, infant: 0 },
          "maldives-ai-plus": { adult: 67.5, child: 33.75, infant: 0 },
          "maldives-uai": { adult: 75, child: 37.5, infant: 0 },
        },
      },
      {
        roomTypeId: 5,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 100,
              2: 200,
            },
          },
          child: {
            rates: {
              1: 50,
              2: 100,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 20, child: 10, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 30, infant: 0 },
          "default-ai": { adult: 80, child: 40, infant: 0 },
          "maldives-ai-plus": { adult: 90, child: 45, infant: 0 },
          "maldives-uai": { adult: 100, child: 50, infant: 0 },
        },
      },
      {
        roomTypeId: 6,
        rateType: "per_villa",
        villaRate: 200,
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 18, child: 9, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 54, child: 27, infant: 0 },
          "default-ai": { adult: 72, child: 36, infant: 0 },
          "maldives-ai-plus": { adult: 81, child: 40.5, infant: 0 },
          "maldives-uai": { adult: 90, child: 45, infant: 0 },
        },
      },
    ],
  },
  {
    id: 2,
    periodId: 6,
    roomRates: [
      {
        roomTypeId: 4,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 150,
              2: 150,
              3: 150,
              4: 150,
            },
          },
          child: {
            rates: {
              1: 75,
              2: 75,
              3: 75,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 15, child: 7.5, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 45, child: 22.5, infant: 0 },
          "default-ai": { adult: 60, child: 30, infant: 0 },
          "maldives-ai-plus": { adult: 67.5, child: 33.75, infant: 0 },
          "maldives-uai": { adult: 75, child: 37.5, infant: 0 },
        },
      },
      {
        roomTypeId: 5,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 200,
              2: 200,
            },
          },
          child: {
            rates: {
              1: 100,
              2: 100,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 20, child: 10, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 30, infant: 0 },
          "default-ai": { adult: 80, child: 40, infant: 0 },
          "maldives-ai-plus": { adult: 90, child: 45, infant: 0 },
          "maldives-uai": { adult: 100, child: 50, infant: 0 },
        },
      },
      {
        roomTypeId: 6,
        rateType: "per_villa",
        villaRate:180,
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 18, child: 9, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 54, child: 27, infant: 0 },
          "default-ai": { adult: 72, child: 36, infant: 0 },
          "maldives-ai-plus": { adult: 81, child: 40.5, infant: 0 },
          "maldives-uai": { adult: 90, child: 45, infant: 0 },
        },
      },
    ],
  },
  {
    id: 2,
    periodId: 7,
    roomRates: [
      {
        roomTypeId: 4,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 150,
              2: 150,
              3: 150,
              4: 150,
            },
          },
          child: {
            rates: {
              1: 75,
              2: 75,
              3: 75,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 15, child: 7.5, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 45, child: 22.5, infant: 0 },
          "default-ai": { adult: 60, child: 30, infant: 0 },
          "maldives-ai-plus": { adult: 67.5, child: 33.75, infant: 0 },
          "maldives-uai": { adult: 75, child: 37.5, infant: 0 },
        },
      },
      {
        roomTypeId: 5,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 200,
              2: 200,
            },
          },
          child: {
            rates: {
              1: 100,
              2: 100,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 20, child: 10, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 30, infant: 0 },
          "default-ai": { adult: 80, child: 40, infant: 0 },
          "maldives-ai-plus": { adult: 90, child: 45, infant: 0 },
          "maldives-uai": { adult: 100, child: 50, infant: 0 },
        },
      },
      {
        roomTypeId: 6,
        rateType: "per_villa",
        villaRate:180,
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 18, child: 9, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 54, child: 27, infant: 0 },
          "default-ai": { adult: 72, child: 36, infant: 0 },
          "maldives-ai-plus": { adult: 81, child: 40.5, infant: 0 },
          "maldives-uai": { adult: 90, child: 45, infant: 0 },
        },
      },
    ],
  },
  {
    id: 2,
    periodId: 8,
    roomRates: [
      {
        roomTypeId: 4,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 150,
              2: 150,
              3: 150,
              4: 150,
            },
          },
          child: {
            rates: {
              1: 75,
              2: 75,
              3: 75,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 15, child: 7.5, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 45, child: 22.5, infant: 0 },
          "default-ai": { adult: 60, child: 30, infant: 0 },
          "maldives-ai-plus": { adult: 67.5, child: 33.75, infant: 0 },
          "maldives-uai": { adult: 75, child: 37.5, infant: 0 },
        },
      },
      {
        roomTypeId: 5,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 200,
              2: 200,
            },
          },
          child: {
            rates: {
              1: 100,
              2: 100,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 20, child: 10, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 30, infant: 0 },
          "default-ai": { adult: 80, child: 40, infant: 0 },
          "maldives-ai-plus": { adult: 90, child: 45, infant: 0 },
          "maldives-uai": { adult: 100, child: 50, infant: 0 },
        },
      },
      {
        roomTypeId: 6,
        rateType: "per_villa",
        villaRate: 200,
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 18, child: 9, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 54, child: 27, infant: 0 },
          "default-ai": { adult: 72, child: 36, infant: 0 },
          "maldives-ai-plus": { adult: 81, child: 40.5, infant: 0 },
          "maldives-uai": { adult: 90, child: 45, infant: 0 },
        },
      },
    ],
  },
  {
    id: 5,
    periodId: 1,
    roomRates: [
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 120,
              2: 160,
            },
          },
          child: {
            rates: {
              1: 60,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 18, child: 10, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 45, child: 25, infant: 0 },
          "default-ai": { adult: 55, child: 30, infant: 0 },
        },
      },
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 110,
              2: 130,
              3: 150,
              4: 200,
            },
          },
          child: {
            rates: {
              1: 55,
              2: 70,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 22, child: 13, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 55, child: 32, infant: 0 },
          "default-ai": { adult: 65, child: 38, infant: 0 },
        },
      },
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 180,
              2: 200,
              3: 230,
              4: 280,
            },
          },
          child: {
            rates: {
              1: 70,
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
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 28, child: 18, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 65, child: 38, infant: 0 },
          "default-ai": { adult: 75, child: 45, infant: 0 },
        },
      },
      {
        roomTypeId: 4,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 140,
              2: 160,
              3: 180,
              4: 220,
            },
          },
          child: {
            rates: {
              1: 40,
              2: 60,
              3: 80,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 25, child: 15, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 35, infant: 0 },
          "default-ai": { adult: 70, child: 40, infant: 0 },
        },
      },
      {
        roomTypeId: 5,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 250,
              2: 300,

            },
          },
          child: {
            rates: {
              1: 80,
              2: 100,

            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 30, child: 20, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 70, child: 40, infant: 0 },
          "default-ai": { adult: 80, child: 50, infant: 0 },
        },
      },
    ],
  },
  {
    id: 5,
    periodId: 2,
    roomRates: [
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 130,
              2: 180,
            },
          },
          child: {
            rates: {
              1: 70,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 20, child: 12, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 50, child: 30, infant: 0 },
          "default-ai": { adult: 60, child: 35, infant: 0 },
        },
      },
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 120,
              2: 140,
              3: 160,
              4: 220,
            },
          },
          child: {
            rates: {
              1: 60,
              2: 80,

            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 25, child: 15, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 35, infant: 0 },
          "default-ai": { adult: 70, child: 40, infant: 0 },
        },
      },
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 200,
              2: 220,
              3: 250,
              4: 300,
            },
          },
          child: {
            rates: {
              1: 80,
              2: 100,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 30, child: 20, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 70, child: 40, infant: 0 },
          "default-ai": { adult: 80, child: 50, infant: 0 },
        },
      },
      {
        roomTypeId: 4,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 160,
              2: 180,
              3: 200,
              4: 250,
            },
          },
          child: {
            rates: {
              1: 50,
              2: 70,
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
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 28, child: 18, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 65, child: 38, infant: 0 },
          "default-ai": { adult: 75, child: 45, infant: 0 },
        },
      },
      {
        roomTypeId: 5,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 300,
              2: 350,
            },
          },
          child: {
            rates: {
              1: 100,
              2: 120,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 35, child: 25, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 80, child: 50, infant: 0 },
          "default-ai": { adult: 90, child: 60, infant: 0 },
        },
      },
    ],
  },
  {
    id: 5,
    periodId: 3,
    roomRates: [
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 150,
              2: 200,
            },
          },
          child: {
            rates: {
              1: 80,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 22, child: 12, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 55, child: 32, infant: 0 },
          "default-ai": { adult: 65, child: 38, infant: 0 },
        },
      },
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 140,
              2: 160,
              3: 180,
              4: 250,
            },  
          },
          child: {
            rates: {
              1: 70,
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
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 28, child: 16, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 65, child: 40, infant: 0 },
          "default-ai": { adult: 75, child: 45, infant: 0 },
        },
      },
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 220,
              2: 240,
              3: 270,
              4: 320,
            },
          },
          child: {
            rates: {
              1: 90,
              2: 110,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 32, child: 20, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 75, child: 45, infant: 0 },
          "default-ai": { adult: 85, child: 55, infant: 0 },
        },
      },
      {
        roomTypeId: 4,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 180,
              2: 200,
              3: 230,
              4: 280,
            },
          },
          child: {
            rates: {
              1: 60,
              2: 80,
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
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 30, child: 19, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 68, child: 42, infant: 0 },
          "default-ai": { adult: 78, child: 50, infant: 0 },
        },
      },
      {
        roomTypeId: 5,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 320,
              2: 400,
            },
          },
          child: {
            rates: {
              1: 110,
              2: 130,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 40, child: 30, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 90, child: 60, infant: 0 },
          "default-ai": { adult: 100, child: 70, infant: 0 },
        },
      },
    ],
  },
  {
    id: 5,
    periodId: 4,
    roomRates: [
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 120,
              2: 170,
            },
          },
          child: {
            rates: {
              1: 60,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 19, child: 11, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 48, child: 28, infant: 0 },
          "default-ai": { adult: 58, child: 33, infant: 0 },
        },
      },
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 115,
              2: 135,
              3: 155,
              4: 210,
            },
          },
          child: {
            rates: {
              1: 60,
              2: 75,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 24, child: 14, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 58, child: 34, infant: 0 },
          "default-ai": { adult: 68, child: 40, infant: 0 },
        },
      },
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 190,
              2: 210,
              3: 240,
              4: 290,
            },
          },
          child: {
            rates: {
              1: 80,
              2: 100,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 30, child: 19, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 68, child: 42, infant: 0 },
          "default-ai": { adult: 78, child: 50, infant: 0 },
        },
      },
      {
        roomTypeId: 4,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 150,
              2: 170,
              3: 190,
              4: 240,
            },
          },
          child: {
            rates: {
              1: 40,
              2: 60,
              3: 80,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 25, child: 15, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 35, infant: 0 },
          "default-ai": { adult: 70, child: 40, infant: 0 },
        },
      },
      {
        roomTypeId: 5,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 280,
              2: 320,
            },
          },
          child: {
            rates: {
              1: 90,
              2: 110,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 30, child: 20, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 75, child: 45, infant: 0 },
          "default-ai": { adult: 85, child: 55, infant: 0 },
        },
      },
    ],
  },
  {
    id: 7,
    periodId: 1,
    roomRates: [
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 120,
              2: 160,
            },
          },
          child: {
            rates: {
              1: 60,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 18, child: 10, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 45, child: 25, infant: 0 },
          "default-ai": { adult: 55, child: 30, infant: 0 },
        },
      },
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 110,
              2: 130,
              3: 150,
              4: 200,
            },
          },
          child: {
            rates: {
              1: 55,
              2: 70,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 22, child: 13, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 55, child: 32, infant: 0 },
          "default-ai": { adult: 65, child: 38, infant: 0 },
        },
      },
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 180,
              2: 200,
              3: 230,
              4: 280,
            },
          },
          child: {
            rates: {
              1: 70,
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
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 28, child: 18, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 65, child: 38, infant: 0 },
          "default-ai": { adult: 75, child: 45, infant: 0 },
        },
      },
      {
        roomTypeId: 4,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 140,
              2: 160,
              3: 180,
              4: 220,
            },
          },
          child: {
            rates: {
              1: 40,
              2: 60,
              3: 80,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 25, child: 15, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 35, infant: 0 },
          "default-ai": { adult: 70, child: 40, infant: 0 },
        },
      },
      {
        roomTypeId: 5,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 250,
              2: 300,
            },
          },
          child: {
            rates: {
              1: 80,
              2: 100,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 30, child: 20, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 70, child: 40, infant: 0 },
          "default-ai": { adult: 80, child: 50, infant: 0 },
        },
      },
      {
        roomTypeId: 6,
        rateType: "per_villa",
        villaRate:180,
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 18, child: 9, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 54, child: 27, infant: 0 },
          "default-ai": { adult: 72, child: 36, infant: 0 },
        },
      },
    ],
  },
  {
    id: 7,
    periodId: 2,
    roomRates: [
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 130,
              2: 180,
            },
          },
          child: {
            rates: {
              1: 70,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 20, child: 12, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 50, child: 30, infant: 0 },
          "default-ai": { adult: 60, child: 35, infant: 0 },
        },
      },
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 120,
              2: 140,
              3: 160,
              4: 220,
            },
          },
          child: {
            rates: {
              1: 60,
              2: 80,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 25, child: 15, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 35, infant: 0 },
          "default-ai": { adult: 70, child: 40, infant: 0 },
        },
      },
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 200,
              2: 220,
              3: 250,
              4: 300,
            },
          },
          child: {
            rates: {
              1: 80,
              2: 100,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 30, child: 20, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 70, child: 40, infant: 0 },
          "default-ai": { adult: 80, child: 50, infant: 0 },
        },
      },
      {
        roomTypeId: 4,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 160,
              2: 180,
              3: 200,
              4: 250,
            },
          },
          child: {
            rates: {
              1: 50,
              2: 70,
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
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 28, child: 18, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 65, child: 38, infant: 0 },
          "default-ai": { adult: 75, child: 45, infant: 0 },
        },
      },
      {
        roomTypeId: 5,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 300,
              3: 350,
            },
          },
          child: {
            rates: {
              1: 100,
              2: 120,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 35, child: 25, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 80, child: 50, infant: 0 },
          "default-ai": { adult: 90, child: 60, infant: 0 },
        },
      },
      {
        roomTypeId: 6,
        rateType: "per_villa",
        villaRate:180,
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 20, child: 10, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 30, infant: 0 },
          "default-ai": { adult: 70, child: 40, infant: 0 },
        },
      },
    ],
  },
  {
    id: 7,
    periodId: 3,
    roomRates: [
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 150,
              2: 200,
            },
          },
          child: {
            rates: {
              1: 80,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 22, child: 12, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 55, child: 32, infant: 0 },
          "default-ai": { adult: 65, child: 38, infant: 0 },
        },
      },
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 140,
              2: 160,
              3: 180,
              4: 250,
            },
          },
          child: {
            rates: {
              1: 70,
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
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 28, child: 16, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 65, child: 40, infant: 0 },
          "default-ai": { adult: 75, child: 45, infant: 0 },
        },
      },
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 220,
              2: 240,
              3: 270,
              4: 320,
            },
          },
          child: {
            rates: {
              1: 90,
              2: 110,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 32, child: 20, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 75, child: 45, infant: 0 },
          "default-ai": { adult: 85, child: 55, infant: 0 },
        },
      },
      {
        roomTypeId: 4,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 180,
              2: 200,
              3: 230,
              4: 280,
            },
          },
          child: {
            rates: {
              1: 60,
              2: 80,
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
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 30, child: 19, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 68, child: 42, infant: 0 },
          "default-ai": { adult: 78, child: 50, infant: 0 },
        },
      },
      {
        roomTypeId: 5,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 320,
              2: 400,
            },
          },
          child: {
            rates: {
              1: 110,
              2: 130,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 40, child: 30, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 90, child: 60, infant: 0 },
          "default-ai": { adult: 100, child: 70, infant: 0 },
        },
      },
      {
        roomTypeId: 6,
        rateType: "per_villa",
        villaRate:200,
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 22, child: 11, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 65, child: 35, infant: 0 },
          "default-ai": { adult: 75, child: 45, infant: 0 },
        },
      },
    ],
  },
  {
    id: 7,
    periodId: 4,
    roomRates: [
      {
        roomTypeId: 1,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 120,
              2: 170,
            },
          },
          child: {
            rates: {
              1: 60,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 19, child: 11, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 48, child: 28, infant: 0 },
          "default-ai": { adult: 58, child: 33, infant: 0 },
        },
      },
      {
        roomTypeId: 2,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 115,
              2: 135,
              3: 155,
              4: 210,
            },
          },
          child: {
            rates: {
              1: 60,
              2: 75,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 24, child: 14, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 58, child: 34, infant: 0 },
          "default-ai": { adult: 68, child: 40, infant: 0 },
        },
      },
      {
        roomTypeId: 3,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 190,
              2: 210,
              3: 240,
              4: 290,
            },
          },
          child: {
            rates: {
              1: 80,
              2: 100,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 30, child: 19, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 68, child: 42, infant: 0 },
          "default-ai": { adult: 78, child: 50, infant: 0 },
        },
      },
      {
        roomTypeId: 4,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 150,
              2: 170,
              3: 190,
              4: 240,
            },
          },
          child: {
            rates: {
              1: 40,
              2: 60,
              3: 80,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 25, child: 15, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 35, infant: 0 },
          "default-ai": { adult: 70, child: 40, infant: 0 },
        },
      },
      {
        roomTypeId: 5,
        rateType: "per_pax",
        personTypeRates: {
          adult: {
            rates: {
              1: 280,
              2: 320,
            },
          },
          child: {
            rates: {
              1: 90,
              2: 110,
            },
          },
          infant: {
            rates: {
              1: 0,
            },
          },
        },
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 30, child: 20, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 75, child: 45, infant: 0 },
          "default-ai": { adult: 85, child: 55, infant: 0 },
        },
      },
      {
        roomTypeId: 6,
        rateType: "per_villa",
        villaRate:180,
        mealPlanRates: {
          "default-ro": { adult: 0, child: 0, infant: 0 },
          "default-bb": { adult: 20, child: 10, infant: 0 },
          "default-hb": { adult: 0, child: 0, infant: 0 },
          "default-fb": { adult: 60, child: 30, infant: 0 },
          "default-ai": { adult: 70, child: 40, infant: 0 },
        },
      },
    ],
  },
];
