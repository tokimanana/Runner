import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Hotel, Market, Season, Contract, RateConfiguration, MarketTemplate, MenuItemId, MealPlan, HotelDataKey, MarketMealPlanRate, AgeCategory, CurrencySetting, MarketGroup, Rate, RoomType, HotelPolicies, Period, SpecialOffer, MealPlanType, HotelCapacity, RoomInventory, MenuItem } from '../models/types';
import { sampleData, currencySettings } from '../../data';
import { HttpClient } from '@angular/common/http';

// Local interfaces
interface DataMealPlan {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface MealPlansData {
  [key: string]: DataMealPlan[];
}

interface SeasonData {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
  periods?: Period[];
  startDate?: string;
  endDate?: string;
  mlos?: number;
  isBlackout?: boolean;
}

// Type helper for hotel data values based on key
type HotelDataValue<T extends HotelDataKey> = T extends 'hotel' ? Hotel
: T extends 'markets' ? Market[] 
: T extends 'seasons' ? Season[] 
: T extends 'contracts' ? Contract[] 
: T extends 'rateConfigurations' ? RateConfiguration[]
: T extends 'marketTemplates' ? MarketTemplate[]
: T extends 'menuItems' ? MenuItem[]
: T extends 'mealPlans' ? MealPlan[] 
: T extends 'marketMealPlanRates' ? MarketMealPlanRate[]
: T extends 'ageCategories' ? AgeCategory[]
: T extends 'currencySettings' ? CurrencySetting[]
: T extends 'marketGroups' ? MarketGroup[]
: T extends 'rates' ? Rate[] 
: T extends 'roomTypes' ? RoomType[] 
: T extends 'periods' ? Period[]
: T extends 'specialOffers' ? SpecialOffer[]
: T extends 'description' ? string 
: T extends 'policies' ? HotelPolicies 
: T extends 'capacity' ? HotelCapacity | null 
: T extends 'roomInventory' ? RoomInventory | null
: T extends 'cancellation' | 'checkIn' | 'checkOut' | 'childPolicy' | 'petPolicy' | 'dressCode' | 'factSheet' ? string | null
: never;

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  // Données statiques
  private hotels: Hotel[] = sampleData.hotels as Hotel[];
  private markets: Market[] = (sampleData.markets || []) as Market[];
  private currencySettings: CurrencySetting[] = currencySettings;
  private marketGroups: MarketGroup[] = (sampleData.marketGroups || []);

  // BehaviorSubjects pour les données dynamiques
  private selectedHotel = new BehaviorSubject<Hotel | null>(null);
  private selectedMenuItem = new BehaviorSubject<MenuItemId | null>(null);
  private activeTab = new BehaviorSubject<string>('general');
  private currentMarkets = new BehaviorSubject<Market[]>([]);
  private currentSeasons = new BehaviorSubject<Season[]>([]);
  private currentRooms = new BehaviorSubject<RoomType[]>([]);
  private currentContracts = new BehaviorSubject<Contract[]>([]);
  private currentRates = new BehaviorSubject<Rate[]>([]);
  private currentMealPlanRates = new BehaviorSubject<MarketMealPlanRate[]>([]);
  private hotelDescription = new BehaviorSubject<string>('');
  private hotelPolicies = new BehaviorSubject<HotelPolicies | null>(null);
  private hotelCapacity = new BehaviorSubject<HotelCapacity | null>(null);
  private hotelMealPlans = new BehaviorSubject<MealPlan[]>([]);
  private hotelPeriods = new BehaviorSubject<Period[]>([]);
  private hotelSpecialOffers = new BehaviorSubject<SpecialOffer[]>([]);
  private hotelRoomInventory = new BehaviorSubject<RoomInventory | null>(null);
  private hotelRooms = new BehaviorSubject<any[]>([]);
  private hotelMeals = new BehaviorSubject<any[]>([]);
  private hotelPhotos = new BehaviorSubject<any[]>([]);
  private hotelPrices = new BehaviorSubject<any[]>([]);
  private hotelServices = new BehaviorSubject<any[]>([]);
  private hotelLocation = new BehaviorSubject<any | null>(null);
  private marketsMap = new Map<number, Market[]>();
  private seasonsMap = new Map<number, Season[]>();
  private hotelDataMap = new Map<string, any>();
  private roomsMap = new Map<number, RoomType[]>();
  private marketMealPlanRates = new Map<number, MarketMealPlanRate[]>();
  private contractsMap = new Map<number, Contract[]>();
  private rates: Rate[] = [];
  private apiUrl = 'https://example.com/api'; // Replace with your API URL
  private marketGroupsSubject = new BehaviorSubject<MarketGroup[]>([]);
  private marketTemplates: MarketTemplate[] = [];

  // Observables publics
  public selectedHotel$ = this.selectedHotel.asObservable();
  public selectedMenuItem$ = this.selectedMenuItem.asObservable();
  public activeTab$ = this.activeTab.asObservable();
  public currentMarkets$ = this.currentMarkets.asObservable();
  public currentSeasons$ = this.currentSeasons.asObservable();
  public currentRooms$ = this.currentRooms.asObservable();
  public currentContracts$ = this.currentContracts.asObservable();
  public currentRates$ = this.currentRates.asObservable();
  public currentMealPlanRates$ = this.currentMealPlanRates.asObservable();

