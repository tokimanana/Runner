// src/app/services/mock/mock-api.service.ts
import { hotels as initialHotels } from "../../data/mock/hotels.mock";
import { policies as initialPolicies } from "../../data/mock/policies.mock";
import { rooms as initialRooms } from "../../data/mock/rooms.mock";
import { mealPlans as initialMealPlans } from "../../data/mock/mealPlans.mock";
import { currencySettings as initialCurrencySettings } from "../../data/mock/currencies.mock";
import {
  markets as initialMarkets,
  marketGroups as initialMarketGroups,
} from "../../data/mock/markets.mock";
import { seasons as initialSeasons } from "../../data/mock/seasons.mock";
import { contracts as initialContracts } from "../../data/mock/contracts.mock";
import { offersMock as initialOffers } from "../../data/mock/offers.mock";

import {
  Hotel,
  Contract,
  Market,
  MarketGroup,
  MealPlan,
  Season,
  CurrencySetting,
  HotelPolicies,
  HotelDataKey,
  PolicyType,
  RoomType,
  AgeCategory,
  Period,
  ContractRate,
  ContractPeriodRate,
  SpecialOffer,
} from "../../models/types";
import { contractRates } from "src/app/data/mock/rates.mock";

export class MockApiService {
  protected static readonly STORAGE_KEYS = {
    HOTELS: "mock_hotels",
    POLICIES: "mock_policies",
    ROOMS: "mock_rooms",
    MEAL_PLANS: "mock_meal_plans", // For default meal plans
    HOTEL_MEAL_PLANS: "hotel_meal_plans", // For hotel-specific meal plans
    CURRENCY_SETTINGS: "mock_currency_settings",
    MARKETS: "mock_markets",
    MARKET_GROUPS: "mock_market_groups",
    SEASONS: "mock_seasons",
    CONTRACTS: "mock_contracts",
    CONTRACT_RATES: "mock_contract_rates",
    INITIALIZED: "mock_storage_initialized",
    OFFERS: "mock_offers",
  };

  private static readonly ROOMS_KEY = "mock_rooms";

  private static readonly STORAGE_PREFIX = "mock_";

  // private static readonly CORE_KEYS = {
  //   INITIALIZED: "initialized",
  //   HOTELS: "hotels",
  //   ROOMS: "rooms",
  //   MARKETS: "markets",
  //   CONTRACTS: "contracts",
  //   MEAL_PLANS: "mealPlans",
  //   CURRENCY_SETTINGS: "currencySettings",
  // } as const;

  // Add this INITIAL_DATA static property
  protected static readonly INITIAL_DATA = {
    hotels: () => Promise.resolve(initialHotels),
    rooms: () => Promise.resolve(initialRooms),
    markets: () => Promise.resolve(initialMarkets),
    marketGroups: () => Promise.resolve(initialMarketGroups),
    mealPlans: () => Promise.resolve(initialMealPlans),
    currencySettings: () => Promise.resolve(initialCurrencySettings),
    seasons: () => Promise.resolve(initialSeasons),
    contracts: () => Promise.resolve(initialContracts),
    contractRates: () => Promise.resolve(contractRates),
    offers: () => Promise.resolve(initialOffers),
  };

  // Simplified way to get storage key
  private static getKey(key: string, hotelId?: number): string {
    return hotelId
      ? `${this.STORAGE_PREFIX}hotel_${hotelId}_${key}`
      : `${this.STORAGE_PREFIX}${key}`;
  }

  // Generic methods for data management
  private static getStorageData<T>(key: string, initialData: T[]): T[] {
    this.initializeStorage();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initialData;
  }

  // Public method to access storage keys
  // Fix the storage key type error by using proper type mapping
  private static getStorageKey(key: string): string {
    return `${this.STORAGE_PREFIX}${key}`;
  }

