// src/app/services/mock/mock-api.service.ts
import { hotels as initialHotels } from "../../data/mock/hotels.mock";
import { policies as initialPolicies } from "../../data/mock/policies.mock";
import { rooms as initialRooms } from "../../data/mock/rooms.mock";
import {
  defaultMealPlans as mealPlans,
  hotelMealPlans,
} from "../../data/mock/mealPlans.mock";
import { currencySettings as initialCurrencySettings } from "../../data/mock/currencies.mock";

import { contracts as initialContracts } from "../../../data/mock/contracts.mock";
import { markets as initialMarkets } from "../../../data/mock/markets.mock";
import { marketGroups as initialMarketGroups } from "../../../data/mock/market-groups.mock";
import { seasons as initialSeasons } from "../../../data/mock/seasons.mock";

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
} from "../../models/types";

export class MockApiService {
  protected static readonly STORAGE_KEYS = {
    HOTELS: "mock_hotels",
    POLICIES: "mock_policies",
    ROOMS: "mock_rooms",
    MEAL_PLANS: "mock_meal_plans",
    HOTEL_MEAL_PLANS: "hotel_meal_plans",
    CURRENCY_SETTINGS: "mock_currency_settings",

    CONTRACTS: "mock_contracts",
    MARKETS: "mock_markets",
    MARKET_GROUPS: "mock_market_groups",
    SEASONS: "mock_seasons",

    INITIALIZED: "mock_storage_initialized",
  };

  private static readonly ROOMS_KEY = "mock_rooms";

  // Generic methods for data management
  private static getStorageData<T>(key: string, initialData: T[]): T[] {
    this.initializeStorage();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initialData;
}

  // Public method to access storage keys
  public static getStorageKey(
    key: keyof typeof MockApiService.STORAGE_KEYS
  ): string {
    return this.STORAGE_KEYS[key];
  }

  private static setStorageData<T>(key: string, data: T): Promise<void> {
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
        JSON.stringify(mealPlans)
      );
      localStorage.setItem(
        this.STORAGE_KEYS.HOTEL_MEAL_PLANS,
        JSON.stringify(hotelMealPlans)
      );
      this.setStorageData(
        this.STORAGE_KEYS.CURRENCY_SETTINGS,
        initialCurrencySettings
      );
      // localStorage.setItem(this.STORAGE_KEYS.CONTRACTS, JSON.stringify(initialContracts));
      // localStorage.setItem(this.STORAGE_KEYS.MARKETS, JSON.stringify(initialMarkets));
      // localStorage.setItem(this.STORAGE_KEYS.SEASONS, JSON.stringify(initialSeasons));

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
    const index = hotels.findIndex(hotel => hotel.id === id);
    
    if (index !== -1) {
      hotels[index] = { ...hotels[index], ...hotelData };
      await this.setStorageData(this.STORAGE_KEYS.HOTELS, hotels);
      return hotels[index];
    }
    
