import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Hotel, Market, Season, Contract, RateConfiguration, MarketTemplate, MenuItemId, MealPlan, HotelDataKey, MarketMealPlanRate, Currency, AgeCategory, CurrencySetting, MarketGroup, Rate, RoomType } from '../models/types';
import { sampleData, currencySettings } from '../../data';
import { HttpClient } from '@angular/common/http';

interface DataMealPlan {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface MealPlansData {
  [key: string]: DataMealPlan[];
}

interface DataMealPlan {
  id: number;
  name: string;
  code: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  // Données statiques
  private hotels: Hotel[] = sampleData.hotels as Hotel[];
  private markets: Market[] = (sampleData.markets || []) as Market[];
  private currencySettings: CurrencySetting[] = currencySettings;
  public marketGroups: MarketGroup[] = (sampleData.marketGroups || []) as MarketGroup[];

  // BehaviorSubjects pour les données dynamiques
  private selectedHotel = new BehaviorSubject<Hotel | null>(null);
  private selectedMenuItem = new BehaviorSubject<MenuItemId>('description');
  private activeTab = new BehaviorSubject<string>('general');
  private currentMarkets = new BehaviorSubject<Market[]>([]);
  private currentSeasons = new BehaviorSubject<Season[]>([]);
  private currentRooms = new BehaviorSubject<RoomType[]>([]);
  private currentContracts = new BehaviorSubject<Contract[]>([]);
  private currentRates = new BehaviorSubject<Rate[]>([]);
  private currentMealPlanRates = new BehaviorSubject<MarketMealPlanRate[]>([]);
  private marketsMap = new Map<number, Market[]>();
  private seasonsMap = new Map<number, Season[]>();
  private hotelDataMap = new Map<string, any>();
  private roomsMap = new Map<number, RoomType[]>();
  private marketMealPlanRates = new Map<number, MarketMealPlanRate[]>();
  private contractsMap = new Map<number, Contract[]>();
  private rates: Rate[] = [];
  private apiUrl = 'https://example.com/api'; // Replace with your API URL

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
    
    // S'abonner aux changements d'hôtel pour mettre à jour les données
    this.selectedHotel$.subscribe(hotel => {
      if (hotel) {
        this.updateHotelData(hotel.id);
      } else {
        this.resetHotelData();
      }
    });
  }

  private initializeData(): void {
    // Initialize markets data
    if (sampleData.marketGroups?.[0]?.markets) {
      this.marketsMap.set(1, sampleData.marketGroups[0].markets as Market[]);
    }

    // Initialize seasons data
    if (sampleData.seasons) {
      Object.entries(sampleData.seasons).forEach(([hotelId, seasons]) => {
        const updatedSeasons = (seasons as any[]).map(season => ({
          ...season,
          periods: season.periods || [{
            id: Math.random(),
            startDate: season.startDate,
            endDate: season.endDate,
            mlos: season.mlos,
            description: season.description,
            isBlackout: season.isBlackout
          }]
        }));
        this.seasonsMap.set(Number(hotelId), updatedSeasons as Season[]);
      });
    }

    // Initialize hotel data
    if (sampleData.hotelData) {
      Object.entries(sampleData.hotelData).forEach(([key, value]) => {
        this.hotelDataMap.set(key, value);
      });
    }

    // Initialize rooms data
    if (sampleData.rooms) {
      Object.entries(sampleData.rooms).forEach(([hotelId, rooms]) => {
        this.roomsMap.set(Number(hotelId), rooms as RoomType[]);
      });
    }

    // Initialize contracts and rates
    if (sampleData.contracts) {
      Object.entries(sampleData.contracts).forEach(([hotelId, contracts]) => {
        const typedContracts = contracts as Contract[];
        this.contractsMap.set(Number(hotelId), typedContracts);
        typedContracts.forEach(contract => {
          if (contract.rates) {
            this.rates.push(...contract.rates);
          }
        });
      });
    }

    this.updateCurrencyStatuses();
  }

