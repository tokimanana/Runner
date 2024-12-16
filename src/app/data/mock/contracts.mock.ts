// src/data/mock/contracts.mock.ts
import { Contract, ContractStatus } from "../../models/types";

export const contracts: Contract[] = [
  {
    id: 1,
    code: "GHR-FR-S24",
    name: "Grand Riveria Summer 2024 - France",
    hotelId: 1,
    description: "Summer season contract for French market with premium rooms",
    status: "active",
    seasonId: 1,
    marketId: 1,
    selectedRoomTypes: [1, 2, 3], // Classic Mediterranean, Superior Sea View, Deluxe Terrace Suite
    selectedMealPlans: ["BB", "HB", "FB", "AI"],
    isRatesConfigured: true,
  },
  {
    id: 2,
    code: "MPR-UK-W24",
    name: "Maldives Paradise Winter 2024 - UK",
    hotelId: 2,
    description:
      "Winter season contract for UK market with all-inclusive options",
    status: "active",
    seasonId: 2,
    marketId: 2,
    selectedRoomTypes: [4, 5, 6], // Water Villa, Beach Villa, Presidential Suite
    selectedMealPlans: ["AI", "UAI"],
    isRatesConfigured: true,
  },
  {
    id: 3,
    code: "GHR-DE-S24",
    name: "Grand Riveria Summer 2024 - Germany",
    hotelId: 1,
    description: "Summer season contract for German market with all room types",
    status: "draft",
    seasonId: 1,
    marketId: 3,
    selectedRoomTypes: [1, 2, 3, 4], // All available room types
    selectedMealPlans: ["BB", "HB", "FB"],
    isRatesConfigured: false,
  },
  {
    id: 4,
    code: "MPR-RU-W24",
    name: "Maldives Paradise Winter 2024 - Russia",
    hotelId: 2,
    description: "Winter season luxury contract for Russian market",
    status: "draft",
    seasonId: 2,
    marketId: 4,
    selectedRoomTypes: [4, 5, 6, 7], // All luxury rooms
    selectedMealPlans: ["AI", "UAI"],
    isRatesConfigured: false,
  },
  {
    id: 5,
    code: "GHR-IT-S24",
    name: "Grand Riveria Summer 2024 - Italy",
    hotelId: 1,
    description: "Local market summer contract with special rates",
    status: "inactive",
    seasonId: 1,
    marketId: 5,
    selectedRoomTypes: [1, 2, 3, 4, 5], // All room types
    selectedMealPlans: ["BB", "HB"],
    isRatesConfigured: true,
  },
  {
    id: 6,
    code: "MPR-CH-W24",
    name: "Maldives Paradise Winter 2024 - Switzerland",
    hotelId: 2,
    description: "Premium winter contract for Swiss market",
    status: "draft",
    seasonId: 2,
    marketId: 6,
    selectedRoomTypes: [5, 6, 7, 8], // Premium rooms only
    selectedMealPlans: ["AI", "UAI"],
    isRatesConfigured: false,
  },
  {
    id: 7,
    code: "GHR-US-A24",
    name: "Grand Riveria Annual 2024 - USA",
    hotelId: 1,
    description: "Year-round contract for US market",
    status: "active",
    seasonId: 1,
    marketId: 1,
    selectedRoomTypes: [1, 2, 3, 4, 5, 6], // All room categories
    selectedMealPlans: ["BB", "HB", "FB", "AI"],
    isRatesConfigured: true,
  },
  {
    id: 8,
    code: "MPR-JP-A24",
    name: "Maldives Paradise Annual 2024 - Japan",
    hotelId: 2,
    description: "Premium year-round contract for Japanese market",
    status: "active",
    seasonId: 2,
    marketId: 2,
    selectedRoomTypes: [4, 5, 6, 7, 8, 9], // All premium categories
    selectedMealPlans: ["BB", "HB", "FB", "AI", "UAI"],
    isRatesConfigured: true,
  },
];
