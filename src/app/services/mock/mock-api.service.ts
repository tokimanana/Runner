// src/app/services/mock/mock-api.service.ts
import { hotels as initialHotels } from '../../data/mock/hotels.mock';
import { policies as initialPolicies } from '../../data/mock/policies.mock';
import { rooms as initialRooms } from '../../data/mock/rooms.mock';

import { contracts as initialContracts } from '../../../data/mock/contracts.mock';
import { markets as initialMarkets } from '../../../data/mock/markets.mock';
import { marketGroups as initialMarketGroups } from '../../../data/mock/market-groups.mock';
import { mealPlans as initialMealPlans } from '../../../data/mock/meal-plans.mock';
import { seasons as initialSeasons } from '../../../data/mock/seasons.mock';
import { currencySettings as initialCurrencySettings } from '../../../data/mock/currencies.mock';

import { Hotel, Room, Contract, Market, MarketGroup, MealPlan, Season, CurrencySetting, HotelPolicies, HotelDataKey, PolicyType, RoomType } from '../../models/types';

export class MockApiService {
  protected static readonly STORAGE_KEYS = {
    HOTELS: 'mock_hotels',
    POLICIES: 'mock_policies',
    ROOMS: 'mock_rooms',
    CONTRACTS: 'mock_contracts',
    MARKETS: 'mock_markets',
    MARKET_GROUPS: 'mock_market_groups',
    MEAL_PLANS: 'mock_meal_plans',
    SEASONS: 'mock_seasons',
    CURRENCY_SETTINGS: 'mock_currency_settings',
    INITIALIZED: 'mock_storage_initialized'
  };

  private static readonly ROOMS_KEY = 'mock_rooms';

  // Generic methods for data management
  private static getStorageData<T>(key: string, initialData: T[]): T[] {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : initialData;
  }

  // Public method to access storage keys
  public static getStorageKey(key: keyof typeof MockApiService.STORAGE_KEYS): string {
    return this.STORAGE_KEYS[key];
  }

