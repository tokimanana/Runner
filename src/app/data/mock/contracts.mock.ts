// src/data/mock/contracts.mock.ts
import { Contract, MealPlanType } from "../../models/types";

export const contracts: Contract[] = [
  // Grand Hotel Riveria - Summer Season 2024 Contracts
  {
    id: 1,
    code: "GHR-FR-S24",
    name: "Grand Riveria Summer 2024 - France",
    hotelId: 1,
    description: "Summer season contract for French market with premium rooms",
    seasonId: 1,
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
    status: "active",
    isRatesConfigured: true,
  },
  {
    id: 2,
    code: "GHR-DE-W24",
    name: "Grand Riveria Winter 2024-2025 - Germany",
    hotelId: 1,
    description: "Premium winter contract for German market including Family Suite",
    seasonId: 2,

    marketId: 2,
    selectedRoomTypes: [1, 2, 3, 4],
    selectedMealPlans: [
      MealPlanType.RO, // Base meal plan (rate = 0)
      MealPlanType.BB,
      MealPlanType.BB_PLUS,
      MealPlanType.HB,
      MealPlanType.FB,
      MealPlanType.AI,
    ],
    baseMealPlan: MealPlanType.RO,
    status: "draft",
    isRatesConfigured: false,
  },
  {
    id: 3,
    code: "GHR-UK-W24",
    name: "Grand Riveria Winter 2024-2025 - UK",
    hotelId: 1,
    description: "Luxury winter contract for UK market with all room types",
    seasonId: 2, // Winter Season 2024-2025
    marketId: 3,
    selectedRoomTypes: [1, 2, 3, 4, 5],
    selectedMealPlans: [
      MealPlanType.RO, // Base meal plan (rate = 0)
      MealPlanType.BB,
      MealPlanType.BB_PLUS,
      MealPlanType.HB,
      MealPlanType.HB_PLUS,
      MealPlanType.FB,
      MealPlanType.AI,
    ],
    baseMealPlan: MealPlanType.RO,
    status: "draft",
    isRatesConfigured: false,
  },

  // Maldives Paradise Resort - Winter Season 2024 Contracts
  {
    id: 4,
    code: "MPR-UK-H24",
    name: "Maldives Paradise High Season 2024 - UK",
    hotelId: 2,
    description: "Premium high season contract for UK market with luxury villas",
    seasonId: 1, // High Season 2024
    marketId: 3,
    selectedRoomTypes: [6, 7, 8],
    selectedMealPlans: [
      MealPlanType.FB, // Base meal plan minimum pour Maldives
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
      MealPlanType.UAI,
    ],
    baseMealPlan: MealPlanType.FB,
    status: "draft",
    isRatesConfigured: true,
  },
  {
    id: 5,
    code: "MPR-DE-G24",
    name: "Maldives Paradise Green Season 2024 - Germany",
    hotelId: 2,
    description: "Luxury green season contract for German market with premium villas",
    seasonId: 2, // Green Season 2024
    marketId: 2,
    selectedRoomTypes: [7, 8, 9],
    selectedMealPlans: [
      MealPlanType.FB, // Base meal plan minimum pour Maldives
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
      MealPlanType.UAI,
    ],
    baseMealPlan: MealPlanType.FB,
    status: "draft",
    isRatesConfigured: false,
  },
  {
    id: 6,
    code: "MPR-RU-G24",
    name: "Maldives Paradise Green Season 2024 - Russia",
    hotelId: 2,
    description: "Ultra-luxury green season contract for Russian market",
    seasonId: 2, // Green Season 2024
    marketId: 4,
    selectedRoomTypes: [8, 9, 10],
    selectedMealPlans: [
      MealPlanType.FB, // Base meal plan minimum pour Maldives
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
      MealPlanType.UAI,
    ],
    baseMealPlan: MealPlanType.FB,
    status: "draft",
    isRatesConfigured: false,
  },
  {
    id: 7,
    code: "TPR-FR-H24",
    name: "Tropical Paradise High Season 2024 - France",
    hotelId: 3,
    description: "High season contract for French market with premium rooms",
    seasonId: 1, // High Season 2024

    marketId: 1, // Marché français
    selectedRoomTypes: [11, 12, 13], // Deluxe Garden, Premium Ocean, Family Suite
    selectedMealPlans: [
      MealPlanType.HB, // Base meal plan
      MealPlanType.FB,
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
    ],
    baseMealPlan: MealPlanType.HB,
    status: "draft",
    isRatesConfigured: false,
  },
  {
    id: 8,
    code: "TPR-UK-T24",
    name: "Tropical Paradise Tropical Season 2024 - UK",
    hotelId: 3,
    description: "Premium tropical season contract for UK market including luxury villas",
    seasonId: 2, // Tropical Season 2024

    marketId: 3,
    selectedRoomTypes: [11, 12, 13, 14, 15],
    selectedMealPlans: [
      MealPlanType.HB, // Base meal plan
      MealPlanType.FB,
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
    ],
    baseMealPlan: MealPlanType.HB,
    status: "draft",
    isRatesConfigured: false,
  },
  {
    id: 9,
    code: "TPR-DE-T24",
    name: "Tropical Paradise Tropical Season 2024 - Germany",
    hotelId: 3,
    description: "Luxury tropical season contract for German market with family rooms",
    seasonId: 2, // Tropical Season 2024

    marketId: 2,
    selectedRoomTypes: [11, 12, 13, 14],
    selectedMealPlans: [
      MealPlanType.HB, // Base meal plan
      MealPlanType.FB,
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
    ],
    baseMealPlan: MealPlanType.HB,
    status: "draft",
    isRatesConfigured: false,
  },
  {
    id: 10,
    code: "TPR-RU-F24",
    name: "Tropical Paradise Festive Season 2024-2025 - Russia",
    hotelId: 3,
    description: "Ultra-luxury festive season contract for Russian market with exclusive villas",
    seasonId: 3, // Festive Season 2024-2025
    marketId: 4,
    selectedRoomTypes: [12, 14, 15],
    selectedMealPlans: [
      MealPlanType.HB, // Base meal plan
      MealPlanType.FB,
      MealPlanType.AI,
      MealPlanType.AI_PLUS,
    ],
    baseMealPlan: MealPlanType.HB,
    status: "draft",
    isRatesConfigured: false,
  },
];