  private updateHotelData(hotelId: number): void {
    // Mettre à jour les marchés
    const markets = this.getMarketsForHotel(hotelId);
    this.currentMarkets.next(markets);

    // Mettre à jour les saisons
    const seasons = this.getSeasonsForHotel(hotelId);
    this.currentSeasons.next(seasons);

    // Mettre à jour les chambres
    const rooms = this.getRoomsForHotel(hotelId);
    this.currentRooms.next(rooms);

    // Mettre à jour les contrats
    const contracts = this.getContractsForHotel(hotelId);
    this.currentContracts.next(contracts);

    // Mettre à jour les tarifs
    const rates = this.getRatesForHotel(hotelId);
    this.currentRates.next(rates);

    // Mettre à jour les tarifs des formules repas
    const mealPlanRates = this.getMealPlanRatesForHotel(hotelId);
    this.currentMealPlanRates.next(mealPlanRates);

    // Mettre à jour le statut des devises
    this.updateCurrencyStatuses();
  }

  private resetHotelData(): void {
    this.currentMarkets.next([]);
    this.currentSeasons.next([]);
    this.currentRooms.next([]);
    this.currentContracts.next([]);
    this.currentRates.next([]);
    this.currentMealPlanRates.next([]);
  }

  // Méthodes d'accès aux données spécifiques à l'hôtel
  private getMarketsForHotel(hotelId: number): Market[] {
    return this.marketsMap.get(hotelId) || [];
  }

  private getSeasonsForHotel(hotelId: number): Season[] {
    return this.seasonsMap.get(hotelId) || [];
  }

  private getRoomsForHotel(hotelId: number): RoomType[] {
    return this.roomsMap.get(hotelId) || [];
  }

  private getContractsForHotel(hotelId: number): Contract[] {
    return this.contractsMap.get(hotelId) || [];
  }