  private static async setStorageData<T>(key: string, data: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return Promise.resolve();
    } catch (error) {
      console.error(`Error setting storage data for key ${key}:`, error);
      return Promise.reject(error);
    }
  }

  // Initialize storage if empty
  private static initializeStorage(): void {
    if (!localStorage.getItem(this.STORAGE_KEYS.INITIALIZED)) {
      // Initialize all data
      localStorage.setItem(
        this.STORAGE_KEYS.HOTELS,
        JSON.stringify(initialHotels)
      );
      localStorage.setItem(
        this.STORAGE_KEYS.POLICIES,
        JSON.stringify(initialPolicies)
      );
      localStorage.setItem(
        this.STORAGE_KEYS.ROOMS,
        JSON.stringify(initialRooms)
      );
      localStorage.setItem(
        this.STORAGE_KEYS.MEAL_PLANS,
        JSON.stringify(initialMealPlans.defaults)
      );
      localStorage.setItem(
        this.STORAGE_KEYS.HOTEL_MEAL_PLANS,
        JSON.stringify(initialMealPlans.hotelSpecific)
      );
      localStorage.setItem(
        this.STORAGE_KEYS.MARKETS,
        JSON.stringify(initialMarkets)
      );
      localStorage.setItem(
        this.STORAGE_KEYS.MARKET_GROUPS,
        JSON.stringify(initialMarketGroups)
      );
      this.setStorageData(
        this.STORAGE_KEYS.CURRENCY_SETTINGS,
        initialCurrencySettings
      );
      localStorage.setItem(
        this.STORAGE_KEYS.SEASONS,
        JSON.stringify(initialSeasons)
      );
      localStorage.setItem(
        this.STORAGE_KEYS.CONTRACTS,
        JSON.stringify(initialContracts)
      );
      localStorage.setItem(
        this.STORAGE_KEYS.CONTRACT_RATES,
        JSON.stringify(contractRates)
      );
      localStorage.setItem(
        this.STORAGE_KEYS.OFFERS,
        JSON.stringify(initialOffers)
      );

      localStorage.setItem(this.STORAGE_KEYS.INITIALIZED, "true");
    }
  }

  // Generic CRUD operations
  private static async getItems<T>(
    key: string,
    initialData: T[]
  ): Promise<T[]> {
    this.initializeStorage();
    return Promise.resolve(this.getStorageData<T>(key, initialData));
  }

  private static async getItemById<T extends { id: number }>(
    key: string,
    id: number,
    initialData: T[]
  ): Promise<T | undefined> {
    this.initializeStorage();
    const items = this.getStorageData<T>(key, initialData);
    return Promise.resolve(items.find((item) => item.id === id));
  }

  private static async updateItem<T extends { id: number }>(
    key: string,
    id: number,
    updates: Partial<T>,
    initialData: T[]
  ): Promise<T> {
    const items = this.getStorageData<T>(key, initialData);
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("Item not found");
    }

    items[index] = { ...items[index], ...updates };
    this.setStorageData(key, items);
    return Promise.resolve(items[index]);
  }

  // Public API methods
  static getHotels(): Promise<Hotel[]> {
    this.initializeStorage();
    return Promise.resolve(
      JSON.parse(localStorage.getItem(this.STORAGE_KEYS.HOTELS) || "[]")
    );
  }

  static getHotelById(id: number): Promise<Hotel | null> {
    this.initializeStorage();
    const hotels = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.HOTELS) || "[]"
    );
    const hotel = hotels.find((hotel: any) => hotel.id === id);
    return Promise.resolve(hotel || null);
  }

  static async updateHotel(id: number, hotelData: Partial<Hotel>) {
    const hotels = this.getStorageData<Hotel>(this.STORAGE_KEYS.HOTELS, []);
    const index = hotels.findIndex((hotel) => hotel.id === id);

    if (index !== -1) {
      hotels[index] = { ...hotels[index], ...hotelData };
      await this.setStorageData(this.STORAGE_KEYS.HOTELS, hotels);
      return hotels[index];
    }

    throw new Error("Hotel not found");
  }

  static resetHotelsData(): Promise<void> {
    localStorage.setItem(
      this.STORAGE_KEYS.HOTELS,
      JSON.stringify(initialHotels)
    );
    return Promise.resolve();
  }

  static async getHotelData<T>(
    hotelId: number,
    key: string
  ): Promise<T | null> {
    const storageKey = this.getKey(key, hotelId);
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  }

  static async saveHotelData<T>(
    hotelId: number,
    key: string,
    value: T
  ): Promise<void> {
    const storageKey = this.getKey(key, hotelId);
    localStorage.setItem(storageKey, JSON.stringify(value));
  }

  // Add policies-specific methods
  static getPolicies(hotelId: number): Promise<HotelPolicies | null> {
    this.initializeStorage();
    const policies = localStorage.getItem(this.STORAGE_KEYS.POLICIES);
    if (!policies) return Promise.resolve(null);
    const policiesMap = JSON.parse(policies);
    return Promise.resolve(policiesMap[hotelId] || null);
  }

  static updatePolicies(
    hotelId: number,
    policyType: PolicyType,
    policyData: any
  ): Promise<HotelPolicies> {
    this.initializeStorage();
    const policies = localStorage.getItem(this.STORAGE_KEYS.POLICIES);
    const policiesMap = policies ? JSON.parse(policies) : {};

    if (!policiesMap[hotelId]) {
      policiesMap[hotelId] = {};
    }

    policiesMap[hotelId][policyType] = policyData;
    localStorage.setItem(
      this.STORAGE_KEYS.POLICIES,
      JSON.stringify(policiesMap)
    );

    return Promise.resolve(policiesMap[hotelId]);
  }

  // Rooms methods
  static getRooms() {
    this.initializeStorage();
    const rooms = localStorage.getItem(this.ROOMS_KEY);
    return Promise.resolve(JSON.parse(rooms || "[]"));
  }

  static getRoomsByHotelId(hotelId: number) {
    this.initializeStorage();
    const rooms = JSON.parse(localStorage.getItem(this.ROOMS_KEY) || "[]");
    return Promise.resolve(
      rooms.filter((room: RoomType) => room.hotelId === hotelId)
    );
  }

  static getRoomById(hotelId: number, roomId: number) {
    this.initializeStorage();
    const rooms = JSON.parse(localStorage.getItem(this.ROOMS_KEY) || "[]");
    return Promise.resolve(
      rooms.find(
        (room: RoomType) => room.hotelId === hotelId && room.id === roomId
      )
    );
  }

  static updateRoom(
    hotelId: number,
    roomId: number,
    roomData: Partial<RoomType>
  ) {
    this.initializeStorage();
    const rooms = JSON.parse(localStorage.getItem(this.ROOMS_KEY) || "[]");
    const index = rooms.findIndex(
      (room: RoomType) => room.hotelId === hotelId && room.id === roomId
    );

    if (index === -1) {
      return Promise.reject(new Error("Room not found"));
    }

    rooms[index] = { ...rooms[index], ...roomData };
    localStorage.setItem(this.ROOMS_KEY, JSON.stringify(rooms));
    return Promise.resolve(rooms[index]);
  }

  static createRoom(hotelId: number, roomData: Omit<RoomType, "id">) {
    this.initializeStorage();
    const rooms = JSON.parse(localStorage.getItem(this.ROOMS_KEY) || "[]");
    const newRoom = {
      ...roomData,
      id: Math.max(0, ...rooms.map((r: RoomType) => r.id)) + 1,
      hotelId,
    };

    rooms.push(newRoom);
    localStorage.setItem(this.ROOMS_KEY, JSON.stringify(rooms));
    return Promise.resolve(newRoom);
  }

  static deleteRoom(hotelId: number, roomId: number) {
    this.initializeStorage();
    const rooms = JSON.parse(localStorage.getItem(this.ROOMS_KEY) || "[]");
    const filteredRooms = rooms.filter(
      (room: RoomType) => !(room.hotelId === hotelId && room.id === roomId)
    );

    localStorage.setItem(this.ROOMS_KEY, JSON.stringify(filteredRooms));
    return Promise.resolve(true);
  }

  // Utility methods
  static async resetStorage(): Promise<void> {
    try {
      // Define all data types that need to be reset
      const dataTypes: HotelDataKey[] = [
        "hotel",
        "rooms",
        "contracts",
        "markets",
        "seasons",
        "mealPlans",
        "marketTemplates",
        "ageCategories",
        "currencySettings",
        "marketGroups",
        "roomTypes",
        "periods",
        "policies",
        "capacity",
        "roomInventory",
        "contractRates"  // Added contractRates to hotel-specific data types
      ];

      // Get all hotel IDs
      const hotelIds = initialHotels.map((hotel) => hotel.id);

      // Create reset operations for each hotel and data type
      const resetOperations = hotelIds.flatMap((hotelId) => {
        return dataTypes.map((dataType) => {
          // Get initial data based on data type
          const initialData = this.getInitialDataForType(dataType, hotelId);
          if (initialData) {
            // Fix: Use proper template literal syntax
            const storageKey = `${hotelId}_${dataType}`;
            return this.setStorageData(storageKey, initialData);
          }
          return Promise.resolve();
        });
      });

      // Reset global data not tied to specific hotels
      const globalResetOperations = [
        this.setStorageData(
          this.STORAGE_KEYS.CURRENCY_SETTINGS,
          initialCurrencySettings
        ),
        this.setStorageData(
          this.STORAGE_KEYS.MARKET_GROUPS,
          initialMarketGroups
        ),
        this.setStorageData(this.STORAGE_KEYS.MARKETS, initialMarkets),
        this.setStorageData(this.STORAGE_KEYS.CONTRACTS, initialContracts),
        this.setStorageData(this.STORAGE_KEYS.OFFERS, initialOffers),
        this.setStorageData(this.STORAGE_KEYS.CONTRACT_RATES, contractRates),
        this.setStorageData(
          this.STORAGE_KEYS.HOTEL_MEAL_PLANS,
          initialMealPlans.hotelSpecific
        ),
      ];

      // Execute all reset operations in parallel
      await Promise.all([...resetOperations, ...globalResetOperations]);

      // Set storage initialization flag
      localStorage.setItem(this.STORAGE_KEYS.INITIALIZED, "true");

      console.log("Storage reset completed successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("Error resetting storage:", error);
      return Promise.reject(new Error("Failed to reset storage"));
    }
  }


  static async getTotalContracts(): Promise<number> {
    this.initializeStorage();
    const contracts = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.CONTRACTS) || "[]"
    );
    return Promise.resolve(contracts.length);
  }

  private static async getInitialDataForType(
    type: HotelDataKey,
    hotelId?: number
  ) {
    const storageKey = this.getStorageKey(type);
    const initialData = JSON.parse(localStorage.getItem(storageKey) || "[]");

    if (hotelId) {
      return this.filterDataForHotel(initialData, hotelId);
    }
    return initialData;
  }

  private static filterDataForHotel<T>(data: T[], hotelId: number): T[] {
    if (Array.isArray(data)) {
      return data.filter((item: any) => item.hotelId === hotelId);
    }
    return data;
  }

  // Helper method to store data
  private static async setDataForType<T>(
    type: keyof typeof MockApiService.STORAGE_KEYS,
    data: T
  ): Promise<void> {
    localStorage.setItem(this.STORAGE_KEYS[type], JSON.stringify(data));
  }

  protected static getData<T>(key: string): T | null {
    const storageKey = this.getStorageKey(key);
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  }

  protected static setData<T>(key: string, data: T): void {
    const storageKey = this.getStorageKey(key);
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  // Reset specific type to initial data
  static async resetDataForType<T>(
    type: keyof typeof MockApiService.STORAGE_KEYS
  ): Promise<void> {
    const dataKey = type
      .toLowerCase()
      .replace(/_./g, (x) =>
        x[1].toUpperCase()
      ) as keyof typeof MockApiService.INITIAL_DATA;
    const initialData = await this.INITIAL_DATA[dataKey]();
    await this.setDataForType<T>(type, initialData as T);
  }

  // Reset all data to initial state
  static async resetAllData(): Promise<void> {
    await Promise.all(
      Object.keys(this.STORAGE_KEYS).map((key) =>
        this.resetDataForType(key as keyof typeof MockApiService.STORAGE_KEYS)
      )
    );
  }

  static async clearStorage(): Promise<void> {
    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return Promise.resolve();
  }

  // Get all default meal plans
  static async getMealPlans(): Promise<MealPlan[]> {
    this.initializeStorage();
    const mealPlans = localStorage.getItem(this.STORAGE_KEYS.MEAL_PLANS);
    return Promise.resolve(JSON.parse(mealPlans || "[]"));
  }

  /// Get meal plans for a specific hotel (combines default + hotel-specific)
  static async getHotelMealPlans(hotelId: number): Promise<MealPlan[]> {
    this.initializeStorage();
    const defaultPlans = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.MEAL_PLANS) || "[]"
    );
    const hotelPlansMap = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.HOTEL_MEAL_PLANS) || "{}"
    );

    const hotelSpecificPlans = hotelPlansMap[hotelId] || [];
    return Promise.resolve([...defaultPlans, ...hotelSpecificPlans]);
  }

  // Update a meal plan
  static async updateMealPlan(
    mealPlanId: string,
    updates: Partial<MealPlan>
  ): Promise<MealPlan> {
    this.initializeStorage();

    // Check default meal plans first
    let defaultPlans = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.MEAL_PLANS) || "[]"
    );

    const defaultIndex = defaultPlans.findIndex(
      (plan: MealPlan) => plan.id === mealPlanId
    );

    if (defaultIndex !== -1) {
      defaultPlans[defaultIndex] = {
        ...defaultPlans[defaultIndex],
        ...updates,
      };
      localStorage.setItem(
        this.STORAGE_KEYS.MEAL_PLANS,
        JSON.stringify(defaultPlans)
      );
      return Promise.resolve(defaultPlans[defaultIndex]);
    }

    // If not found in default plans, check hotel-specific plans
    const hotelPlansMap = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.HOTEL_MEAL_PLANS) || "{}"
    );

    for (const hotelId in hotelPlansMap) {
      const hotelPlans = hotelPlansMap[hotelId];
      const planIndex = hotelPlans.findIndex(
        (plan: MealPlan) => plan.id === mealPlanId
      );

      if (planIndex !== -1) {
        hotelPlansMap[hotelId][planIndex] = {
          ...hotelPlansMap[hotelId][planIndex],
          ...updates,
        };
        localStorage.setItem(
          this.STORAGE_KEYS.HOTEL_MEAL_PLANS,
          JSON.stringify(hotelPlansMap)
        );
        return Promise.resolve(hotelPlansMap[hotelId][planIndex]);
      }
    }

    return Promise.reject(new Error("Meal plan not found"));
  }

  static async getMealPlanById(id: string): Promise<MealPlan | undefined> {
    this.initializeStorage();

    // Check default meal plans first
    const defaultPlans = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.MEAL_PLANS) || "[]"
    ) as MealPlan[];

    const defaultPlan = defaultPlans.find((plan) => plan.id === id);
    if (defaultPlan) {
      return Promise.resolve(defaultPlan);
    }

    // Check hotel-specific meal plans
    const hotelPlansMap = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.HOTEL_MEAL_PLANS) || "{}"
    ) as Record<number, MealPlan[]>;

    // Search through all hotel meal plans
    for (const hotelPlans of Object.values(hotelPlansMap)) {
      const plan = hotelPlans.find((p) => p.id === id);
      if (plan) {
        return Promise.resolve(plan);
      }
    }

    return Promise.resolve(undefined);
  }

  static async createMealPlan(mealPlan: MealPlan): Promise<MealPlan> {
    this.initializeStorage();

    // Check if it's a hotel-specific meal plan
    if (mealPlan.id.includes("hotel-")) {
      const hotelPlansMap = JSON.parse(
        localStorage.getItem(this.STORAGE_KEYS.HOTEL_MEAL_PLANS) || "{}"
      ) as Record<number, MealPlan[]>;

      // Extract hotel ID from the meal plan ID or use a provided hotel ID
      const hotelId = parseInt(mealPlan.id.split("-")[1]);

      if (!hotelPlansMap[hotelId]) {
        hotelPlansMap[hotelId] = [];
      }

      hotelPlansMap[hotelId].push(mealPlan);
      localStorage.setItem(
        this.STORAGE_KEYS.HOTEL_MEAL_PLANS,
        JSON.stringify(hotelPlansMap)
      );
    } else {
      // Add to default meal plans
      const defaultPlans = JSON.parse(
        localStorage.getItem(this.STORAGE_KEYS.MEAL_PLANS) || "[]"
      ) as MealPlan[];

      defaultPlans.push(mealPlan);
      localStorage.setItem(
        this.STORAGE_KEYS.MEAL_PLANS,
        JSON.stringify(defaultPlans)
      );
    }

    return Promise.resolve(mealPlan);
  }

  static async deleteMealPlan(id: string): Promise<void> {
    this.initializeStorage();

    // Check default meal plans first
    let defaultPlans = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.MEAL_PLANS) || "[]"
    );

    const defaultIndex = defaultPlans.findIndex(
      (plan: MealPlan) => plan.id === id
    );

    if (defaultIndex !== -1) {
      defaultPlans.splice(defaultIndex, 1);
      localStorage.setItem(
        this.STORAGE_KEYS.MEAL_PLANS,
        JSON.stringify(defaultPlans)
      );
      return Promise.resolve();
    }

    // If not found in default plans, check hotel-specific plans
    const hotelPlansMap = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.HOTEL_MEAL_PLANS) || "{}"
    );

    for (const hotelId in hotelPlansMap) {
      const hotelPlans = hotelPlansMap[hotelId];
      const planIndex = hotelPlans.findIndex(
        (plan: MealPlan) => plan.id === id
      );

      if (planIndex !== -1) {
        hotelPlansMap[hotelId].splice(planIndex, 1);
        localStorage.setItem(
          this.STORAGE_KEYS.HOTEL_MEAL_PLANS,
          JSON.stringify(hotelPlansMap)
        );
        return Promise.resolve();
      }
    }

    return Promise.reject(new Error("Meal plan not found"));
  }

  // Get age categories for a specific hotel
  static async getHotelAgeCategories(hotelId: number): Promise<AgeCategory[]> {
    const hotel = await this.getHotelById(hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }
    return Promise.resolve(hotel.ageCategories || []);
  }

  // Update age categories for a specific hotel
  static async updateHotelAgeCategories(
    hotelId: number,
    categories: AgeCategory[]
  ): Promise<Hotel> {
    this.initializeStorage();
    const hotels = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.HOTELS) || "[]"
    );
    const index = hotels.findIndex((h: Hotel) => h.id === hotelId);

    if (index === -1) {
      throw new Error("Hotel not found");
    }

    // Validate age categories before updating
    this.validateAgeCategories(categories);

    // Update each category's label based on age ranges
    const updatedCategories = categories.map((category) => ({
      ...category,
      label: this.generateAgeLabel(category),
    }));

    hotels[index] = {
      ...hotels[index],
      ageCategories: updatedCategories,
    };

    localStorage.setItem(this.STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
    return Promise.resolve(hotels[index]);
  }

  // Add a single age category
  static async addHotelAgeCategory(
    hotelId: number,
    category: Omit<AgeCategory, "id" | "label">
  ): Promise<Hotel> {
    const hotel = await this.getHotelById(hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    const currentCategories = hotel.ageCategories || [];
    const newId = Math.max(0, ...currentCategories.map((c) => c.id)) + 1;

    const newCategory: AgeCategory = {
      ...category,
      id: newId,
      label: this.generateAgeLabel(category),
    };

    return this.updateHotelAgeCategories(hotelId, [
      ...currentCategories,
      newCategory,
    ]);
  }

  // Delete an age category
  static async deleteHotelAgeCategory(
    hotelId: number,
    categoryId: number
  ): Promise<Hotel> {
    const hotel = await this.getHotelById(hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    const currentCategories = hotel.ageCategories || [];
    const updatedCategories = currentCategories.filter(
      (c) => c.id !== categoryId
    );

    return this.updateHotelAgeCategories(hotelId, updatedCategories);
  }

  // Helper method to generate age category label
  private static generateAgeLabel(
    category: Pick<AgeCategory, "type" | "name" | "minAge" | "maxAge">
  ): string {
    switch (category.type) {
      case "adult":
        return `${category.name} (${category.minAge}+ years)`;
      case "infant":
      case "child":
      case "teen":
        return `${category.name} (${category.minAge}-${category.maxAge} years)`;
      default:
        return `${category.name} (${category.minAge}-${category.maxAge} years)`;
    }
  }

  // Validate age categories before saving
  private static validateAgeCategories(categories: AgeCategory[]): void {
    // Check for overlapping age ranges
    categories.forEach((category, index) => {
      categories.forEach((otherCategory, otherIndex) => {
        if (index !== otherIndex) {
          const overlap =
            (category.minAge >= otherCategory.minAge &&
              category.minAge <= otherCategory.maxAge) ||
            (category.maxAge >= otherCategory.minAge &&
              category.maxAge <= otherCategory.maxAge);

          if (overlap) {
            throw new Error(
              `Age ranges overlap between ${category.name} and ${otherCategory.name}`
            );
          }
        }
      });

      // Validate individual category
      if (category.minAge > category.maxAge) {
        throw new Error(
          `Invalid age range for ${category.name}: minimum age cannot be greater than maximum age`
        );
      }

      if (category.minAge < 0 || category.maxAge > 100) {
        throw new Error(
          `Invalid age range for ${category.name}: ages must be between 0 and 100`
        );
      }
    });
  }

  // Currency-specific methods
  static async getCurrencySettings(): Promise<CurrencySetting[]> {
    return this.getItems(
      this.STORAGE_KEYS.CURRENCY_SETTINGS,
      initialCurrencySettings
    );
  }

  static async updateCurrencySetting(
    currencyCode: string,
    updates: Partial<CurrencySetting>
  ): Promise<CurrencySetting> {
    const currencies = await this.getCurrencySettings();
    const index = currencies.findIndex((c) => c.code === currencyCode);

    if (index === -1) {
      throw new Error("Currency not found");
    }

    // Prevent updating active currencies
    if (currencies[index].isActive && updates.hasOwnProperty("code")) {
      throw new Error("Cannot modify active currency code");
    }

    currencies[index] = { ...currencies[index], ...updates };
    await this.setStorageData(this.STORAGE_KEYS.CURRENCY_SETTINGS, currencies);
    return currencies[index];
  }

  static async addCurrencySetting(
    currency: Omit<CurrencySetting, "id">
  ): Promise<CurrencySetting> {
    const currencies = await this.getCurrencySettings();

    // Check for duplicate currency code
    if (currencies.some((c) => c.code === currency.code)) {
      throw new Error(`Currency with code ${currency.code} already exists`);
    }

    // Generate new ID
    const newId = Math.max(0, ...currencies.map((c) => c.id)) + 1;
    const newCurrency: CurrencySetting = {
      ...currency,
      id: newId,
      isActive: false, // New currencies are always inactive initially
    };

    currencies.push(newCurrency);
    await this.setStorageData(this.STORAGE_KEYS.CURRENCY_SETTINGS, currencies);
    return newCurrency;
  }

  static async deleteCurrencySetting(code: string): Promise<void> {
    const currencies = await this.getCurrencySettings();
    const currency = currencies.find((c) => c.code === code);

    if (!currency) {
      throw new Error("Currency not found");
    }

    if (currency.isActive) {
      throw new Error("Cannot delete an active currency");
    }

    const filteredCurrencies = currencies.filter((c) => c.code !== code);
    await this.setStorageData(
      this.STORAGE_KEYS.CURRENCY_SETTINGS,
      filteredCurrencies
    );
  }

  static async updateCurrencyStatus(
    code: string,
    isActive: boolean
  ): Promise<CurrencySetting> {
    return this.updateCurrencySetting(code, { isActive });
  }

  // Add these new methods for Market operations
  static async getMarkets(): Promise<Market[]> {
    this.initializeStorage();
    const markets = localStorage.getItem(this.STORAGE_KEYS.MARKETS);
    return Promise.resolve(JSON.parse(markets || "[]"));
  }

  static async getMarketById(id: number): Promise<Market | null> {
    this.initializeStorage();
    const markets = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.MARKETS) || "[]"
    );
    return Promise.resolve(
      markets.find((market: Market) => market.id === id) || null
    );
  }

  static async createMarket(market: Omit<Market, "id">): Promise<Market> {
    this.initializeStorage();
    const markets = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.MARKETS) || "[]"
    );
    const newId = Math.max(0, ...markets.map((m: Market) => m.id)) + 1;

    const newMarket = {
      ...market,
      id: newId,
    };

    markets.push(newMarket);
    localStorage.setItem(this.STORAGE_KEYS.MARKETS, JSON.stringify(markets));
    return Promise.resolve(newMarket);
  }

  static async updateMarket(
    id: number,
    marketData: Partial<Market>
  ): Promise<Market> {
    this.initializeStorage();
    const markets = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.MARKETS) || "[]"
    );
    const index = markets.findIndex((market: Market) => market.id === id);

    if (index === -1) {
      return Promise.reject(new Error("Market not found"));
    }

    markets[index] = { ...markets[index], ...marketData };
    localStorage.setItem(this.STORAGE_KEYS.MARKETS, JSON.stringify(markets));
    return Promise.resolve(markets[index]);
  }

  static async deleteMarket(id: number): Promise<void> {
    this.initializeStorage();
    const markets = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.MARKETS) || "[]"
    );
    const filteredMarkets = markets.filter(
      (market: Market) => market.id !== id
    );
    localStorage.setItem(
      this.STORAGE_KEYS.MARKETS,
      JSON.stringify(filteredMarkets)
    );
    return Promise.resolve();
  }

  // Add these new methods for MarketGroup operations
  static async getMarketGroups(): Promise<MarketGroup[]> {
    this.initializeStorage();
    const groups = localStorage.getItem(this.STORAGE_KEYS.MARKET_GROUPS);
    return Promise.resolve(JSON.parse(groups || "[]"));
  }

  static async getMarketGroupById(id: number): Promise<MarketGroup | null> {
    this.initializeStorage();
    const groups = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.MARKET_GROUPS) || "[]"
    );
    return Promise.resolve(
      groups.find((group: MarketGroup) => group.id === id) || null
    );
  }

  static async createMarketGroup(
    group: Omit<MarketGroup, "id">
  ): Promise<MarketGroup> {
    this.initializeStorage();
    const groups = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.MARKET_GROUPS) || "[]"
    );

    // Generate new ID
    const newId =
      groups.length > 0
        ? Math.max(...groups.map((g: MarketGroup) => g.id)) + 1
        : 1;

    // Create new market group with generated ID
    const newGroup: MarketGroup = {
      ...group,
      id: newId,
    };

    groups.push(newGroup);
    localStorage.setItem(
      this.STORAGE_KEYS.MARKET_GROUPS,
      JSON.stringify(groups)
    );
    return Promise.resolve(newGroup);
  }

  static async updateMarketGroup(
    id: number,
    updates: Partial<MarketGroup>
  ): Promise<MarketGroup> {
    this.initializeStorage();
    const groups = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.MARKET_GROUPS) || "[]"
    );
    const index = groups.findIndex((g: MarketGroup) => g.id === id);
    if (index === -1) {
      throw new Error("Market group not found");
    }
    groups[index] = { ...groups[index], ...updates };
    localStorage.setItem(
      this.STORAGE_KEYS.MARKET_GROUPS,
      JSON.stringify(groups)
    );
    return Promise.resolve(groups[index]);
  }

  static async deleteMarketGroup(id: number): Promise<void> {
    this.initializeStorage();
    const groups = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.MARKET_GROUPS) || "[]"
    );
    const filteredGroups = groups.filter(
      (group: MarketGroup) => group.id !== id
    );
    localStorage.setItem(
      this.STORAGE_KEYS.MARKET_GROUPS,
      JSON.stringify(filteredGroups)
    );
    return Promise.resolve();
  }

  // Get all seasons for a specific hotel
  static async getSeasonsByHotel(hotelId: number): Promise<Season[]> {
    this.initializeStorage();
    const seasonsData = localStorage.getItem(this.STORAGE_KEYS.SEASONS);
    const allSeasons = JSON.parse(seasonsData || "{}");
    return Promise.resolve(allSeasons[hotelId] || []);
  }

  // Get a specific season by ID for a hotel
  static async getSeasonById(
    hotelId: number,
    seasonId: number
  ): Promise<Season | null> {
    const seasons = await this.getSeasonsByHotel(hotelId);
    return Promise.resolve(
      seasons.find((season) => season.id === seasonId) || null
    );
  }

  // Create a new season for a hotel
  static async createSeason(
    hotelId: number,
    seasonData: Omit<Season, "id">
  ): Promise<Season> {
    const seasons = await this.getSeasonsByHotel(hotelId);
    const newId = Math.max(0, ...seasons.map((s) => s.id)) + 1;

    const newSeason: Season = {
      ...seasonData,
      id: newId,
    };

    const allSeasons = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.SEASONS) || "{}"
    );
    allSeasons[hotelId] = [...(allSeasons[hotelId] || []), newSeason];

    localStorage.setItem(this.STORAGE_KEYS.SEASONS, JSON.stringify(allSeasons));
    return Promise.resolve(newSeason);
  }

  // Update an existing season
  static async updateSeason(
    hotelId: number,
    seasonId: number,
    updates: Partial<Season>
  ): Promise<Season> {
    const allSeasons: { [hotelId: number]: Season[] } = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.SEASONS) || "{}"
    );
    const hotelSeasons: Season[] = allSeasons[hotelId] || [];

    const index = hotelSeasons.findIndex((season) => season.id === seasonId);
    if (index === -1) {
      throw new Error("Season not found");
    }

    // Update the season directly in the array
    hotelSeasons[index] = {
      ...hotelSeasons[index],
      ...updates,
    };

    // Update the hotel's seasons in the main object
    allSeasons[hotelId] = hotelSeasons;

    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEYS.SEASONS, JSON.stringify(allSeasons));

    return Promise.resolve(hotelSeasons[index]);
  }

  // Delete a season
  static async deleteSeason(hotelId: number, seasonId: number): Promise<void> {
    const allSeasons = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.SEASONS) || "{}"
    );
    const hotelSeasons = allSeasons[hotelId] || [];

    allSeasons[hotelId] = hotelSeasons.filter(
      (season: Season) => season.id !== seasonId
    );
    localStorage.setItem(this.STORAGE_KEYS.SEASONS, JSON.stringify(allSeasons));
    return Promise.resolve();
  }

  // Period-related methods
  static async createPeriod(
    hotelId: number,
    seasonId: number,
    periodData: Omit<Period, "id">
  ): Promise<Period> {
    const season = await this.getSeasonById(hotelId, seasonId);
    if (!season) {
      throw new Error("Season not found");
    }

    const periods = season.periods || [];
    const newId = Math.max(0, ...periods.map((p) => p.id)) + 1;

    const newPeriod: Period = {
      ...periodData,
      id: newId,
      seasonId,
    };

    season.periods = [...periods, newPeriod];
    await this.updateSeason(hotelId, seasonId, { periods: season.periods });
    return Promise.resolve(newPeriod);
  }

  static async updatePeriod(
    hotelId: number,
    seasonId: number,
    periodId: number,
    updates: Partial<Period>
  ): Promise<Period> {
    const season = await this.getSeasonById(hotelId, seasonId);
    if (!season || !season.periods) {
      throw new Error("Season or periods not found");
    }

    const periodIndex = season.periods.findIndex((p) => p.id === periodId);
    if (periodIndex === -1) {
      throw new Error("Period not found");
    }

    const updatedPeriod = {
      ...season.periods[periodIndex],
      ...updates,
      id: periodId,
      seasonId,
    };

    season.periods[periodIndex] = updatedPeriod;
    await this.updateSeason(hotelId, seasonId, { periods: season.periods });
    return Promise.resolve(updatedPeriod);
  }

  static async deletePeriod(
    hotelId: number,
    seasonId: number,
    periodId: number
  ): Promise<void> {
    const season = await this.getSeasonById(hotelId, seasonId);
    if (!season || !season.periods) {
      throw new Error("Season or periods not found");
    }

    const updatedPeriods = season.periods.filter((p) => p.id !== periodId);
    await this.updateSeason(hotelId, seasonId, { periods: updatedPeriods });
    return Promise.resolve();
  }

  private static initializeSeasons() {
    if (!localStorage.getItem(this.STORAGE_KEYS.SEASONS)) {
      localStorage.setItem(
        this.STORAGE_KEYS.SEASONS,
        JSON.stringify(initialSeasons)
      );
    }
  }

  // Contract-specific methods
  static async getContracts(
    pageSize: number = 10,
    pageIndex: number = 0
  ): Promise<{ contracts: Contract[]; total: number }> {
    this.initializeStorage();
    const contracts = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.CONTRACTS) || "[]"
    );
    const total = contracts.length;

    const start = pageIndex * pageSize;
    const paginatedContracts = contracts.slice(start, start + pageSize);

    return Promise.resolve({ contracts: paginatedContracts, total });
  }

  static async getContractById(id: number): Promise<Contract | null> {
    this.initializeStorage();
    const contracts = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.CONTRACTS) || "[]"
    );
    return Promise.resolve(
      contracts.find((contract: Contract) => contract.id === id) || null
    );
  }

  static async createContract(contractData: Omit<Contract, "id">): Promise<Contract> {
    this.initializeStorage();
    const contracts = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.CONTRACTS) || "[]"
    );
  
    const newId = Math.max(0, ...contracts.map((c: Contract) => c.id)) + 1;
    const newContract: Contract = { 
      ...contractData, 
      id: newId,
      isRatesConfigured: false 
    };
  
    contracts.push(newContract);
    localStorage.setItem(this.STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
    return Promise.resolve(newContract);
}
  
  static async updateContract(
    id: number,
    updates: Partial<Contract>
  ): Promise<Contract> {
    this.initializeStorage();
    const contracts = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.CONTRACTS) || "[]"
    );
    const index = contracts.findIndex(
      (contract: Contract) => contract.id === id
    );
  
    if (index === -1) {
      throw new Error("Contract not found");
    }
  
    // Ensure baseMealPlan is properly updated if provided
    contracts[index] = { 
      ...contracts[index], 
      ...updates,
      baseMealPlan: updates.baseMealPlan || contracts[index].baseMealPlan 
    };
    
    localStorage.setItem(
      this.STORAGE_KEYS.CONTRACTS,
      JSON.stringify(contracts)
    );
    return Promise.resolve(contracts[index]);
  }
  
  static async deleteContract(id: number): Promise<void> {
    this.initializeStorage();
    const contracts = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.CONTRACTS) || "[]"
    );
    const filteredContracts = contracts.filter(
      (contract: Contract) => contract.id !== id
    );

    localStorage.setItem(
      this.STORAGE_KEYS.CONTRACTS,
      JSON.stringify(filteredContracts)
    );
    return Promise.resolve();
  }

  static async getContractsByHotelId(hotelId: number): Promise<Contract[]> {
    this.initializeStorage();
    const contracts = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.CONTRACTS) || "[]"
    );
    return Promise.resolve(
      contracts.filter((contract: Contract) => contract.hotelId === hotelId)
    );
  }

  static async getContractRates(contractId: number): Promise<ContractPeriodRate[]> {
    this.initializeStorage();
    
    // Get rates from mock data first
    let rates = contractRates.filter(rate => rate.contractId === contractId);
    
    // If no rates in mock data, try localStorage
    if (!rates.length) {
      const storedRates = localStorage.getItem(this.STORAGE_KEYS.CONTRACT_RATES);
      if (storedRates) {
        const parsedRates = JSON.parse(storedRates);
        rates = parsedRates.filter((rate: ContractPeriodRate) => 
          rate.contractId === contractId
        );
      }
    }
    
    console.log(`Retrieved rates for contract ${contractId}:`, rates); // Debug log
    return rates;
  }
  

  static async updateContractRates(
    contractId: number,
    rates: ContractPeriodRate[]
  ): Promise<Contract> {
    this.initializeStorage();
  
    const ratesData =
      localStorage.getItem(this.STORAGE_KEYS.CONTRACT_RATES) || "{}";
    const allRates = JSON.parse(ratesData);
    allRates[contractId] = rates;
    localStorage.setItem(
      this.STORAGE_KEYS.CONTRACT_RATES,
      JSON.stringify(allRates)
    );

    // Get and return the updated contract
    const contracts = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.CONTRACTS) || "[]"
    );
    const contract = contracts.find((c: Contract) => c.id === contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }
    
    // Update isRatesConfigured flag
    contract.isRatesConfigured = true;
    localStorage.setItem(
      this.STORAGE_KEYS.CONTRACTS,
      JSON.stringify(contracts)
    );

    return Promise.resolve(contract);
  }


  static async getOffers(): Promise<SpecialOffer[]> {
    this.initializeStorage();
    const offers = localStorage.getItem(this.STORAGE_KEYS.OFFERS);
    return Promise.resolve(JSON.parse(offers || "[]"));
  }

  static async getOfferById(id: number): Promise<SpecialOffer | null> {
    this.initializeStorage();
    const offers = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.OFFERS) || "[]"
    );
    return Promise.resolve(
      offers.find((offer: SpecialOffer) => offer.id === id) || null
    );
  }

  static async createOffer(
    offer: Omit<SpecialOffer, "id">
  ): Promise<SpecialOffer> {
    this.initializeStorage();
    const offers = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.OFFERS) || "[]"
    );
    const newId = Math.max(0, ...offers.map((o: SpecialOffer) => o.id)) + 1;

    const newOffer = {
      ...offer,
      id: newId,
    };

    offers.push(newOffer);
    localStorage.setItem(this.STORAGE_KEYS.OFFERS, JSON.stringify(offers));
    return Promise.resolve(newOffer);
  }

  static async updateOffer(
    id: number,
    offerData: Partial<SpecialOffer>
  ): Promise<SpecialOffer> {
    this.initializeStorage();
    const offers = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.OFFERS) || "[]"
    );
    const index = offers.findIndex((offer: SpecialOffer) => offer.id === id);

    if (index === -1) {
      throw new Error("Offer not found");
    }

    offers[index] = { ...offers[index], ...offerData };
    localStorage.setItem(this.STORAGE_KEYS.OFFERS, JSON.stringify(offers));
    return Promise.resolve(offers[index]);
  }

  static async deleteOffer(id: number): Promise<void> {
    this.initializeStorage();
    const offers = JSON.parse(
      localStorage.getItem(this.STORAGE_KEYS.OFFERS) || "[]"
    );
    const filteredOffers = offers.filter(
      (offer: SpecialOffer) => offer.id !== id
    );
    localStorage.setItem(
      this.STORAGE_KEYS.OFFERS,
      JSON.stringify(filteredOffers)
    );
    return Promise.resolve();
  }

  static async getContract(contractId: number): Promise<Contract> {
    const contractsData = localStorage.getItem(this.STORAGE_KEYS.CONTRACTS);
    const contracts = JSON.parse(contractsData || '[]');
    const contract = contracts.find((c: Contract) => c.id === contractId);
    
    if (!contract) {
        throw new Error(`Contract not found with id ${contractId}`);
    }
    
    return contract;
}
}
