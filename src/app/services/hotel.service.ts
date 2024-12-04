import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Hotel, Market, Season, Contract, RateConfiguration, MarketTemplate, MenuItemId, MealPlan, HotelDataKey, MarketMealPlanRate, AgeCategory, CurrencySetting, MarketGroup, Rate, RoomType, HotelPolicies, Period, SpecialOffer, MealPlanType, HotelCapacity, RoomInventory, MenuItem } from '../models/types';
import { sampleData, currencySettings } from '../../data';
import { HttpClient } from '@angular/common/http';
import { RoomConfigurationService } from './room-configuration.service';
import { CurrencyService } from './currency.service';

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
  private apiUrl = 'https://example.com/api'; // Replace with your API URL
  private marketGroupsSubject = new BehaviorSubject<MarketGroup[]>([]);
  private marketTemplates: MarketTemplate[] = [];
  private currencySettingsSubject = new BehaviorSubject<CurrencySetting[]>([]);
  private ageCategories = new BehaviorSubject<AgeCategory[]>([]);

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

  constructor(
    private http: HttpClient,
    private roomConfigService: RoomConfigurationService,
    private currencyService: CurrencyService
  ) {
    this.loadInitialData();
    
    // Initialize market groups subject
    this.marketGroupsSubject.next(this.marketGroups);
    
    // Initialize currency settings subject
    this.currencySettingsSubject.next(this.currencyService.getCurrentCurrencySettings());

    // Initialize age categories
    this.ageCategories.next([]);

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
            this.roomConfigService.getRooms(hotel.id).subscribe(rooms => {
              this.currentRooms.next(rooms);
            });
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

  private loadInitialData(): void {
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
      console.log('Updating hotel data for:', hotel.name);

      // Update selected hotel
      this.selectedHotel.next(hotel);
      console.log('Selected hotel updated');

      // Update rooms
      const rooms = hotel.rooms || [];
      this.currentRooms.next(rooms);
      console.log(`Loaded ${rooms.length} rooms`);

      // Update meal plans
      const mealPlans = hotel.mealPlans || [];
      this.hotelMealPlans.next(mealPlans);
      console.log(`Loaded ${mealPlans.length} meal plans`);

      // Update hotel description from hotel object
      this.hotelDescription.next(hotel.description || '');
      console.log('Loaded hotel description:', hotel.description);

      // Update hotel policies using actual hotel policies
      if (hotel.policies) {
        this.hotelPolicies.next(hotel.policies);
        console.log('Loaded hotel policies:', hotel.policies);
      } else {
        // Fallback to empty policies if none exist
        const emptyPolicies: HotelPolicies = {
          cancellation: '',
          checkIn: '',
          checkOut: '',
          childPolicy: '',
          petPolicy: '',
          dressCode: ''
        };
        this.hotelPolicies.next(emptyPolicies);
        console.warn('No policies found for hotel, using empty policies');
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
      const rates = this.getRatesFromContracts(hotelId);
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

  // Delegate room operations to RoomConfigurationService
  private getRoomsForHotel(hotelId: number): RoomType[] {
    let rooms: RoomType[] = [];
    this.roomConfigService.getRooms(hotelId).subscribe(r => rooms = r);
    return rooms;
  }

  getRooms(hotelId: number): RoomType[] {
    return this.getRoomsForHotel(hotelId);
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
        name: 'Adult',
        label: 'Adult',
        minAge: 18,
        maxAge: 999,
        defaultRate: 100,
        isActive: true
      },
      {
        id: 2,
        type: 'child',
        name: 'Child',
        label: 'Child',
        minAge: 2,
        maxAge: 17,
        defaultRate: 50,
        isActive: true
      },
      {
        id: 3,
        type: 'infant',
        name: 'Infant',
        label: 'Infant',
        minAge: 0,
        maxAge: 1,
        defaultRate: 0,
        isActive: true
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
    // For description, use the selectedHotel observable
    if (key === 'description') {
      return this.selectedHotel.pipe(
        map(hotel => (hotel?.description || null) as T),
        catchError(error => {
          console.error(`Error getting hotel ${key}:`, error);
          return of(null);
        })
      );
    }

    // For other data types, use existing logic
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

  // Delegate room operations to RoomConfigurationService
  addRoom(hotelId: number, room: Omit<RoomType, 'id'>): void {
    this.roomConfigService.addRoom(hotelId, room);
  }

  updateRoom(hotelId: number, room: RoomType): void {
    this.roomConfigService.updateRoom(hotelId, room);
  }

  deleteRoom(hotelId: number, roomId: number): void {
    this.roomConfigService.deleteRoom(hotelId, roomId);
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
    return this.hotelPolicies.asObservable().pipe(
      catchError(error => {
        console.error('Error getting hotel policies:', error);
        return of(null);
      })
    );
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

  getContractsForHotelAsObservable(hotelId: number): Observable<Contract[]> {
    return of(this.getContractsForHotel(hotelId));
  }

  addContract(hotelId: number, contract: Contract): Observable<Contract> {
    return this.getContractsForHotelAsObservable(hotelId).pipe(
      tap((contracts: Contract[]) => {
        // Ensure contract has a unique ID
        contract.id = Math.max(0, ...contracts.map(c => c.id)) + 1;
        
        // Initialize rates array if undefined
        if (!contract.rates) {
          contract.rates = [];
        }

        // Add contract to both contractsMap and sampleData
        contracts.push(contract);
        this.contractsMap.set(hotelId, contracts);
        
        // Ensure hotel exists in sampleData.contracts
        if (!sampleData.contracts[hotelId]) {
          sampleData.contracts[hotelId] = [];
        }
        sampleData.contracts[hotelId].push(contract);

        // Update rates when contract is added
        const updatedRates = this.getRatesFromContracts(hotelId);
        this.currentRates.next(updatedRates);
        
        console.log('Contract added successfully:', {
          hotelId,
          contractId: contract.id,
          ratesCount: contract.rates.length
        });
      }),
      map(() => contract),
      catchError(error => {
        console.error('Failed to add contract:', error);
        return throwError(() => new Error('Failed to add contract'));
      })
    );
  }

  updateContract(hotelId: number, contract: Contract): Observable<Contract> {
    return this.getContractsForHotelAsObservable(hotelId).pipe(
      map((contracts: Contract[]) => {
        const index = contracts.findIndex(c => c.id === contract.id);
        if (index === -1) {
          throw new Error(`Contract ${contract.id} not found`);
        }

        // Update contract in both contractsMap and sampleData
        contracts[index] = contract;
        this.contractsMap.set(hotelId, contracts);
        
        const sampleDataIndex = sampleData.contracts[hotelId]?.findIndex(c => c.id === contract.id);
        if (sampleDataIndex !== undefined && sampleDataIndex !== -1) {
          sampleData.contracts[hotelId][sampleDataIndex] = contract;
        }

        // Update rates
        const updatedRates = this.getRatesFromContracts(hotelId);
        this.currentRates.next(updatedRates);
        
        console.log('Contract updated successfully:', {
          hotelId,
          contractId: contract.id,
          ratesCount: contract.rates?.length ?? 0
        });
        
        return contract;
      }),
      catchError(error => {
        console.error('Failed to update contract:', error);
        return throwError(() => new Error('Failed to update contract'));
      })
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
      let rates = this.getRatesFromContracts(hotelId);

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

  private getRatesFromContracts(hotelId: number): Rate[] {
    const hotelContracts = sampleData.contracts[hotelId] || [];
    return hotelContracts.flatMap(contract => 
      (contract.rates || []).map(rate => ({
        ...rate,
        contractId: contract.id
      }))
    );
  }

  async updateRate(rate: Rate): Promise<Rate> {
    try {
      // Get the contract for this rate
      const contract = this.getContractForRate(rate.contractId);
      if (!contract) {
        throw new Error(`Contract not found for rate ${rate.id}`);
      }

      // Validate the rate against contract
      if (!this.validateRate(rate, contract)) {
        throw new Error('Rate validation failed');
      }

      // Update rate in the contract
      const rateIndex = contract.rates?.findIndex(r => r.id === rate.id);
      if (rateIndex === undefined || rateIndex === -1 || !contract.rates) {
        throw new Error(`Rate ${rate.id} not found in contract ${contract.id}`);
      }

      // Update the rate
      contract.rates[rateIndex] = {
        ...contract.rates[rateIndex],
        ...rate,
        singleOccupancy: rate.singleOccupancy ?? null,
        updatedAt: new Date()
      };

      // Update contract in sampleData
      const hotelContracts = sampleData.contracts[contract.hotelId] || [];
      const contractIndex = hotelContracts.findIndex(c => c.id === contract.id);
      if (contractIndex !== -1) {
        hotelContracts[contractIndex] = contract;
        sampleData.contracts[contract.hotelId] = hotelContracts;
      }

      // Update currentRates BehaviorSubject with all rates from contracts
      const allRates = this.getRatesFromContracts(contract.hotelId);
      this.currentRates.next(allRates);

      console.log('Rate updated successfully:', {
        rateId: rate.id,
        contractId: contract.id,
        hotelId: contract.hotelId
      });

      return contract.rates[rateIndex];
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

  getCurrencySettings(): Observable<CurrencySetting[]> {
    return this.currencySettingsSubject.asObservable();
  }

  getCurrentCurrencySettings(): CurrencySetting[] {
    return this.currencyService.getCurrentCurrencySettings();
  }

  deleteCurrency(currency: CurrencySetting): void {
    this.currencyService.deleteCurrency(currency);
    // Update the subject with new currency settings
    this.currencySettingsSubject.next(this.currencyService.getCurrentCurrencySettings());
  }

  updateCurrencySettings(settings: CurrencySetting[]): void {
    // This method should no longer be used directly
    console.warn('Deprecated: Use CurrencyService methods instead');
    // Still update the subject for backwards compatibility
    this.currencySettingsSubject.next(settings);
  }

  private updateCurrencyStatuses(): void {
    // Get active markets
    const activeMarkets = this.markets.filter(market => market.isActive);
    
    // Update currency statuses in CurrencyService
    this.currencyService.updateCurrencyStatuses(activeMarkets);
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

  // Get special offers for a specific hotel
  getSpecialOffersForHotel(hotelId: number): SpecialOffer[] {
    const hotel = this.hotels.find(h => h.id === hotelId);
    return hotel?.specialOffers || [];
  }

  // Update special offers for a specific hotel
  updateSpecialOffersForHotel(hotelId: number, offers: SpecialOffer[]): void {
    const hotelIndex = this.hotels.findIndex(h => h.id === hotelId);
    if (hotelIndex !== -1) {
      this.hotels[hotelIndex] = {
        ...this.hotels[hotelIndex],
        specialOffers: offers
      };
      // Update the selected hotel if it's the current one
      if (this.selectedHotel.value?.id === hotelId) {
        this.selectedHotel.next(this.hotels[hotelIndex]);
      }
    }
  }

  addMarket(market: Market): void {
    // Add to markets array
    this.markets.push(market);
    
    // Update currency statuses since market list changed
    this.updateCurrencyStatuses();
    
    // Notify subscribers
    this.currentMarkets.next(this.getMarketsForHotel(this.selectedHotel.value?.id || 0));
  }

  updateMarket(market: Market): void {
    const index = this.markets.findIndex(m => m.id === market.id);
    if (index !== -1) {
      // Update market
      this.markets[index] = market;
      
      // Update currency statuses since market may have changed currency
      this.updateCurrencyStatuses();
      
      // Notify subscribers
      this.currentMarkets.next(this.getMarketsForHotel(this.selectedHotel.value?.id || 0));
    }
  }

  deleteMarket(marketId: number): void {
    // Remove market from all groups
    this.marketGroups = this.marketGroups.map(group => ({
      ...group,
      markets: group.markets.filter(id => id !== marketId)
    }));

    // Remove from markets array
    this.markets = this.markets.filter(m => m.id !== marketId);

    // Update subscribers
    this.marketGroupsSubject.next(this.marketGroups);
    this.currentMarkets.next(this.getMarketsForHotel(this.selectedHotel.value?.id || 0));

    // Update currency statuses since market list changed
    this.updateCurrencyStatuses();
  }

  toggleMarketStatus(marketId: number, isActive: boolean): void {
    // Update market status
    this.markets = this.markets.map(m =>
      m.id === marketId ? { ...m, isActive } : m
    );

    // Update currency statuses since market status changed
    this.updateCurrencyStatuses();

    // Notify subscribers
    const currentHotelId = this.selectedHotel.value?.id || 0;
    this.currentMarkets.next(this.getMarketsForHotel(currentHotelId));
  }

  // Age Category Management
  getAgeCategories(): Observable<AgeCategory[]> {
    return this.ageCategories.asObservable();
  }

  getCurrentAgeCategories(): AgeCategory[] {
    return this.ageCategories.getValue();
  }

  addAgeCategory(category: AgeCategory): void {
    const currentCategories = this.getCurrentAgeCategories();
    this.ageCategories.next([...currentCategories, category]);
  }

  updateAgeCategory(updatedCategory: AgeCategory): void {
    const currentCategories = this.getCurrentAgeCategories();
    const index = currentCategories.findIndex(c => c.id === updatedCategory.id);
    if (index !== -1) {
      currentCategories[index] = updatedCategory;
      this.ageCategories.next([...currentCategories]);
    }
  }

  deleteAgeCategory(categoryId: number): void {
    const currentCategories = this.getCurrentAgeCategories();
    this.ageCategories.next(currentCategories.filter(c => c.id !== categoryId));
  }

  validateAgeCategory(category: Partial<AgeCategory>, existingCategories: AgeCategory[] = []): string | null {
    if (!category.name?.trim()) {
      return 'Name is required';
    }

    if (category.minAge === undefined || category.maxAge === undefined) {
      return 'Both minimum and maximum ages are required';
    }

    if (category.minAge < 0) {
      return 'Minimum age cannot be negative';
    }

    if (category.maxAge < category.minAge) {
      return 'Maximum age must be greater than or equal to minimum age';
    }

    const otherCategories = existingCategories.filter(c => c.id !== category.id);
    for (const existing of otherCategories) {
      if (
        (category.minAge >= existing.minAge && category.minAge <= existing.maxAge) ||
        (category.maxAge >= existing.minAge && category.maxAge <= existing.maxAge) ||
        (category.minAge <= existing.minAge && category.maxAge >= existing.maxAge)
      ) {
        return 'Age ranges cannot overlap with existing categories';
      }
    }

    return null;
  }
}