  private getRatesForHotel(hotelId: number): Rate[] {
    // Get contracts for this hotel
    const hotelContracts = this.getContractsForHotel(hotelId);
    // Filter out any contracts without IDs and get the IDs
    const contractIds = hotelContracts
      .filter((contract): contract is Contract & { id: number } => contract.id !== undefined)
      .map(contract => contract.id);
    
    // Filter rates that belong to any of the hotel's contracts
    return this.rates.filter(rate => rate.contractId !== undefined && contractIds.includes(rate.contractId));
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

  getSelectedMenuItem(): Observable<MenuItemId> {
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
    const markets = this.getMarketsForHotel(hotelId);
    
    // Simple validation - just check name and currency
    if (!marketData.name?.trim()) {
      return { success: false, message: 'Market name is required' };
    }
    if (!marketData.currency?.trim()) {
      return { success: false, message: 'Currency is required' };
    }

    // Create new market with minimal required fields
    const newMarket: Market = {
      id: Math.max(0, ...markets.map(m => m.id)) + 1,
      name: marketData.name,
      code: marketData.name.substring(0, 2).toUpperCase(),  // Simple code generation
      currency: marketData.currency,
      region: marketData.region || 'Other',  // Default region if not specified
      isActive: true,
      description: marketData.description || ''
    };

    // Add market to marketsMap
    markets.push(newMarket);
    this.marketsMap.set(hotelId, markets);

    // Add market to market group if region specified
    if (marketData.region) {
      const marketGroup = this.marketGroups.find(g => g.code === marketData.region);
      if (marketGroup) {
        if (!marketGroup.markets) {
          marketGroup.markets = [];
        }
        marketGroup.markets.push(newMarket);
      }
    }

    this.updateCurrencyStatuses();

    return { success: true, message: 'Market created successfully', market: newMarket };
  }

  getMealPlans(hotelId: string): Observable<DataMealPlan[]> {
    const mealPlansData = sampleData.mealPlans as MealPlansData;
    return of(mealPlansData[hotelId] || []);
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

  getHotelData<T>(hotelId: number, key: HotelDataKey): Observable<T | null> {
    const data = this.hotelDataMap.get(`${hotelId}-${key}`);
    return of(data || null);
  }

  saveHotelData(hotelId: number, key: HotelDataKey, value: string | null): Observable<void> {
    try {
      this.hotelDataMap.set(`${hotelId}-${key}`, value);
      return of(void 0);
    } catch (error) {
      return throwError(() => error);
    }
  }

  updateHotelFactSheet(hotelId: number, factSheet: string | undefined): Observable<void> {
    try {
      const hotel = this.hotels.find(h => h.id === hotelId);
      if (!hotel) {
        throw new Error('Hotel not found');
      }
      hotel.factSheet = factSheet;
      return this.saveHotelData(hotelId, 'factSheet', factSheet ?? null);
    } catch (error) {
      return throwError(() => error);
    }
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
    if (hotel && hotel.mealPlans) {
      hotel.mealPlans = hotel.mealPlans.filter(p => p.id !== planId);
      this.selectedHotel.next(hotel);
    }
    return of(void 0);
  }

  updateMealPlan(hotelId: string, updatedPlan: MealPlan): Observable<MealPlan> {
    const hotel = this.hotels.find(h => h.id.toString() === hotelId);
    if (hotel && hotel.mealPlans) {
      const index = hotel.mealPlans.findIndex(p => p.id === updatedPlan.id);
      if (index !== -1) {
        hotel.mealPlans[index] = updatedPlan;
        this.selectedHotel.next(hotel);
        return of(updatedPlan);
      }
    }
    return throwError(() => new Error('Meal plan not found'));
  }

  addMealPlan(hotelId: string, mealPlan: MealPlan): Observable<MealPlan> {
    const hotel = this.hotels.find(h => h.id.toString() === hotelId);
    if (hotel) {
      if (!hotel.mealPlans) {
        hotel.mealPlans = [];
      }
      hotel.mealPlans.push(mealPlan);
      this.selectedHotel.next(hotel);
      return of(mealPlan);
    }
    return throwError(() => new Error('Hotel not found'));
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

  getHotelPolicies(hotelId: number): {cancellation: string, checkInOut: string} {
    return {
      cancellation: this.hotelDataMap.get(`${hotelId}-cancellation`) || '',
      checkInOut: this.hotelDataMap.get(`${hotelId}-checkInOut`) || ''
    };
  }

  saveHotelPolicies(hotelId: number, policies: {cancellation: string, checkInOut: string}): void {
    this.hotelDataMap.set(`${hotelId}-cancellation`, policies.cancellation);
    this.hotelDataMap.set(`${hotelId}-checkInOut`, policies.checkInOut);
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
    const contracts = this.contractsMap.get(hotelId) || [];
    return of(contracts.map(contract => ({
      ...contract,
      rates: contract.rates?.map(r => ({
        id: r.id,
        marketId: r.marketId,
        seasonId: r.seasonId,
        roomTypeId: r.roomTypeId,
        baseRate: r.baseRate,
        extraAdult: r.extraAdult,
        extraChild: r.extraChild,
        singleOccupancy: r.singleOccupancy,
        currency: r.currency,
        startDate: r.startDate,
        endDate: r.endDate,
        mlos: r.mlos,
        isBlackout: r.isBlackout,
        isActive: r.isActive,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }))
    })));
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
      map(contracts => {
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

  addMarketTemplate(hotelId: number, template: MarketTemplate): Observable<MarketTemplate> {
    try {
      const hotel = this.hotels.find(h => h.id === hotelId);
      if (!hotel) {
        return throwError(() => new Error('Hotel not found'));
      }
      
      const markets = this.getMarketsForHotel(hotelId);
      // Add template logic here
      return of(template);
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

  setHotelData<T>(hotelId: number, key: HotelDataKey, data: T): Observable<T> {
    try {
      this.hotelDataMap.set(`${hotelId}-${key}`, data);
      return of(data);
    } catch (error) {
      return throwError(() => new Error('Failed to set hotel data'));
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
      // If we're in development mode, return mock data
      if (!this.apiUrl.startsWith('http')) {
        return this.getMockRates(hotelId, filters);
      }

      // Call the real API
      const response = await this.http.get<Rate[]>(
        `${this.apiUrl}/hotels/${hotelId}/rates`,
        { params: filters as any }
      ).toPromise();
      
      return response || [];
    } catch (error) {
      console.error('Error getting rates:', error);
      throw error;
    }
  }

  public async saveRates(rates: Rate[]): Promise<void> {
    try {
      // Group rates by market for better organization
      const ratesByMarket = rates.reduce((acc, rate) => {
        if (!acc[rate.marketId]) {
          acc[rate.marketId] = [];
        }
        acc[rate.marketId].push(rate);
        return acc;
      }, {} as { [key: number]: Rate[] });

      // Save rates for each market
      const savePromises = Object.values(ratesByMarket).map(marketRates => 
        this.http.post<void>(`${this.apiUrl}/rates/bulk`, marketRates).toPromise()
      );

      await Promise.all(savePromises);
      
      // Update local rates cache
      this.rates = [...this.rates, ...rates];
    } catch (error) {
      console.error('Error saving rates:', error);
      throw error;
    }
  }

  private getMockRates(
    hotelId: number,
    filters?: {
      seasonId?: number;
      roomTypeId?: number;
      marketId?: number;
      currency?: string;
    }
  ): Rate[] {
    let filteredRates = this.rates;

    if (filters) {
      filteredRates = filteredRates.filter(rate => {
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

    return filteredRates;
  }

  async saveRate(rateData: Partial<Rate>): Promise<Rate> {
    try {
      // For now, we'll simulate an API call
      const index = this.rates.findIndex(r => r.id === rateData.id);
      
      if (index === -1) {
        // Create new rate
        const newRate: Rate = {
          id: this.rates.length + 1,
          marketId: rateData.marketId!,
          seasonId: rateData.seasonId!,
          roomTypeId: rateData.roomTypeId!,
          baseRate: rateData.baseRate!,
          extraAdult: rateData.extraAdult!,
          extraChild: rateData.extraChild!,
          singleOccupancy: rateData.singleOccupancy || null,
          currency: rateData.currency!,
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
      throw new Error('Failed to update rate');
    }
  }

  getAllRates(): Observable<Rate[]> {
    // Use a default hotel ID or get it from a service
    return this.getContracts(1).pipe(
      map(contracts => contracts.flatMap(contract => 
        (contract.rates || []).map(r => ({
          id: r.id,
          marketId: r.marketId,
          seasonId: r.seasonId,
          roomTypeId: r.roomTypeId,
          baseRate: r.baseRate,
          extraAdult: r.extraAdult,
          extraChild: r.extraChild,
          singleOccupancy: r.singleOccupancy,
          currency: r.currency,
          startDate: r.startDate,
          endDate: r.endDate,
          mlos: r.mlos,
          isBlackout: r.isBlackout,
          isActive: r.isActive,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        }))
      ))
    );
  }

  updateMarketGroups(groups: MarketGroup[]): void {
    this.marketGroups = [...groups];
    this.updateCurrencyStatuses();
  }

  getMarketGroups(): MarketGroup[] {
    return this.marketGroups;
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
    this.updateCurrencyStatuses();
  }

  validateMarketGroup(group: Partial<MarketGroup>): string | null {
    if (!group.name?.trim()) {
      return 'Region name is required';
    }
    if (!group.code?.trim()) {
      return 'Region code is required';
    }
    const existingGroup = this.marketGroups.find(g => 
      g.code === group.code && g.id !== group.id
    );
    if (existingGroup) {
      return 'Region code must be unique';
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
    return this.currencySettings;
  }

  updateCurrencySettings(settings: CurrencySetting[]): void {
    this.currencySettings = settings;
    this.updateCurrencyStatuses();
  }

  deleteMarket(marketId: number): void {
    // Supprimer le marché
    this.markets = this.markets.filter(m => m.id !== marketId);
    
    // Mettre à jour les groupes de marchés
    this.marketGroups = this.marketGroups.map(group => ({
      ...group,
      markets: group.markets.filter(m => m.id !== marketId)
    }));

    this.updateCurrencyStatuses();
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
    // Mettre à jour dans la liste des marchés
    const marketIndex = this.markets.findIndex(m => m.id === marketId);
    if (marketIndex !== -1) {
      this.markets[marketIndex].isActive = isActive;
    }

    // Mettre à jour dans les groupes de marchés
    this.marketGroups = this.marketGroups.map(group => ({
      ...group,
      markets: group.markets.map(m => 
        m.id === marketId ? { ...m, isActive } : m
      )
    }));

    this.updateCurrencyStatuses();
  }

  private updateCurrencyStatuses(): void {
    // Créer un Set des devises utilisées dans les marchés
    const usedCurrencies = new Set<string>();
    
    // Collecter toutes les devises des marchés
    this.markets.forEach(market => {
      if (market.isActive) {
        usedCurrencies.add(market.currency);
      }
    });

    // Collecter les devises des groupes de marchés
    this.marketGroups.forEach(group => {
      if (group.markets.some(m => m.isActive)) {
        usedCurrencies.add(group.defaultCurrency);
      }
      group.markets.forEach(market => {
        if (market.isActive) {
          usedCurrencies.add(market.currency);
        }
      });
    });

    // Mettre à jour le statut des devises
    this.currencySettings = this.currencySettings.map(currency => ({
      ...currency,
      isActive: usedCurrencies.has(currency.code)
    }));
  }
}