  constructor(private http: HttpClient) {
    this.initializeData();
    
    // Initialize market groups subject
    this.marketGroupsSubject.next(this.marketGroups);
    
    // Don't automatically select first hotel
    this.selectedHotel.next(null);
    this.selectedMenuItem.next(null);
    this.resetHotelData();  // Reset all data initially

    // Subscribe to hotel changes for dependent data
    this.selectedHotel$
      .pipe(
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id),  // Compare by ID
      )
      .subscribe((hotel: Hotel | null) => {  
        if (hotel && 'id' in hotel) {  
          // Load contracts first, then trigger other updates
          const contracts = this.getContractsForHotel(hotel.id);
          this.contractsMap.set(hotel.id, contracts);
          
          // Batch updates to prevent circular dependencies
          const updates = () => {
            this.updateHotelData(hotel);
            this.currentRooms.next(this.getRoomsForHotel(hotel.id));
            this.currentMarkets.next(this.getMarketsForHotel(hotel.id));
            this.currentSeasons.next(this.getSeasonsForHotel(hotel.id));
            this.currentContracts.next(contracts);
            this.updateRates(hotel.id);
            this.hotelMealPlans.next(hotel.mealPlans || []);
          };
          
          // Execute updates in next tick to prevent stack overflow  
          setTimeout(updates, 0);
        } else {
          this.resetHotelData();
        }
      });
  }

  private initializeData(): void {
    // Initialize markets data
    if (sampleData.marketGroups?.[0]) {
      // Store the market IDs
      this.marketsMap.set(1, this.markets.filter(m => 
        sampleData.marketGroups[0].markets.includes(m.id)
      ));
    }

    // Initialize data for each hotel
    this.hotels.forEach(hotel => {
      // Initialize rooms
      if (hotel.rooms) {
        this.roomsMap.set(hotel.id, hotel.rooms);
      }

      // Initialize contracts and their rates
      const hotelContracts = sampleData.contracts?.[hotel.id] || [];
      this.contractsMap.set(hotel.id, hotelContracts);
      hotelContracts.forEach(contract => {
        if (contract.rates) {
          this.rates.push(...contract.rates);
        }
      });

      // Initialize seasons
      if (sampleData.seasons?.[hotel.id]) {
        const seasons = sampleData.seasons[hotel.id].map(seasonData => {
          const defaultPeriod = {
            id: Math.random(),
            startDate: '',
            endDate: '',
            mlos: 0,
            description: seasonData.description,
            isBlackout: false
          };

          return {
            ...seasonData,
            periods: seasonData.periods || [defaultPeriod]
          };
        });
        this.seasonsMap.set(hotel.id, seasons);
      }

      // Initialize markets for hotel
      if (sampleData.marketGroups) {
        // Get all market IDs from market groups
        const marketIds = sampleData.marketGroups.flatMap(group => group.markets);
        // Convert IDs to actual Market objects and filter active ones
        const hotelMarkets = this.markets.filter(m => 
          marketIds.includes(m.id) && m.isActive
        );
        this.marketsMap.set(hotel.id, hotelMarkets);
      }

      // Initialize meal plans
      if (sampleData.mealPlans?.[hotel.id]) {
        const hotelMealPlans = sampleData.mealPlans[hotel.id];
        hotel.mealPlans = hotelMealPlans.map(plan => ({
          id: plan.id.toString(),
          type: plan.code as MealPlanType,
          name: plan.name,
          description: plan.description || '',
          includedMeals: this.getDefaultIncludedMeals(plan.code),
          defaultInclusions: [],
          restrictions: []
        }));
      }

      // Initialize hotel specific data
      if (sampleData.hotelData) {
        Object.entries(sampleData.hotelData)
          .filter(([key]) => key.startsWith(`${hotel.id}-`))
          .forEach(([key, value]) => {
            this.hotelDataMap.set(key, value);
          });
      }
    });

    this.updateCurrencyStatuses();
  }

  private updateHotelData(hotel: Hotel): void {
    try {
      console.log('Updating hotel data for hotel:', hotel);
      
      if (hotel) {
        // Update rooms
        const rooms = this.getRoomsForHotel(hotel.id);
        this.currentRooms.next(rooms);
        console.log(`Loaded ${rooms.length} rooms`);
        
        // Update markets from market groups
        const markets = this.getMarketsForHotel(hotel.id);
        this.currentMarkets.next(markets);
        console.log(`Loaded ${markets.length} markets`);
        
        // Update seasons
        const seasons = this.getSeasonsForHotel(hotel.id);
        this.currentSeasons.next(seasons);
        console.log(`Loaded ${seasons.length} seasons`);
        
        // Update contracts
        const contracts = this.getContractsForHotel(hotel.id);
        this.currentContracts.next(contracts);
        console.log(`Loaded ${contracts.length} contracts`);
        
        // Update rates
        const rates = this.getRatesForHotel(hotel.id);
        this.currentRates.next(rates);
        console.log(`Loaded ${rates.length} rates`);
        
        // Update meal plans
        const mealPlans = this.getMealPlansForHotel(hotel.id);
        this.hotelMealPlans.next(mealPlans);
        console.log(`Loaded ${mealPlans.length} meal plans`);

        // Update hotel description
        const description = sampleData.hotelData[`${hotel.id}-description`] || '';
        this.hotelDescription.next(description);
        console.log('Loaded hotel description');

        // Update hotel policies
        const policies: HotelPolicies = {
          cancellation: sampleData.hotelData[`${hotel.id}-cancellation`] || '',
          checkIn: 'From 14:00',
          checkOut: 'Until 11:00',
          childPolicy: 'Children of all ages welcome',
          petPolicy: 'No pets allowed',
          dressCode: 'Smart casual attire is required in all restaurants and public areas after 6:00 PM'
        };
        this.hotelPolicies.next(policies);
        console.log('Loaded hotel policies');

      } else {
        console.warn('No hotel provided to updateHotelData');
      }
    } catch (error) {
      console.error('Error updating hotel data:', error);
    }
  }

  private updateRates(hotelId: number): void {
    try {
      // Get contracts for this hotel
      const contracts = this.getContractsForHotel(hotelId);
      
      // Extract all rates from contracts
      const rates = contracts.flatMap(contract => contract.rates || []);
      console.log(`Found ${rates.length} rates for hotel ${hotelId}`);
      
      // Update the current rates
      this.currentRates.next(rates);
    } catch (error) {
      console.error('Error updating rates:', error);
      this.currentRates.next([]);
    }
  }

  // Getters pour les données supplémentaires
  getHotelDescription(): Observable<string> {
    return this.hotelDescription.asObservable();
  }

  getHotelCapacity(): Observable<HotelCapacity | null> {
    return this.hotelCapacity.asObservable();
  }

  getHotelMealPlans(): Observable<MealPlan[]> {
    return this.hotelMealPlans.asObservable();
  }

  getHotelPeriods(): Observable<Period[]> {
    return this.hotelPeriods.asObservable();
  }

  getHotelSpecialOffers(): Observable<SpecialOffer[]> {
    return this.hotelSpecialOffers.asObservable();
  }

  getHotelRoomInventory(): Observable<RoomInventory | null> {
    return this.hotelRoomInventory.asObservable();
  }

  // Generic method to set hotel data
  setHotelData<T extends HotelDataKey>(hotelId: number, key: T, data: HotelDataValue<T>): void {
    const mapKey = `${hotelId}-${key}`;
    this.hotelDataMap.set(mapKey, data);
    this.notifyDataUpdate(key, data);
  }

  // Reset all hotel data
  private resetHotelData(skipSelectedHotel: boolean = false) {
    if (!skipSelectedHotel) {
      this.selectedHotel.next(null);
    }
    this.selectedMenuItem.next(null);  // Reset menu item when no hotel is selected
    this.activeTab.next('general');
    // Reset all other BehaviorSubjects
    this.hotelDescription.next('');
    this.hotelRooms.next([]);
    this.hotelMeals.next([]);
    this.hotelPhotos.next([]);
    this.hotelPrices.next([]);
    this.hotelServices.next([]);
    this.hotelLocation.next(null);
  }

  // Private helper to notify data updates
  private notifyDataUpdate<T extends HotelDataKey>(key: T, data: HotelDataValue<T>): void {
    switch (key) {
      case 'hotel':
        this.selectedHotel.next(data as Hotel);
        break;
      case 'markets':
        this.currentMarkets.next(data as Market[]);
        break;
      case 'seasons':
        this.currentSeasons.next(data as Season[]);
        break;
      case 'roomTypes':
        this.currentRooms.next(data as RoomType[]);
        break;
      case 'contracts':
        this.currentContracts.next(data as Contract[]);
        break;
      case 'rates':
        this.currentRates.next(data as Rate[]);
        break;
      case 'mealPlans':
        this.hotelMealPlans.next(data as MealPlan[]);
        break;
      case 'description':
        this.hotelDescription.next(data as string);
        break;
      case 'policies':
        this.hotelPolicies.next(data as HotelPolicies);
        break;
      case 'capacity':
        this.hotelCapacity.next(data as HotelCapacity | null);
        break;
      case 'roomInventory':
        this.hotelRoomInventory.next(data as RoomInventory | null);
        break;
      case 'cancellation':
      case 'checkIn':
      case 'checkOut':
      case 'childPolicy':
      case 'petPolicy':
      case 'dressCode':
      case 'factSheet':
        // These are handled by their respective components
        break;
      case 'periods':
      case 'specialOffers':
      case 'rateConfigurations':
      case 'marketTemplates':
      case 'menuItems':
      case 'marketMealPlanRates':
      case 'ageCategories':
      case 'currencySettings':
      case 'marketGroups':
        // These are handled by their respective services/components
        break;
    }
  }

  // Méthodes d'accès aux données spécifiques à l'hôtel
  getMarketsForHotel(hotelId: number): Market[] {
    // Return markets from the marketsMap for this hotel
    return this.marketsMap.get(hotelId) || [];
  }

  private getSeasonsForHotel(hotelId: number): Season[] {
    // Get seasons from sample data
    const hotelSeasons = sampleData.seasons[hotelId] || [];
    
    // Cache seasons in the map
    this.seasonsMap.set(hotelId, hotelSeasons);
    
    return hotelSeasons;
  }

  private getRoomsForHotel(hotelId: number): RoomType[] {
    // First try to get from the map
    let rooms = this.roomsMap.get(hotelId) || [];
    
    // If no rooms in map, try to get from the hotel object
    if (rooms.length === 0) {
      const hotel = this.hotels.find(h => h.id === hotelId);
      if (hotel?.rooms) {
        rooms = hotel.rooms;
        // Update the map for future use
        this.roomsMap.set(hotelId, rooms);
      }
    }

    // Log available rooms for debugging
    console.log(`Available rooms for hotel ${hotelId}:`, 
      rooms.map(r => ({ id: r.id, type: r.type }))
    );
    
    return rooms;
  }

  private getMealPlanRatesForHotel(hotelId: number): MarketMealPlanRate[] {
    return this.marketMealPlanRates.get(hotelId) || [];
  }

  // Méthodes publiques modifiées pour utiliser les BehaviorSubjects
  setSelectedHotel(hotel: Hotel | null): void {
    this.selectedHotel.next(hotel);
  }

  setSelectedMenuItem(menuItem: MenuItemId): void {
    this.selectedMenuItem.next(menuItem);
  }

  setActiveTab(tab: string): void {
    this.activeTab.next(tab);
  }

  getHotels(): Hotel[] {
    return this.hotels;
  }

  addHotel(name: string): Hotel {
    const defaultAgeCategories: AgeCategory[] = [
      {
        id: 1,
        type: 'adult',
        label: 'Adult',
        minAge: 18,
        maxAge: 999,
        defaultRate: 100
      },
      {
        id: 2,
        type: 'child',
        label: 'Child',
        minAge: 2,
        maxAge: 17,
        defaultRate: 50
      },
      {
        id: 3,
        type: 'infant',
        label: 'Infant',
        minAge: 0,
        maxAge: 1,
        defaultRate: 0
      }
    ];

    const newId = Math.max(...this.hotels.map(h => h.id), 0) + 1;
    const newHotel: Hotel = {
      id: newId,
      name: name,
      address: '',
      city: '',
      country: '',
      rating: 0,
      description: '',
      ageCategories: defaultAgeCategories,
      rooms: [],
      amenities: [],
      checkInTime: '14:00',  // Default check-in time
      checkOutTime: '12:00', // Default check-out time
      policies: {
        cancellation: '',
        checkIn: '',
        checkOut: '',
        childPolicy: '',
        petPolicy: '',
        dressCode: ''
      },
      images: [],
      contactInfo: {
        phone: '',
        email: '',
        website: ''
      },
      features: {
        restaurants: [],
        spa: {
          name: '',
          treatments: [],
          openingHours: '',
          description: ''
        }
      }
    };
    
    this.hotels.push(newHotel);
    return newHotel;
  }

  getSelectedHotel(): Observable<Hotel | null> {
    return this.selectedHotel.asObservable();
  }

  getSelectedMenuItem(): Observable<MenuItemId | null> {
    return this.selectedMenuItem.asObservable();
  }

  getActiveTab(): Observable<string> {
    return this.activeTab.asObservable();
  }

  getMarkets(hotelId: number): Market[] {
    return this.getMarketsForHotel(hotelId);
  }

  private validateMarket(market: Partial<Market>, marketGroup: MarketGroup | undefined, existingMarkets: Market[]): string | null {
    if (!market.name?.trim()) {
      return 'Market name is required';
    }
    if (!market.currency?.trim()) {
      return 'Currency is required';
    }
    if (!market.region?.trim()) {
      return 'Region is required';
    }
    if (!marketGroup) {
      return 'Invalid region selected';
    }

    // Check for duplicate market names or codes in the same region
    const duplicateName = existingMarkets.find(
      m => m.name.toLowerCase() === market.name?.toLowerCase() && m.region === market.region
    );
    if (duplicateName) {
      return `Market with name "${market.name}" already exists in ${market.region}`;
    }

    const duplicateCode = existingMarkets.find(
      m => m.code.toLowerCase() === market.code?.toLowerCase() && m.region === market.region
    );
    if (duplicateCode) {
      return `Market with code "${market.code}" already exists in ${market.region}`;
    }

    return null;
  }

  addMarketToHotel(hotelId: number, marketData: Partial<Market>): { success: boolean; message: string; market?: Market } {
    const hotel = this.hotels.find(h => h.id === hotelId);
    if (!hotel) {
      return { success: false, message: 'Hotel not found' };
    }

    // Find the market group for this region
    const marketGroup = this.marketGroups.find(g => g.region === marketData.region);
    
    // Validate the market data
    const validationError = this.validateMarket(marketData, marketGroup, this.markets);
    if (validationError) {
      return { success: false, message: validationError };
    }

    // Create new market
    const newMarket: Market = {
      id: Math.max(0, ...this.markets.map(m => m.id)) + 1,
      name: marketData.name!,
      code: marketData.code!,
      currency: marketData.currency!,
      region: marketData.region!,
      description: marketData.description,
      isActive: true
    };

    // Add to markets array
    this.markets.push(newMarket);

    // Add to market group if it exists
    if (marketGroup) {
      marketGroup.markets.push(newMarket.id);
    } else {
      // Create new market group if none exists for this region
      this.addMarketGroup({
        name: `${marketData.region} Markets`,
        region: marketData.region!,
        markets: [newMarket.id],
        defaultCurrency: marketData.currency || 'USD', // Provide a default value
        description: `Market group for ${marketData.region}`,
        isActive: true
      });
    }

    // Update the markets map for this hotel
    const currentMarkets = this.marketsMap.get(hotelId) || [];
    currentMarkets.push(newMarket);
    this.marketsMap.set(hotelId, currentMarkets);

    // Notify subscribers
    this.currentMarkets.next(this.getMarketsForHotel(hotelId));
    this.marketGroupsSubject.next(this.marketGroups);

    return { success: true, message: 'Market added successfully', market: newMarket };
  }

  getMealPlans(hotelId: string): Observable<DataMealPlan[]> {
    const hotel = this.hotels.find(h => h.id.toString() === hotelId);
    if (!hotel || !hotel.mealPlans) {
      return of([]);
    }
    
    return of(hotel.mealPlans.map(plan => ({
      id: parseInt(plan.id),
      name: plan.name,
      code: plan.type,
      description: plan.description || ''
    })));
  }

  getSeasons(hotelId: number): Season[] {
    return this.getSeasonsForHotel(hotelId);
  }

  addSeason(hotelId: number, season: Omit<Season, 'id'>): Season {
    const seasons = this.getSeasonsForHotel(hotelId);
    const newSeason: Season = {
      ...season,
      id: seasons.length + 1
    };
    seasons.push(newSeason);
    this.seasonsMap.set(hotelId, seasons);
    return newSeason;
  }

  // Generic method to get hotel data
  getHotelData<T>(hotelId: number, key: HotelDataKey): Observable<T | null> {
    const value = this.hotelDataMap.get(`${hotelId}-${key}`) as T || null;
    return of(value);
  }

  // Generic method to save hotel data
  saveHotelData<T extends HotelDataKey>(hotelId: number, key: T, value: HotelDataValue<T>): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/hotels/${hotelId}/${key}`, value).pipe(
      tap(() => {
        this.notifyDataUpdate(key, value);
      })
    );
  }

  updateHotelFactSheet(hotelId: number, factSheet: string | undefined): Observable<void> {
    const hotel = this.getHotel(hotelId);
    if (!hotel) {
      return throwError(() => new Error('Hotel not found'));
    }
    return this.saveHotelData(hotelId, 'factSheet', factSheet ?? null);
  }

  addRoom(hotelId: number, room: Omit<RoomType, 'id'>): void {
    const rooms = this.getRoomsForHotel(hotelId);
    const newRoom: RoomType = { ...room, id: rooms.length + 1 };
    rooms.push(newRoom);
    this.roomsMap.set(hotelId, rooms);
  }

  updateRoom(hotelId: number, room: RoomType): void {
    const rooms = this.getRoomsForHotel(hotelId);
    const index = rooms.findIndex(r => r.id === room.id);
    if (index !== -1) {
      rooms[index] = room;
      this.roomsMap.set(hotelId, rooms);
    } else {
      throw new Error('Room not found');
    }
  }

  deleteRoom(hotelId: number, roomId: number): void {
    const rooms = this.getRoomsForHotel(hotelId);
    const filteredRooms = rooms.filter(r => r.id !== roomId);
    if (filteredRooms.length === rooms.length) {
      throw new Error('Room not found');
    }
    this.roomsMap.set(hotelId, filteredRooms);
  }

  deleteMealPlan(hotelId: string, planId: string): Observable<void> {
    const hotel = this.hotels.find(h => h.id.toString() === hotelId);
    if (!hotel) {
      return throwError(() => new Error('Hotel not found'));
    }
    
    return this.getHotelData<MealPlan[]>(Number(hotelId), 'mealPlans').pipe(
      map(mealPlans => mealPlans || []),
      switchMap(mealPlans => {
        const updatedMealPlans = mealPlans.filter(p => p.id !== planId);
        return this.saveHotelData(Number(hotelId), 'mealPlans', updatedMealPlans);
      })
    );
  }

  updateMealPlan(hotelId: string, updatedPlan: MealPlan): Observable<MealPlan> {
    const hotel = this.hotels.find(h => h.id.toString() === hotelId);
    if (!hotel) {
      return throwError(() => new Error('Hotel not found'));
    }
    
    return this.getHotelData<MealPlan[]>(Number(hotelId), 'mealPlans').pipe(
      map(mealPlans => mealPlans || []),
      switchMap(mealPlans => {
        const index = mealPlans.findIndex(p => p.id === updatedPlan.id);
        if (index === -1) {
          return throwError(() => new Error('Meal plan not found'));
        }
        mealPlans[index] = updatedPlan;
        return this.saveHotelData(Number(hotelId), 'mealPlans', mealPlans).pipe(
          map(() => updatedPlan)
        );
      })
    );
  }

  addMealPlan(hotelId: string, mealPlan: MealPlan): Observable<MealPlan> {
    const hotel = this.hotels.find(h => h.id.toString() === hotelId);
    if (!hotel) {
      return throwError(() => new Error('Hotel not found'));
    }
    
    return this.getHotelData<MealPlan[]>(Number(hotelId), 'mealPlans').pipe(
      map(mealPlans => mealPlans || []),
      switchMap(mealPlans => {
        mealPlans.push(mealPlan);
        return this.saveHotelData(Number(hotelId), 'mealPlans', mealPlans).pipe(
          map(() => mealPlan)
        );
      })
    );
  }

  deleteSeason(hotelId: number, seasonId: number): void {
    const seasons = this.getSeasonsForHotel(hotelId);
    this.seasonsMap.set(hotelId, seasons.filter(s => s.id !== seasonId));
  }

  updateSeason(hotelId: number, season: Season): void {
    const seasons = this.getSeasonsForHotel(hotelId);
    const index = seasons.findIndex(s => s.id === season.id);
    if (index >= 0) {
      seasons[index] = season;
      this.seasonsMap.set(hotelId, seasons);
    }
  }

  updateSeasons(hotelId: number, seasons: Season[]): void {
    this.seasonsMap.set(hotelId, seasons);
    this.currentSeasons.next(seasons);
  }

  getHotelPolicies(): Observable<HotelPolicies | null> {
    return this.hotelPolicies.asObservable();
  }

  // Private helper to get current policies value
  private getCurrentPolicies(hotelId: number): Observable<HotelPolicies> {
    return forkJoin({
      cancellation: this.getHotelData<string>(hotelId, 'cancellation'),
      checkIn: this.getHotelData<string>(hotelId, 'checkIn'),
      checkOut: this.getHotelData<string>(hotelId, 'checkOut'),
      childPolicy: this.getHotelData<string>(hotelId, 'childPolicy'),
      petPolicy: this.getHotelData<string>(hotelId, 'petPolicy'),
      dressCode: this.getHotelData<string>(hotelId, 'dressCode')
    }).pipe(
      map(policies => ({
        cancellation: policies.cancellation || '',
        checkIn: policies.checkIn || '',
        checkOut: policies.checkOut || '',
        childPolicy: policies.childPolicy || '',
        petPolicy: policies.petPolicy || '',
        dressCode: policies.dressCode || ''
      }))
    );
  }

  // Save hotel policies
  saveHotelPolicies(hotelId: number, policies: HotelPolicies): void {
    this.hotelDataMap.set(`${hotelId}-cancellation`, policies.cancellation);
    this.hotelDataMap.set(`${hotelId}-checkIn`, policies.checkIn);
    this.hotelDataMap.set(`${hotelId}-checkOut`, policies.checkOut);
    this.hotelDataMap.set(`${hotelId}-childPolicy`, policies.childPolicy);
    this.hotelDataMap.set(`${hotelId}-petPolicy`, policies.petPolicy);
    this.hotelDataMap.set(`${hotelId}-dressCode`, policies.dressCode);
    this.hotelPolicies.next(policies);
  }

  updateHotel(hotel: Hotel): Observable<Hotel> {
    const index = this.hotels.findIndex(h => h.id === hotel.id);
    if (index !== -1) {
      this.hotels[index] = hotel;
      this.selectedHotel.next(hotel);
      return of(hotel);
    }
    return throwError(() => new Error('Hotel not found'));
  }

  getMealPlanRatesForMarket(hotelId: number, marketId: number): Observable<MarketMealPlanRate[]> {
    const rates = this.marketMealPlanRates.get(hotelId)?.filter(rate => rate.marketId === marketId) || [];
    return of(rates);
  }

  updateMealPlanRatesForMarket(hotelId: number, rates: MarketMealPlanRate[]): Observable<MarketMealPlanRate[]> {
    const existingRates = this.marketMealPlanRates.get(hotelId) || [];
    const marketId = rates[0]?.marketId;
    
    if (!marketId) {
      return throwError(() => new Error('Invalid market ID'));
    }

    // Remove existing rates for this market
    const filteredRates = existingRates.filter(rate => rate.marketId !== marketId);
    
    // Add new rates
    this.marketMealPlanRates.set(hotelId, [...filteredRates, ...rates]);
    
    return of(rates);
  }

  getContracts(hotelId: number): Observable<Contract[]> {
    // Utiliser les données de sampleData.contracts
    const hotelContracts = sampleData.contracts[hotelId] || [];
    console.log('Loading contracts for hotel:', hotelId, hotelContracts);
    return of(hotelContracts);
  }

  addContract(hotelId: number, contract: Contract): Observable<Contract> {
    return this.getContracts(hotelId).pipe(
      tap(contracts => {
        contracts.push(contract);
        this.contractsMap.set(hotelId, contracts);
        // Update rates when contract is added
        if (contract.rates) {
          const updatedRates = [...this.currentRates.value, ...contract.rates];
          this.currentRates.next(updatedRates);
        }
      }),
      map(() => contract),
      catchError(() => throwError(() => new Error('Failed to add contract')))
    );
  }

  updateContract(contract: Contract): Observable<Contract> {
    return this.getContracts(1).pipe(
      map((contracts: Contract[]) => {
        const index = contracts.findIndex(c => c.id === contract.id);
        if (index === -1) {
          throw new Error('Contract not found');
        }
        contracts[index] = contract;
        this.contractsMap.set(1, contracts);
        
        // Update rates when contract is updated
        if (contract.rates) {
          const currentRates = this.currentRates.value;
          const updatedRates = currentRates.filter(r => 
            !contract.rates?.some(cr => cr.id === r.id)
          );
          updatedRates.push(...contract.rates);
          this.currentRates.next(updatedRates);
        }
        
        return contract;
      }),
      catchError(error => throwError(() => error))
    );
  }

  addMarketTemplate(hotelId: number, template: Omit<MarketTemplate, 'id'>): Observable<MarketTemplate> {
    try {
      const hotel = this.hotels.find(h => h.id === hotelId);
      if (!hotel) {
        return throwError(() => new Error('Hotel not found'));
      }

      // Generate a new ID for the template
      const newId = Math.max(...this.marketTemplates.map(t => t.id), 0) + 1;
      const newTemplate: MarketTemplate = {
        ...template,
        id: newId
      };

      // Add the new template to the collection
      this.marketTemplates.push(newTemplate);

      return of(newTemplate);
    } catch (error) {
      return throwError(() => new Error('Failed to add market template'));
    }
  }

  getMarketMealPlanRates(marketId: number): Observable<MarketMealPlanRate[]> {
    try {
      const rates = this.marketMealPlanRates.get(marketId) || [];
      return of(rates);
    } catch (error) {
      return throwError(() => new Error('Failed to get meal plan rates'));
    }
  }

  addMarketMealPlanRate(rate: MarketMealPlanRate): Observable<MarketMealPlanRate> {
    try {
      const rates = this.marketMealPlanRates.get(rate.marketId) || [];
      rates.push(rate);
      this.marketMealPlanRates.set(rate.marketId, rates);
      return of(rate);
    } catch (error) {
      return throwError(() => new Error('Failed to add meal plan rate'));
    }
  }

  updateHotelAgeCategories(hotelId: number, categories: AgeCategory[]): Observable<Hotel> {
    const hotel = this.hotels.find(h => h.id === hotelId);
    if (!hotel) {
      return throwError(() => new Error('Hotel not found'));
    }

    hotel.ageCategories = [...categories];
    
    // If this is the selected hotel, update the BehaviorSubject
    if (hotel.id === this.selectedHotel.value?.id) {
      this.selectedHotel.next({ ...hotel });
    }

    return of(hotel);
  }

  public async getRates(
    hotelId: number,
    filters?: {
      seasonId?: number;
      roomTypeId?: number;
      marketId?: number;
      currency?: string;
    }
  ): Promise<Rate[]> {
    try {
      // Get contracts for this hotel
      const contracts = this.getContractsForHotel(hotelId);
      
      // Extract all rates from contracts
      let rates = contracts.flatMap(contract => contract.rates || []);

      // Apply filters if provided
      if (filters) {
        rates = rates.filter(rate => {
          if (filters.seasonId && rate.seasonId !== filters.seasonId) {
            return false;
          }
          if (filters.roomTypeId && rate.roomTypeId !== filters.roomTypeId) {
            return false;
          }
          if (filters.marketId && rate.marketId !== filters.marketId) {
            return false;
          }
          if (filters.currency && rate.currency !== filters.currency) {
            return false;
          }
          return true;
        });
      }

      return rates;
    } catch (error) {
      console.error('Error getting rates:', error);
      throw error;
    }
  }

  private getRatesForHotel(hotelId: number, filters?: {
    seasonId?: number;
    roomTypeId?: number;
    marketId?: number;
    currency?: string;
  }): Rate[] {
    // Get rates from hotel contracts
    const hotelContracts = sampleData.contracts[hotelId] || [];
    let rates = hotelContracts.flatMap(contract => contract.rates || []);

    // Apply filters if provided
    if (filters) {
      rates = rates.filter(rate => {
        if (filters.seasonId && rate.seasonId !== filters.seasonId) {
          return false;
        }
        if (filters.roomTypeId && rate.roomTypeId !== filters.roomTypeId) {
          return false;
        }
        if (filters.marketId && rate.marketId !== filters.marketId) {
          return false;
        }
        if (filters.currency && rate.currency !== filters.currency) {
          return false;
        }
        return true;
      });
    }

    return rates;
  }

  async saveRates(rates: Rate[]): Promise<void> {
    if (!rates.length) {
      return Promise.resolve();
    }

    // Get hotelId from the first rate's contract
    const firstContract = this.getContractForRate(rates[0].contractId);
    if (!firstContract) {
      return Promise.reject(new Error('Could not find contract for first rate'));
    }
    const hotelId = firstContract.hotelId;

    const validRates: Rate[] = [];

    for (const rate of rates) {
      const contract = this.getContractForRate(rate.contractId);
      if (!contract) {
        console.warn(`Rate ${rate.id} references non-existent contract ${rate.contractId}`);
        continue;
      }

      // Set hotelId from contract if not already set
      rate.hotelId = contract.hotelId;

      if (this.validateRate(rate, contract)) {
        validRates.push(rate);
      }
    }

    if (validRates.length === 0) {
      return Promise.reject(new Error('No valid rates to save. All rates had validation errors.'));
    }

    // Update only valid rates
    this.rates = this.rates.filter(r => {
      const rateContract = this.getContractForRate(r.contractId);
      return rateContract?.hotelId !== hotelId || 
        validRates.some(vr => vr.id === r.id);
    });
    this.rates.push(...validRates);
    
    // Update the rates subject
    this.currentRates.next(validRates);
    
    return Promise.resolve();
  }

  async saveRate(rateData: Partial<Rate>): Promise<Rate> {
    try {
      const selectedHotel = this.selectedHotel.getValue();
      if (!selectedHotel) {
        throw new Error('No hotel selected');
      }

      // Validate room type
      const availableRooms = this.getRoomsForHotel(selectedHotel.id);
      const roomExists = availableRooms.some(room => room.id === rateData.roomTypeId);
      if (!roomExists) {
        const availableRoomNames = availableRooms.map(room => `${room.id} (${room.name})`).join(', ');
        throw new Error(
          `Invalid room type ID: ${rateData.roomTypeId}. ` +
          `Available room types are: ${availableRoomNames}`
        );
      }

      // For now, we'll simulate an API call
      const index = this.rates.findIndex(r => r.id === rateData.id);
      
      if (index === -1) {
        // Create new rate
        const newRate: Rate = {
          id: this.rates.length + 1,
          name: `Rate ${this.rates.length + 1}`,
          marketId: rateData.marketId!,
          seasonId: rateData.seasonId!,
          roomTypeId: rateData.roomTypeId!,
          contractId: rateData.contractId!,
          currency: rateData.currency!,
          amount: rateData.baseRate!, // Using baseRate as amount if not specified
          baseRate: rateData.baseRate!,
          extraAdult: rateData.extraAdult!,
          extraChild: rateData.extraChild!,
          singleOccupancy: rateData.singleOccupancy || null,
          supplements: {
            extraAdult: rateData.extraAdult!,
            extraChild: rateData.extraChild!,
            singleOccupancy: rateData.singleOccupancy || null
          },
          ageCategoryRates: rateData.ageCategoryRates || {},
          mealPlanId: rateData.mealPlanId,
          specialOffers: rateData.specialOffers || [],
          startDate: rateData.startDate,
          endDate: rateData.endDate,
          mlos: rateData.mlos,
          isBlackout: rateData.isBlackout,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.rates.push(newRate);
        return newRate;
      } else {
        // Update existing rate
        const updatedRate: Rate = {
          ...this.rates[index],
          ...rateData,
          singleOccupancy: rateData.singleOccupancy ?? null,
          updatedAt: new Date()
        };
        
        this.rates[index] = updatedRate;
        return updatedRate;
      }
    } catch (error) {
      console.error('Error saving rate:', error);
      throw error;
    }
  }

  async updateRate(rate: Rate): Promise<Rate> {
    try {
      const selectedHotel = this.selectedHotel.getValue();
      if (!selectedHotel) {
        throw new Error('No hotel selected');
      }

      // Validate room type
      const availableRooms = this.getRoomsForHotel(selectedHotel.id);
      const roomExists = availableRooms.some(room => room.id === rate.roomTypeId);
      if (!roomExists) {
        const availableRoomNames = availableRooms.map(room => `${room.id} (${room.name})`).join(', ');
        throw new Error(
          `Invalid room type ID: ${rate.roomTypeId}. ` +
          `Available room types are: ${availableRoomNames}`
        );
      }

      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find and update the rate in our local array
      const index = this.rates.findIndex(r => r.id === rate.id);
      if (index === -1) {
        throw new Error('Rate not found');
      }

      // Update the rate with new values
      this.rates[index] = {
        ...this.rates[index],
        ...rate,
        singleOccupancy: rate.singleOccupancy ?? null,
        updatedAt: new Date()
      };

      return this.rates[index];
    } catch (error) {
      console.error('Error updating rate:', error);
      throw error;
    }
  }

  getAllRates(): Observable<Rate[]> {
    // Use a default hotel ID or get it from a service
    return this.getContracts(1).pipe(
      map((contracts: Contract[]) => {
        const rates: Rate[] = contracts.flatMap(contract => 
          (contract.rates || []).map(rate => ({
            ...rate,
            contractId: contract.id  // Ensure contractId is set from parent contract
          }))
        );
        console.log('Extracted rates:', rates.length);
        return rates;
      })
    );
  }

  updateMarketGroups(groups: MarketGroup[]): void {
    this.marketGroups = [...groups];
    this.marketGroupsSubject.next(this.marketGroups);
    this.updateCurrencyStatuses();
  }

  getMarketGroups(): Observable<MarketGroup[]> {
    return this.marketGroupsSubject.asObservable();
  }

  getMarketGroup(id: number): MarketGroup | undefined {
    return this.marketGroups.find(group => group.id === id);
  }

  addMarketGroup(group: Omit<MarketGroup, 'id'>): MarketGroup {
    const newId = Math.max(...this.marketGroups.map(g => g.id), 0) + 1;
    const newGroup: MarketGroup = {
      ...group,
      id: newId,
      markets: []
    };
    this.marketGroups.push(newGroup);
    this.marketGroupsSubject.next(this.marketGroups);
    this.updateCurrencyStatuses();
    return newGroup;
  }

  updateMarketGroup(group: MarketGroup): MarketGroup {
    const index = this.marketGroups.findIndex(g => g.id === group.id);
    if (index === -1) {
      throw new Error(`Market group with id ${group.id} not found`);
    }
    // Preserve existing markets when updating
    const existingMarkets = this.marketGroups[index].markets;
    this.marketGroups[index] = { ...group, markets: existingMarkets };
    this.marketGroupsSubject.next(this.marketGroups);
    this.updateCurrencyStatuses();
    return this.marketGroups[index];
  }

  deleteMarketGroup(id: number): void {
    const index = this.marketGroups.findIndex(g => g.id === id);
    if (index === -1) {
      throw new Error(`Market group with id ${id} not found`);
    }
    if (this.marketGroups[index].markets.length > 0) {
      throw new Error('Cannot delete market group that contains markets');
    }
    this.marketGroups.splice(index, 1);
    this.marketGroupsSubject.next(this.marketGroups);
    this.updateCurrencyStatuses();
  }

  validateMarketGroup(group: Partial<MarketGroup>): string | null {
    if (!group.name?.trim()) {
      return 'Market group name is required';
    }

    if (!group.region?.trim()) {
      return 'Market group region is required';
    }

    // Check for duplicate region
    const duplicateGroup = this.marketGroups.find(
      g => g.region === group.region && g.id !== group.id
    );
    if (duplicateGroup) {
      return `A market group for region ${group.region} already exists`;
    }

    return null;
  }

  getHotel(id: number): Hotel | undefined {
    return this.hotels.find(hotel => hotel.id === id);
  }

  getRooms(hotelId: number): RoomType[] {
    return this.getRoomsForHotel(hotelId);
  }

  getCurrencySettings(): CurrencySetting[] {
    // Return all currency settings with active state set to false initially
    return this.currencySettings.map(cs => ({
      ...cs,
      active: false
    }));
  }

  updateCurrencySettings(settings: CurrencySetting[]): void {
    this.currencySettings = settings;
    this.updateCurrencyStatuses();
  }

  deleteMarket(marketId: number): void {
    // Remove market from all groups
    this.marketGroups = this.marketGroups.map(group => ({
      ...group,
      markets: group.markets.filter(id => id !== marketId)
    }));

    // Remove from markets array
    this.markets = this.markets.filter(m => m.id !== marketId);

    // Remove from all hotel market maps
    this.hotels.forEach(hotel => {
      const hotelMarkets = this.marketsMap.get(hotel.id);
      if (hotelMarkets) {
        this.marketsMap.set(
          hotel.id,
          hotelMarkets.filter(m => m.id !== marketId)
        );
      }
    });

    // Update subscribers
    this.marketGroupsSubject.next(this.marketGroups);
    this.currentMarkets.next(this.getMarketsForHotel(this.selectedHotel.value?.id || 0));
  }

  addMarket(market: Market): void {
    this.markets.push(market);
    this.updateCurrencyStatuses();
  }

  updateMarket(market: Market): void {
    const index = this.markets.findIndex(m => m.id === market.id);
    if (index !== -1) {
      this.markets[index] = market;
      this.updateCurrencyStatuses();
    }
  }

  toggleMarketStatus(marketId: number, isActive: boolean): void {
    // Update market status
    this.markets = this.markets.map(m =>
      m.id === marketId ? { ...m, isActive } : m
    );

    // Update currency statuses
    this.updateCurrencyStatuses();

    // Notify subscribers
    const currentHotelId = this.selectedHotel.value?.id || 0;
    this.currentMarkets.next(this.getMarketsForHotel(currentHotelId));
  }

  private updateCurrencyStatuses(): void {
    const usedCurrencies = new Set<string>();

    // Check currencies in market groups
    this.marketGroups.forEach(group => {
      // Get actual Market objects from market IDs
      const groupMarkets = this.markets.filter(m => group.markets.includes(m.id));
      if (groupMarkets.some(m => m.isActive)) {
        groupMarkets.forEach(market => {
          if (market.isActive) {
            usedCurrencies.add(market.currency);
          }
        });
      }
    });

    // Update currency settings
    this.currencySettings = this.currencySettings.map(setting => ({
      ...setting,
      isActive: usedCurrencies.has(setting.code)
    }));
  }

  private getMealPlansForHotel(hotelId: number): MealPlan[] {
    const mealPlanData = sampleData.mealPlans[hotelId] || [];
    return mealPlanData.map(plan => ({
      id: plan.id.toString(),
      type: plan.code as MealPlanType,
      name: plan.name,
      description: plan.description,
      includedMeals: this.getDefaultIncludedMeals(plan.code),
      defaultInclusions: [],
      restrictions: []
    }));
  }

  private getDefaultIncludedMeals(code: string): string[] {
    switch (code) {
      case 'BB': return ['breakfast'];
      case 'HB': return ['breakfast', 'dinner'];
      case 'FB': return ['breakfast', 'lunch', 'dinner'];
      case 'AI': return ['breakfast', 'lunch', 'dinner', 'snacks', 'drinks'];
      default: return [];
    }
  }

  private getContractsForHotel(hotelId: number): Contract[] {
    return sampleData.contracts[hotelId] || [];
  }

  private getContractForRate(contractId: number): Contract | undefined {
    // Search through all hotels' contracts to find the matching contract
    for (const [hotelId, contracts] of Object.entries(sampleData.contracts)) {
      const contract = contracts.find(c => c.id === contractId);
      if (contract) {
        return contract;
      }
    }
    return undefined;
  }

  validateRate(rate: Rate, contract: Contract): boolean {
    if (rate.contractId !== contract.id) {
      console.warn(`Rate ${rate.id} references contract ${rate.contractId} but was found in contract ${contract.id}`);
      return false;
    }

    const hotel = this.getHotel(contract.hotelId);
    if (!hotel) {
      console.warn(`Contract ${contract.id} references non-existent hotel ${contract.hotelId}`);
      return false;
    }

    // Validate room exists in hotel
    const validRoomIds = new Set(hotel.rooms?.map(r => r.id) || []);
    if (!validRoomIds.has(rate.roomTypeId)) {
      console.warn(`Rate ${rate.id} references non-existent room ${rate.roomTypeId} in hotel ${hotel.id}`);
      return false;
    }

    return true;
  }
}