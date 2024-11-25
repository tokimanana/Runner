import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Hotel, Market, Season, Contract, RateConfiguration, MarketTemplate, MenuItemId, MealPlan, HotelDataKey, MarketMealPlanRate, Currency, AgeCategory, CurrencySetting, MarketGroup } from '../models/types';
interface RoomType {
  id: number;
  type: string;
  description: string;
  location: string;
  maxOccupancy: {
    adults: number;
    children: number;
    infants: number;
  };
  amenities: string[];
}

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  // Hotel data
  private hotels: Hotel[] = [
    { 
      id: 1, 
      name: 'Le Meridien Ile Maurice',
      ageCategories: [
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
          type: 'teen',
          label: 'Teen',
          minAge: 13,
          maxAge: 17,
          defaultRate: 75
        },
        {
          id: 3,
          type: 'child',
          label: 'Child',
          minAge: 2,
          maxAge: 12,
          defaultRate: 50
        },
        {
          id: 4,
          type: 'infant',
          label: 'Infant',
          minAge: 0,
          maxAge: 1,
          defaultRate: 0
        }
      ],
      mealPlans: [
        {
          id: 'bb-1',
          type: 'BB',
          name: 'Bed & Breakfast',
          description: 'Daily breakfast at main restaurant',
          includedMeals: ['Breakfast'],
          defaultInclusions: [
            'Breakfast Buffet at Main Restaurant',
            'Continental Breakfast',
            'Non-alcoholic Beverages during Breakfast',
            'In-Room Coffee/Tea Making Facilities'
          ],
          restrictions: [
            'Dinner and lunch not included',
            'Room service breakfast at additional charge'
          ]
        },
        {
          id: 'hb-1',
          type: 'HB',
          name: 'Half Board',
          description: 'Daily breakfast and dinner at main restaurant',
          includedMeals: ['Breakfast', 'Dinner'],
          defaultInclusions: [
            'Breakfast Buffet at Main Restaurant',
            'Dinner Buffet at Main Restaurant',
            'Non-alcoholic Beverages during Meals',
            'In-Room Coffee/Tea Making Facilities'
          ],
          restrictions: [
            'Lunch not included',
            'Premium beverages at additional charge',
            'Specialty restaurants may incur additional charge'
          ]
        },
        {
          id: 'fb-1',
          type: 'FB',
          name: 'Full Board',
          description: 'Daily breakfast, lunch and dinner at main restaurant',
          includedMeals: ['Breakfast', 'Lunch', 'Dinner'],
          defaultInclusions: [
            'Breakfast Buffet at Main Restaurant',
            'Lunch Buffet at Main Restaurant',
            'Dinner Buffet at Main Restaurant',
            'Non-alcoholic Beverages during Meals',
            'In-Room Coffee/Tea Making Facilities'
          ],
          restrictions: [
            'Premium beverages at additional charge',
            'Specialty restaurants may incur additional charge'
          ]
        },
        {
          id: 'ai-1',
          type: 'AI',
          name: 'All Inclusive',
          description: 'Comprehensive all-inclusive package with meals, drinks, and selected activities',
          includedMeals: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
          defaultInclusions: [
            'All Meals at Main Restaurant',
            'Selected Alcoholic & Non-alcoholic Beverages',
            'Mini Bar Refill (Daily)',
            'Afternoon Tea & Snacks',
            'Selected Water Sports Activities',
            'Evening Entertainment'
          ],
          restrictions: [
            'Premium spirits and wines at additional charge',
            'Specialty restaurants may require reservation',
            'Some water sports may require certification'
          ]
        }
      ]
    },
    { 
      id: 2, 
      name: 'Sugar Beach Resort & Spa',
      ageCategories: [
        {
          id: 1,
          type: 'adult',
          label: 'Adult',
          minAge: 16,
          maxAge: 999,
          defaultRate: 120
        },
        {
          id: 2,
          type: 'child',
          label: 'Child',
          minAge: 2,
          maxAge: 15,
          defaultRate: 60
        },
        {
          id: 3,
          type: 'infant',
          label: 'Infant',
          minAge: 0,
          maxAge: 1,
          defaultRate: 0
        }
      ]
    }
  ];
  
  // BehaviorSubjects for state management
  private selectedHotel = new BehaviorSubject<Hotel | null>(null);
  private selectedMenuItem = new BehaviorSubject<MenuItemId>('description');
  private activeTab = new BehaviorSubject<string>('general');
  
  // Maps for data storage
  private marketsMap = new Map<number, Market[]>();
  private seasonsMap = new Map<number, Season[]>();
  private hotelDataMap = new Map<string, any>();
  private roomsMap = new Map<number, RoomType[]>();
  private marketMealPlanRates = new Map<number, MarketMealPlanRate[]>();
  private contractsMap = new Map<number, Contract[]>();
  
  private currencySettings: CurrencySetting[] = [
    {
      id: 1,
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      isActive: true
    },
    {
      id: 2,
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
      isActive: true
    },
    {
      id: 3,
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee',
      isActive: true
    },
    {
      id: 4,
      code: 'MUR',
      symbol: 'Rs',
      name: 'Mauritian Rupee',
      isActive: true
    }
  ];

  public marketGroups: MarketGroup[] = [
    {
      id: 1,
      code: 'EUR',
      name: 'Europe',
      markets: [
        { 
          id: 1, 
          name: 'France', 
          code: 'FR',
          currency: 'EUR',
          isActive: true,
          region: 'Europe',
          description: 'Major European market with strong focus on luxury travel and cultural experiences'
        },
        { 
          id: 2, 
          name: 'United Kingdom', 
          code: 'UK',
          currency: 'GBP',
          isActive: true,
          region: 'Europe',
          description: 'Key market with high demand for premium accommodations and family packages'
        }
      ]
    },
    {
      id: 2,
      code: 'AFR',
      name: 'Africa',
      markets: [
        { 
          id: 3, 
          name: 'Mauritius', 
          code: 'MU',
          currency: 'MUR',
          isActive: true,
          region: 'Africa',
          description: 'Local market with focus on domestic tourism and regional partnerships'
        }
      ]
    },
    {
      id: 3,
      code: 'ASIA',
      name: 'Asia',
      markets: [
        { 
          id: 4, 
          name: 'India', 
          code: 'IN',
          currency: 'INR',
          isActive: true,
          region: 'Asia',
          description: 'Growing market with increasing demand for luxury and destination weddings'
        }
      ]
    }
  ];

  constructor() {
    // Initialize markets data with some example markets
    this.marketsMap.set(1, [
      { 
        id: 1, 
        name: 'France', 
        code: 'FR',
        currency: 'EUR',
        isActive: true,
        region: 'Europe',
        description: 'Major European market with strong focus on luxury travel and cultural experiences'
      },
      { 
        id: 2, 
        name: 'United Kingdom', 
        code: 'UK',
        currency: 'GBP',
        isActive: true,
        region: 'Europe',
        description: 'Key market with high demand for premium accommodations and family packages'
      },
      { 
        id: 3, 
        name: 'Mauritius', 
        code: 'MU',
        currency: 'MUR',
        isActive: true,
        region: 'Africa',
        description: 'Local market with focus on domestic tourism and regional partnerships'
      },
      { 
        id: 4, 
        name: 'India', 
        code: 'IN',
        currency: 'INR',
        isActive: true,
        region: 'Asia',
        description: 'Growing market with increasing demand for luxury and destination weddings'
      }
    ]);

    // Initialize hotel data with descriptions and policies
    this.hotelDataMap.set('1-description', 'Le Meridien Ile Maurice stands as a modern beachfront resort that combines luxury with local charm. Located along the pristine beach of Pointe aux Piments on the northwest coast of Mauritius, this elegant hotel offers breathtaking views of the Indian Ocean. The resort features contemporary rooms and suites, world-class dining options, and a range of leisure facilities including a spa, fitness center, and water sports activities.');
    
    this.hotelDataMap.set('1-cancellation', 'Cancellation Policy:\n- Free cancellation up to 30 days before arrival\n- 50% charge for cancellations between 29-15 days before arrival\n- 100% charge for cancellations within 14 days of arrival or no-show');
    
    this.hotelDataMap.set('1-checkInOut', 'Check-in/Check-out Policy:\n- Check-in time: 2:00 PM\n- Check-out time: 11:00 AM\n- Early check-in and late check-out available upon request and subject to availability');

    // Initialize seasons data with example seasons
    this.seasonsMap.set(1, [
      {
        id: 1,
        name: 'Summer 2024',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        mlos: 1,
        description: 'Peak summer season with warm weather'
      },
      {
        id: 2,
        name: 'Winter 2024',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        mlos: 3,
        description: 'Holiday season with festive activities',
        isBlackout: false
      }
    ]);

    // Initialize rooms data with example rooms
    this.roomsMap.set(1, [
      {
        id: 1,
        type: 'Standard Room',
        description: 'Comfortable room with garden view',
        location: 'Main Building',
        maxOccupancy: {
          adults: 2,
          children: 1,
          infants: 1
        },
        amenities: ['Air Conditioning', 'TV', 'Mini Bar']
      },
      {
        id: 2,
        type: 'Deluxe Room',
        description: 'Spacious room with ocean view',
        location: 'Main Building',
        maxOccupancy: {
          adults: 2,
          children: 2,
          infants: 1
        },
        amenities: ['Air Conditioning', 'TV', 'Mini Bar', 'Balcony', 'Ocean View']
      }
    ]);

    // Initialize contracts with example rates
    this.contractsMap.set(1, [
      {
        id: 1,
        name: 'Summer Contract 2024 - France',
        marketId: 1, // France
        seasonId: 1,
        roomTypeId: 1,
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        status: 'active',
        rateType: 'public',
        terms: 'Standard terms and conditions apply',
        validFrom: new Date('2024-06-01'),
        validTo: new Date('2024-08-31'),
        rates: [
          {
            id: 1,
            name: 'Standard Room Summer Rate - France',
            marketId: 1, // France
            amount: 200,
            seasonId: 1,
            roomTypeId: 1,
            contractId: 1,
            baseRate: 200,
            currency: 'EUR',
            supplements: {
              extraAdult: 50,
              extraChild: 25,
              singleOccupancy: -30
            },
            extraAdult: 50,
            extraChild: 25,
            singleOccupancy: -30,
            ageCategoryRates: {
              adult: 200,
              teen: 150,
              child: 100,
              infant: 0
            },
            specialOffers: []
          }
        ]
      },
      {
        id: 2,
        name: 'Winter Contract 2024 - UK',
        marketId: 2, // UK
        seasonId: 2,
        roomTypeId: 1,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        status: 'active',
        rateType: 'public',
        terms: 'Standard terms and conditions apply',
        validFrom: new Date('2024-12-01'),
        validTo: new Date('2024-12-31'),
        rates: [
          {
            id: 2,
            name: 'Standard Room Winter Rate - UK',
            marketId: 2, // UK
            amount: 250,
            seasonId: 2,
            roomTypeId: 1,
            contractId: 2,
            baseRate: 250,
            currency: 'GBP',
            supplements: {
              extraAdult: 60,
              extraChild: 30,
              singleOccupancy: -35
            },
            extraAdult: 60,
            extraChild: 30,
            singleOccupancy: -35,
            ageCategoryRates: {
              adult: 250,
              teen: 187.5,
              child: 125,
              infant: 0
            },
            specialOffers: []
          }
        ]
      },
      {
        id: 3,
        name: 'Summer Contract 2024 - India',
        marketId: 4, // India
        seasonId: 1,
        roomTypeId: 2,
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        status: 'active',
        rateType: 'public',
        terms: 'Standard terms and conditions apply',
        validFrom: new Date('2024-06-01'),
        validTo: new Date('2024-08-31'),
        rates: [
          {
            id: 3,
            name: 'Deluxe Room Summer Rate - India',
            marketId: 4, // India
            amount: 25000,
            seasonId: 1,
            roomTypeId: 2,
            contractId: 3,
            baseRate: 25000,
            currency: 'INR',
            supplements: {
              extraAdult: 5000,
              extraChild: 2500,
              singleOccupancy: -3000
            },
            extraAdult: 5000,
            extraChild: 2500,
            singleOccupancy: -3000,
            ageCategoryRates: {
              adult: 25000,
              teen: 18750,
              child: 12500,
              infant: 0
            },
            specialOffers: []
          }
        ]
      }
    ]);

    // Initialize currency settings with active currencies
    this.currencySettings = [
      {
        id: 1,
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        isActive: true
      },
      {
        id: 2,
        code: 'GBP',
        symbol: '£',
        name: 'British Pound',
        isActive: true
      },
      {
        id: 3,
        code: 'INR',
        symbol: '₹',
        name: 'Indian Rupee',
        isActive: true
      },
      {
        id: 4,
        code: 'MUR',
        symbol: 'Rs',
        name: 'Mauritian Rupee',
        isActive: true
      }
    ];
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
      ageCategories: defaultAgeCategories
    };
    
    this.hotels.push(newHotel);
    return newHotel;
  }

  getSelectedHotel(): Observable<Hotel | null> {
    return this.selectedHotel.asObservable();
  }

  setSelectedHotel(hotel: Hotel): void {
    this.selectedHotel.next(hotel);
  }

  getSelectedMenuItem(): Observable<MenuItemId> {
    return this.selectedMenuItem.asObservable();
  }

  setActiveMenuItem(menuItem: MenuItemId): void {
    this.selectedMenuItem.next(menuItem);
  }

  getActiveTab(): Observable<string> {
    return this.activeTab.asObservable();
  }

  setActiveTab(tab: string): void {
    this.activeTab.next(tab);
  }

  getMarketsForHotel(hotelId: number): Market[] {
    return this.marketsMap.get(hotelId) || [];
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

    return { success: true, message: 'Market created successfully', market: newMarket };
  }

  getMealPlans(hotelId: string): Observable<MealPlan[]> {
    const hotel = this.hotels.find(h => h.id.toString() === hotelId);
    if (hotel?.mealPlans) {
      return of(hotel.mealPlans);
    }
    return of([]);
  }

  getSeasons(hotelId: number): Season[] {
    return this.seasonsMap.get(hotelId) || [];
  }

  addSeason(hotelId: number, season: Omit<Season, 'id'>): Season {
    const seasons = this.getSeasons(hotelId);
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
    const rooms = this.getRooms(hotelId);
    const newRoom: RoomType = { ...room, id: rooms.length + 1 };
    rooms.push(newRoom);
    this.roomsMap.set(hotelId, rooms);
  }

  updateRoom(hotelId: number, room: RoomType): void {
    const rooms = this.getRooms(hotelId);
    const index = rooms.findIndex(r => r.id === room.id);
    if (index !== -1) {
      rooms[index] = room;
      this.roomsMap.set(hotelId, rooms);
    } else {
      throw new Error('Room not found');
    }
  }

  deleteRoom(hotelId: number, roomId: number): void {
    const rooms = this.getRooms(hotelId);
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
    const seasons = this.seasonsMap.get(hotelId) || [];
    this.seasonsMap.set(hotelId, seasons.filter(s => s.id !== seasonId));
  }

  updateSeason(hotelId: number, season: Season): void {
    const seasons = this.seasonsMap.get(hotelId) || [];
    const index = seasons.findIndex(s => s.id === season.id);
    if (index >= 0) {
      seasons[index] = season;
      this.seasonsMap.set(hotelId, seasons);
    }
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

  getContracts(hotelId: number): Contract[] {
    console.log('Getting contracts for hotel:', hotelId);
    const contracts = this.contractsMap.get(hotelId) || [];
    console.log('Found contracts:', contracts.map(c => ({
      id: c.id,
      name: c.name,
      marketId: c.marketId,
      rates: c.rates?.map(r => ({
        id: r.id,
        name: r.name,
        marketId: r.marketId,
        seasonId: r.seasonId,
        roomTypeId: r.roomTypeId,
        amount: r.amount,
        currency: r.currency
      }))
    })));
    return contracts;
  }

  addContract(hotelId: number, contract: Contract): Observable<Contract> {
    try {
      const contracts = this.getContracts(hotelId);
      contracts.push(contract);
      this.contractsMap.set(hotelId, contracts);
      return of(contract);
    } catch (error) {
      return throwError(() => new Error('Failed to add contract'));
    }
  }

  updateContract(contract: Contract): Observable<Contract> {
    try {
      const contracts = this.getContracts(1); // Using default hotel ID for now
      const index = contracts.findIndex(c => c.id === contract.id);
      if (index === -1) {
        return throwError(() => new Error('Contract not found'));
      }
      contracts[index] = contract;
      this.contractsMap.set(1, contracts);
      return of(contract);
    } catch (error) {
      return throwError(() => new Error('Failed to update contract'));
    }
  }

  addMarketTemplate(hotelId: number, template: MarketTemplate): Observable<MarketTemplate> {
    try {
      const hotel = this.hotels.find(h => h.id === hotelId);
      if (!hotel) {
        return throwError(() => new Error('Hotel not found'));
      }
      
      const markets = this.marketsMap.get(hotelId) || [];
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

  getRates(hotelId: number, filters: { 
    seasonId: number | null; 
    roomTypeId: number | null; 
    currency: Currency | null 
  }): Observable<RateConfiguration[]> {
    try {
      console.log('Getting rates for hotel:', hotelId);
      const contracts = this.getContracts(hotelId);
      console.log('Found contracts:', contracts);
      
      const rooms = this.getRooms(hotelId);
      const seasons = this.getSeasons(hotelId);
      
      console.log('Available data:', {
        rooms: rooms.map(r => ({ id: r.id, type: r.type })),
        seasons: seasons.map(s => ({ id: s.id, name: s.name })),
        contracts: contracts.map(c => ({
          id: c.id,
          name: c.name,
          marketId: c.marketId,
          ratesCount: c.rates?.length || 0,
          rates: c.rates?.map(r => ({
            id: r.id,
            marketId: r.marketId,
            seasonId: r.seasonId,
            roomTypeId: r.roomTypeId,
            amount: r.amount,
            currency: r.currency
          }))
        }))
      });
      
      // Convert rates to RateConfigurations
      const configurations = contracts.reduce<RateConfiguration[]>((accumulator, contract) => {
        console.log('Processing contract:', {
          id: contract.id,
          name: contract.name,
          marketId: contract.marketId,
          ratesCount: contract.rates?.length || 0,
          rates: contract.rates?.map(r => ({
            id: r.id,
            marketId: r.marketId,
            seasonId: r.seasonId,
            roomTypeId: r.roomTypeId,
            amount: r.amount,
            currency: r.currency
          }))
        });
        
        if (!contract?.rates?.length) {
          console.log('No rates found for contract:', contract.id);
          return accumulator;
        }

        const rateConfigs = contract.rates
          .map(rate => {
            console.log('Processing rate:', {
              id: rate.id,
              marketId: rate.marketId,
              seasonId: rate.seasonId,
              roomTypeId: rate.roomTypeId,
              amount: rate.amount,
              currency: rate.currency
            });

            // Find matching room type and season
            const roomType = rooms.find(r => r.id === rate.roomTypeId);
            const season = seasons.find(s => s.id === rate.seasonId);

            if (!roomType || !season) {
              console.log('Missing room type or season for rate:', {
                rateId: rate.id,
                roomTypeId: rate.roomTypeId,
                seasonId: rate.seasonId,
                foundRoomType: !!roomType,
                foundSeason: !!season
              });
              return null;
            }

            console.log('Creating configuration for rate:', {
              rateId: rate.id,
              marketId: rate.marketId,
              roomType: roomType.type,
              season: season.name,
              amount: rate.amount,
              currency: rate.currency
            });

            return {
              roomType,
              season,
              rates: [rate]
            };
          })
          .filter(config => config !== null) as RateConfiguration[];

        console.log('Created rate configs for contract:', {
          contractId: contract.id,
          configCount: rateConfigs.length,
          configs: rateConfigs.map(c => ({
            roomType: c.roomType.type,
            season: c.season.name,
            rates: c.rates.map(r => ({
              id: r.id,
              marketId: r.marketId,
              amount: r.amount,
              currency: r.currency
            }))
          }))
        });
        
        return [...accumulator, ...rateConfigs];
      }, []);

      console.log('Final configurations:', {
        totalCount: configurations.length,
        configs: configurations.map(c => ({
          roomType: c.roomType.type,
          season: c.season.name,
          rates: c.rates.map(r => ({
            id: r.id,
            marketId: r.marketId,
            amount: r.amount,
            currency: r.currency
          }))
        }))
      });
      
      // Apply filters if they exist
      return of(configurations.filter(config => {
        if (filters.seasonId && config.season.id !== filters.seasonId) {
          return false;
        }
        if (filters.roomTypeId && config.roomType.id !== filters.roomTypeId) {
          return false;
        }
        return true;
      }));
    } catch (error) {
      console.error('Error in getRates:', error);
      return throwError(() => error);
    }
  }

  updateMarketGroups(groups: MarketGroup[]): void {
    this.marketGroups = [...groups];
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

  updateMarket(hotelId: number, marketId: number, marketData: Partial<Market>): { success: boolean; message: string; market?: Market } {
    const markets = this.getMarketsForHotel(hotelId);
    const index = markets.findIndex(m => m.id === marketId);
    
    if (index === -1) {
      return { success: false, message: 'Market not found' };
    }

    // Simple validation
    if (marketData.name && !marketData.name.trim()) {
      return { success: false, message: 'Market name cannot be empty' };
    }
    if (marketData.currency && !marketData.currency.trim()) {
      return { success: false, message: 'Currency cannot be empty' };
    }

    const updatedMarket: Market = {
      ...markets[index],
      ...marketData,
      id: marketId,
      code: marketData.name ? marketData.name.substring(0, 2).toUpperCase() : markets[index].code
    };

    markets[index] = updatedMarket;
    this.marketsMap.set(hotelId, markets);

    // Update market in market groups if needed
    if (marketData.region) {
      this.marketGroups.forEach(group => {
        const marketIndex = group.markets?.findIndex(m => m.id === marketId);
        if (marketIndex !== undefined && marketIndex !== -1) {
          group.markets[marketIndex] = updatedMarket;
        }
      });
    }

    return { success: true, message: 'Market updated successfully', market: updatedMarket };
  }

  getRooms(hotelId: number): RoomType[] {
    return this.roomsMap.get(hotelId) || [];
  }

  getCurrencySettings(): CurrencySetting[] {
    return this.currencySettings;
  }

  updateCurrencySettings(settings: CurrencySetting[]): void {
    this.currencySettings = settings;
  }
}