  private static setStorageData(key: string, data: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return Promise.resolve();
    } catch (error) {
      console.error(`Error setting storage data for key ${key}:`, error);
      return Promise.reject(error);
    }
  }

  private static initializeStorage(): void {
    if (!localStorage.getItem(this.STORAGE_KEYS.HOTELS)) {
      this.setStorageData(this.STORAGE_KEYS.HOTELS, initialHotels);
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.POLICIES)) {
      localStorage.setItem(this.STORAGE_KEYS.POLICIES, JSON.stringify(initialPolicies));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.ROOMS)) {
      this.setStorageData(this.STORAGE_KEYS.ROOMS, initialRooms);
    }
    // ... initialize other data types
  }

  // Generic CRUD operations
  private static async getItems<T>(key: string, initialData: T[]): Promise<T[]> {
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
    return Promise.resolve(items.find(item => item.id === id));
  }

  private static async updateItem<T extends { id: number }>(
    key: string, 
    id: number, 
    updates: Partial<T>, 
    initialData: T[]
  ): Promise<T> {
    const items = this.getStorageData<T>(key, initialData);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('Item not found');
    }

    items[index] = { ...items[index], ...updates };
    this.setStorageData(key, items);
    return Promise.resolve(items[index]);
  }

  // Public API methods
  static getHotels(): Promise<Hotel[]> {
    this.initializeStorage();
    return Promise.resolve(JSON.parse(localStorage.getItem(this.STORAGE_KEYS.HOTELS) || '[]'));
  }

  static getHotelById(id: number): Promise<Hotel | null> {
    this.initializeStorage();
    const hotels = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.HOTELS) || '[]');
    const hotel = hotels.find((hotel: any) => hotel.id === id);
    return Promise.resolve(hotel || null);
  }

  static updateHotel(id: number, hotelData: Partial<Hotel>): Promise<Hotel> {
    this.initializeStorage();
    const hotels = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.HOTELS) || '[]');
    const index = hotels.findIndex((hotel: Hotel) => hotel.id === id);
    
    if (index === -1) {
      return Promise.reject(new Error(`Hotel with id ${id} not found`));
    }
    
    hotels[index] = { ...hotels[index], ...hotelData };
    localStorage.setItem(this.STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
    return Promise.resolve(hotels[index]);
  }

  static resetHotelsData(): Promise<void> {
    localStorage.setItem(this.STORAGE_KEYS.HOTELS, JSON.stringify(initialHotels));
    return Promise.resolve();
  }

  static async getHotelData<T>(hotelId: number, key: HotelDataKey): Promise<T | null> {
    this.initializeStorage();
    const storageKey = `hotel_${hotelId}_${key}`;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  }

  static async saveHotelData<T>(hotelId: number, key: HotelDataKey, value: T): Promise<void> {
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
    localStorage.setItem(this.STORAGE_KEYS.POLICIES, JSON.stringify(policiesMap));
    
    return Promise.resolve(policiesMap[hotelId]);
  }



  // Rooms methods
  static getRooms() {
    this.initializeStorage();
    const rooms = localStorage.getItem(this.ROOMS_KEY);
    return Promise.resolve(JSON.parse(rooms || '[]'));
  }

  static getRoomsByHotelId(hotelId: number) {
    this.initializeStorage();
    const rooms = JSON.parse(localStorage.getItem(this.ROOMS_KEY) || '[]');
    return Promise.resolve(rooms.filter((room: RoomType) => room.hotelId === hotelId));
  }

  static getRoomById(hotelId: number, roomId: number) {
    this.initializeStorage();
    const rooms = JSON.parse(localStorage.getItem(this.ROOMS_KEY) || '[]');
    return Promise.resolve(
      rooms.find((room: RoomType) => room.hotelId === hotelId && room.id === roomId)
    );
  }

  static updateRoom(hotelId: number, roomId: number, roomData: Partial<RoomType>) {
    this.initializeStorage();
    const rooms = JSON.parse(localStorage.getItem(this.ROOMS_KEY) || '[]');
    const index = rooms.findIndex(
      (room: RoomType) => room.hotelId === hotelId && room.id === roomId
    );

    if (index === -1) {
      return Promise.reject(new Error('Room not found'));
    }

    rooms[index] = { ...rooms[index], ...roomData };
    localStorage.setItem(this.ROOMS_KEY, JSON.stringify(rooms));
    return Promise.resolve(rooms[index]);
  }

  static createRoom(hotelId: number, roomData: Omit<RoomType, 'id'>) {
    this.initializeStorage();
    const rooms = JSON.parse(localStorage.getItem(this.ROOMS_KEY) || '[]');
    const newRoom = {
      ...roomData,
      id: Math.max(0, ...rooms.map((r: RoomType) => r.id)) + 1,
      hotelId
    };
    
    rooms.push(newRoom);
    localStorage.setItem(this.ROOMS_KEY, JSON.stringify(rooms));
    return Promise.resolve(newRoom);
  }

  static deleteRoom(hotelId: number, roomId: number) {
    this.initializeStorage();
    const rooms = JSON.parse(localStorage.getItem(this.ROOMS_KEY) || '[]');
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
      'hotel',
      'rooms',
      'contracts',
      'markets',
      'seasons',
      'mealPlans',
      'marketTemplates',
      'ageCategories',
      'currencySettings',
      'marketGroups',
      'roomTypes',
      'periods',
      'policies',
      'capacity',
      'roomInventory',
      // 'rates',
      // 'specialOffers'
    ];

    // Get all hotel IDs
    const hotelIds = initialHotels.map(hotel => hotel.id);

    // Create reset operations for each hotel and data type
    const resetOperations = hotelIds.flatMap(hotelId => {
      return dataTypes.map(dataType => {
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
      this.setStorageData(this.STORAGE_KEYS.CURRENCY_SETTINGS, currencySettings),
      this.setStorageData(this.STORAGE_KEYS.MARKET_GROUPS, defaultMarketGroups),
      this.setStorageData(this.STORAGE_KEYS.GLOBAL_SETTINGS, defaultGlobalSettings)
    ];

    // Execute all reset operations in parallel
    await Promise.all([...resetOperations, ...globalResetOperations]);

    // Set storage initialization flag
    localStorage.setItem(this.STORAGE_KEYS.INITIALIZED, 'true');
    
    console.log('Storage reset completed successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error resetting storage:', error);
    return Promise.reject(new Error('Failed to reset storage'));
  }
}

  
  private static getInitialDataForType(dataType: HotelDataKey, hotelId: number): any {
    switch (dataType) {
      case 'hotel':
        return initialHotels.find(h => h.id === hotelId);
      case 'policies':
        return initialHotels.find(h => h.id === hotelId)?.policies || {};
      case 'rooms':
        return initialRooms.filter(r => r.hotelId === hotelId);
      // case 'contracts':
      //   return initialContracts.filter(c => c.hotelId === hotelId);
      // case 'markets':
      //   return defaultMarkets;
      // case 'seasons':
      //   return hotelSeasons.filter(s => s.hotelId === hotelId);
      // case 'mealPlans':
      //   return defaultMealPlans.filter(mp => mp.hotelId === hotelId);
      // case 'ageCategories':
      //   return initialHotels.find(h => h.id === hotelId)?.ageCategories || [];
      // Add other cases as needed
      default:
        return null;
    }
  }

  static async clearStorage(): Promise<void> {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return Promise.resolve();
  }

  // Relationship methods

  static async getContractsByHotelId(hotelId: number): Promise<Contract[]> {
    const contracts = await this.getContracts();
    return Promise.resolve(contracts.filter(contract => contract.hotelId === hotelId));
  }


}