    throw new Error('Hotel not found');
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
    key: HotelDataKey
  ): Promise<T | null> {
    this.initializeStorage();
    const storageKey = `hotel_${hotelId}_${key}`;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  }

  static async saveHotelData<T>(
    hotelId: number,
    key: HotelDataKey,
    value: T
  ): Promise<void> {
    const storageKey = `hotel_${hotelId}_${key}`;
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

  static async getMarkets(): Promise<Market[]> {
    return this.getItems(this.STORAGE_KEYS.MARKETS, initialMarkets);
  }

  static async getContracts(): Promise<Contract[]> {
    return this.getItems(this.STORAGE_KEYS.CONTRACTS, initialContracts);
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
        // 'rates',
        // 'specialOffers'
      ];

      // Get all hotel IDs
      const hotelIds = initialHotels.map((hotel) => hotel.id);

      // Create reset operations for each hotel and data type
      const resetOperations = hotelIds.flatMap((hotelId) => {
        return dataTypes.map((dataType) => {
          // Get initial data based on data type
          const initialData = this.getInitialDataForType(dataType, hotelId);
          if (initialData) {
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
          defaultMarketGroups
        ),
        this.setStorageData(
          this.STORAGE_KEYS.GLOBAL_SETTINGS,
          defaultGlobalSettings
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

  private static getInitialDataForType(
    dataType: HotelDataKey,
    hotelId: number
  ): any {
    switch (dataType) {
      case "hotel":
        return initialHotels.find((h) => h.id === hotelId);

      case "policies":
        return initialHotels.find((h) => h.id === hotelId)?.policies || {};

      case "rooms":
        return initialRooms.filter((r) => r.hotelId === hotelId);

      // case "contracts":
      //   return initialContracts.filter((c) => c.hotelId === hotelId);

      // case "markets":
      //   return defaultMarkets;

      // case "seasons":
      //   return hotelSeasons.filter((s) => s.hotelId === hotelId);

      case "mealPlans":
        return [...mealPlans, ...(hotelMealPlans[hotelId] || [])];

      // case "ageCategories":
      //   return initialHotels.find((h) => h.id === hotelId)?.ageCategories || [];

      // case "currencySettings":
      //   return currencySettings;

      // case "marketGroups":
      //   return defaultMarketGroups;

      case "roomTypes":
        return initialRooms.filter((r) => r.hotelId === hotelId);

      // case "periods":
      //   const hotelSeason = hotelSeasons.find((s) => s.hotelId === hotelId);
      //   return hotelSeason?.periods || [];

      case "description":
        return initialHotels.find((h) => h.id === hotelId)?.description || "";

      case "capacity":
        return initialHotels.find((h) => h.id === hotelId)?.totalRooms || 0;

      case "roomInventory":
        return []; // Initialize empty room inventory for new hotels

      case "cancellation":
        return (
          initialHotels.find((h) => h.id === hotelId)?.policies?.cancellation ||
          {}
        );

      case "checkIn":
        return initialHotels.find((h) => h.id === hotelId)?.checkInTime || "";

      case "checkOut":
        return initialHotels.find((h) => h.id === hotelId)?.checkOutTime || "";

      case "childPolicy":
        return (
          initialHotels.find((h) => h.id === hotelId)?.policies?.child || {}
        );

      case "petPolicy":
        return initialHotels.find((h) => h.id === hotelId)?.policies?.pet || {};

      case "dressCode":
        return (
          initialHotels.find((h) => h.id === hotelId)?.policies?.dressCode || {}
        );

      case "factSheet":
        return "";

      default:
        console.warn(`No initial data handler for type: ${dataType}`);
        return null;
    }
  }

  static async clearStorage(): Promise<void> {
    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return Promise.resolve();
  }

  // Relationship methods

  static async getContractsByHotelId(hotelId: number): Promise<Contract[]> {
    const contracts = await this.getContracts();
    return Promise.resolve(
      contracts.filter((contract) => contract.hotelId === hotelId)
    );
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
      throw new Error('Hotel not found');
    }
    return Promise.resolve(hotel.ageCategories || []);
  }

  // Update age categories for a specific hotel
  static async updateHotelAgeCategories(hotelId: number, categories: AgeCategory[]): Promise<Hotel> {
    this.initializeStorage();
    const hotels = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.HOTELS) || '[]');
    const index = hotels.findIndex((h: Hotel) => h.id === hotelId);
    
    if (index === -1) {
      throw new Error('Hotel not found');
    }

    // Validate age categories before updating
    this.validateAgeCategories(categories);

    // Update each category's label based on age ranges
    const updatedCategories = categories.map(category => ({
      ...category,
      label: this.generateAgeLabel(category)
    }));

    hotels[index] = {
      ...hotels[index],
      ageCategories: updatedCategories
    };

    localStorage.setItem(this.STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
    return Promise.resolve(hotels[index]);
  }


  // Add a single age category
  static async addHotelAgeCategory(hotelId: number, category: Omit<AgeCategory, 'id' | 'label'>): Promise<Hotel> {
    const hotel = await this.getHotelById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const currentCategories = hotel.ageCategories || [];
    const newId = Math.max(0, ...currentCategories.map(c => c.id)) + 1;

    const newCategory: AgeCategory = {
      ...category,
      id: newId,
      label: this.generateAgeLabel(category)
    };

    return this.updateHotelAgeCategories(hotelId, [...currentCategories, newCategory]);
  }

  // Delete an age category
  static async deleteHotelAgeCategory(hotelId: number, categoryId: number): Promise<Hotel> {
    const hotel = await this.getHotelById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const currentCategories = hotel.ageCategories || [];
    const updatedCategories = currentCategories.filter(c => c.id !== categoryId);

    return this.updateHotelAgeCategories(hotelId, updatedCategories);
  }


  // Helper method to generate age category label
  private static generateAgeLabel(category: Pick<AgeCategory, 'type' | 'name' | 'minAge' | 'maxAge'>): string {
    switch (category.type) {
      case 'adult':
        return `${category.name} (${category.minAge}+ years)`;
      case 'infant':
      case 'child':
      case 'teen':
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
          const overlap = (category.minAge >= otherCategory.minAge && category.minAge <= otherCategory.maxAge) ||
                         (category.maxAge >= otherCategory.minAge && category.maxAge <= otherCategory.maxAge);
          
          if (overlap) {
            throw new Error(`Age ranges overlap between ${category.name} and ${otherCategory.name}`);
          }
        }
      });

      // Validate individual category
      if (category.minAge > category.maxAge) {
        throw new Error(`Invalid age range for ${category.name}: minimum age cannot be greater than maximum age`);
      }

      if (category.minAge < 0 || category.maxAge > 100) {
        throw new Error(`Invalid age range for ${category.name}: ages must be between 0 and 100`);
      }
    });
  }

  // Currency-specific methods
  static async getCurrencySettings(): Promise<CurrencySetting[]> {
    return this.getItems(this.STORAGE_KEYS.CURRENCY_SETTINGS, initialCurrencySettings);
  }

  static async updateCurrencySetting(
    currencyCode: string,
    updates: Partial<CurrencySetting>
  ): Promise<CurrencySetting> {
    const currencies = await this.getCurrencySettings();
    const index = currencies.findIndex(c => c.code === currencyCode);
    
    if (index === -1) {
      throw new Error('Currency not found');
    }

    // Prevent updating active currencies
    if (currencies[index].isActive && updates.hasOwnProperty('code')) {
      throw new Error('Cannot modify active currency code');
    }

    currencies[index] = { ...currencies[index], ...updates };
    await this.setStorageData(this.STORAGE_KEYS.CURRENCY_SETTINGS, currencies);
    return currencies[index];
  }

  static async addCurrencySetting(currency: Omit<CurrencySetting, 'id'>): Promise<CurrencySetting> {
    const currencies = await this.getCurrencySettings();
    
    // Check for duplicate currency code
    if (currencies.some(c => c.code === currency.code)) {
      throw new Error(`Currency with code ${currency.code} already exists`);
    }

    // Generate new ID
    const newId = Math.max(0, ...currencies.map(c => c.id)) + 1;
    const newCurrency: CurrencySetting = {
      ...currency,
      id: newId,
      isActive: false // New currencies are always inactive initially
    };

    currencies.push(newCurrency);
    await this.setStorageData(this.STORAGE_KEYS.CURRENCY_SETTINGS, currencies);
    return newCurrency;
  }

  static async deleteCurrencySetting(code: string): Promise<void> {
    const currencies = await this.getCurrencySettings();
    const currency = currencies.find(c => c.code === code);

    if (!currency) {
      throw new Error('Currency not found');
    }

    if (currency.isActive) {
      throw new Error('Cannot delete an active currency');
    }

    const filteredCurrencies = currencies.filter(c => c.code !== code);
    await this.setStorageData(this.STORAGE_KEYS.CURRENCY_SETTINGS, filteredCurrencies);
  }

  static async updateCurrencyStatus(code: string, isActive: boolean): Promise<CurrencySetting> {
    return this.updateCurrencySetting(code, { isActive });
  }

}
