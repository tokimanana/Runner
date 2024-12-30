// src/data/mock/contracts.mock.ts
import { Contract, MealPlanType } from "../../models/types";

export const contracts: Contract[] = [
  // Grand Hotel Riveria - Summer 2025 Contracts
  {
    id: 1,
    code: "GHR-FR-S25",
    name: "Grand Riveria Summer 2025 - France",
    hotelId: 1,
    description: "Summer season contract for French market with premium rooms",
    seasonId: 1, // Peak Season 2025
    marketId: 1,
    selectedRoomTypes: [1, 2, 3],
    selectedMealPlans: [
      MealPlanType.RO, // Base meal plan (rate = 0)
      MealPlanType.BB,
      MealPlanType.HB,
      MealPlanType.FB,
      MealPlanType.AI,
    ],
    baseMealPlan: MealPlanType.RO,
    isRatesConfigured: true,
  },
  {
    id: 2,
    code: "GHR-DE-W25",
    name: "Grand Riveria Winter 2025-2026 - UK",
    hotelId: 1,
    description:
      "Premium winter contract for German market including Family Suite",
    seasonId: 2, // Winter Season 2025-2026
    marketId: 2,
    selectedRoomTypes: [1, 2, 3, 4],
    selectedMealPlans: [
      MealPlanType.RO,
      MealPlanType.BB,
      MealPlanType.BB_PLUS,
      MealPlanType.HB,
      MealPlanType.FB,
      MealPlanType.AI,
    ],
    baseMealPlan: MealPlanType.RO,
    isRatesConfigured: false,
  },
  {
    id: 3,
    code: "GHR-UK-W25",
    name: "Grand Riveria Winter 2025-2026 - UK",
    hotelId: 1,
    description: "Luxury winter contract for UK market with all room types",
    seasonId: 2, // Winter Season 2025-2026
    marketId: 2,
    selectedRoomTypes: [1, 2, 3, 4, 5],
    selectedMealPlans: [
      MealPlanType.RO,
      MealPlanType.BB,
      MealPlanType.BB_PLUS,
      MealPlanType.HB,
      MealPlanType.HB_PLUS,
      MealPlanType.FB,
      MealPlanType.AI,
    ],
    baseMealPlan: MealPlanType.RO,
    isRatesConfigured: false,
  },

  // Maldives Paradise Resort Contracts
  {
    id: 4,
    code: "MPR-UK-H25",
    name: "Maldives Paradise High Season 2025 - UK",
    hotelId: 2,
    description:
      "Premium high season contract for UK market with luxury villas",
    seasonId: 3, // High Season 2025
    marketId: 3,
    selectedRoomTypes: [6, 7, 8],
    selectedMealPlans: [
      MealPlanType.FB, // Base meal plan minimum for Maldives
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
      MealPlanType.UAI,
    ],
    baseMealPlan: MealPlanType.FB,
    isRatesConfigured: true,
  },
  {
    id: 5,
    code: "MPR-DE-G25",
    name: "Maldives Paradise Green Season 2025 - UK",
    hotelId: 2,
    description:
      "Luxury green season contract for German market with premium villas",
    seasonId: 4, // Green Season 2025
    marketId: 2,
    selectedRoomTypes: [7, 8, 9],
    selectedMealPlans: [
      MealPlanType.FB,
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
      MealPlanType.UAI,
    ],
    baseMealPlan: MealPlanType.FB,
    isRatesConfigured: false,
  },
  {
    id: 6,
    code: "MPR-RU-F25",
    name: "Maldives Paradise Festive 2025-2026 - Russia",
    hotelId: 2,
    description: "Ultra-luxury festive season contract for Russian market",
    seasonId: 5, // Festive Season 2025-2026
    marketId: 4,
    selectedRoomTypes: [8, 9, 10],
    selectedMealPlans: [
      MealPlanType.FB,
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
      MealPlanType.UAI,
    ],
    baseMealPlan: MealPlanType.FB,
    isRatesConfigured: false,
  },

  // Le Tropical Paradise Resort Contracts
  {
    id: 7,
    code: "TPR-FR-H25",
    name: "Tropical Paradise High Season 2025 - France",
    hotelId: 3,
    description: "High season contract for French market with premium rooms",
    seasonId: 6, // High Season 2025
    marketId: 1,
    selectedRoomTypes: [11, 12, 13],
    selectedMealPlans: [
      MealPlanType.HB,
      MealPlanType.FB,
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
    ],
    baseMealPlan: MealPlanType.HB,
    isRatesConfigured: true,
  },
  {
    id: 8,
    code: "TPR-UK-T25",
    name: "Tropical Paradise Tropical Season 2025 - UK",
    hotelId: 3,
    description:
      "Premium tropical season contract for UK market including luxury villas",
    seasonId: 7, // Tropical Season 2025
    marketId: 3,
    selectedRoomTypes: [11, 12, 13, 14, 15],
    selectedMealPlans: [
      MealPlanType.HB,
      MealPlanType.FB,
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
    ],
    baseMealPlan: MealPlanType.HB,
    isRatesConfigured: false,
  },
  {
    id: 9,
    code: "TPR-DE-F25",
    name: "Tropical Paradise Festive 2025-2026 - Germany",
    hotelId: 3,
    description:
      "Luxury festive season contract for German market with family rooms",
    seasonId: 8, // Festive Season 2025-2026
    marketId: 2,
    selectedRoomTypes: [11, 12, 13, 14],
    selectedMealPlans: [
      MealPlanType.HB,
      MealPlanType.FB,
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
    ],
    baseMealPlan: MealPlanType.HB,
    isRatesConfigured: false,
  },
  {
    id: 10,
    code: "TPR-RU-F25",
    name: "Tropical Paradise Festive 2025-2026 - Russia",
    hotelId: 3,
    description:
      "Ultra-luxury festive season contract for Russian market with exclusive villas",
    seasonId: 8, // Festive Season 2025-2026
    marketId: 4,
    selectedRoomTypes: [12, 14, 15],
    selectedMealPlans: [
      MealPlanType.HB,
      MealPlanType.FB,
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
    ],
    baseMealPlan: MealPlanType.HB,
    isRatesConfigured: false,
  },
];
