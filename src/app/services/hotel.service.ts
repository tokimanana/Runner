import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Hotel, Market, Season, Contract, RateConfiguration, MarketTemplate, MenuItemId, MealPlan } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private hotels: Hotel[] = [];
  private selectedHotel = new BehaviorSubject<Hotel | null>(null);
  private selectedMenuItem = new BehaviorSubject<MenuItemId>('description');
  private marketsMap = new Map<number, Market[]>();
  private seasonsMap = new Map<number, Season[]>();
  private hotelDataMap = new Map<string, string>();
  private roomsMap = new Map<number, any[]>();
  private mealPlansMap = new Map<number, any[]>();

  constructor() {
    // Initialize hotels
    this.hotels = [
      { id: 1, name: 'Le Meridien Ile Maurice' },
      { id: 2, name: 'Sugar Beach Resort & Spa' }
    ];
  
    // Initialize markets data
    this.marketsMap.set(1, [
      { id: 1, name: 'Europe', currency: 'EUR' },
      { id: 2, name: 'UK', currency: 'GBP' },
      { id: 3, name: 'USA', currency: 'USD' }
    ]);
  
    // Initialize seasons data
    this.seasonsMap.set(1, [
      {
        id: 1,
        name: 'Peak Season',
        startDate: '2023-12-20',
        endDate: '2024-01-10',
        mlos: 7,
        isBlackout: false,
        description: 'Christmas and New Year period'
      },
      {
        id: 2,
        name: 'Summer Season',
        startDate: '2024-05-01',
        endDate: '2024-09-30',
        mlos: 3,
        isBlackout: false,
        description: 'European summer holidays'
      }
    ]);
  
    // Initialize meal plans data
    this.mealPlansMap.set(1, [
      {
        type: 'BB',
        name: 'Bed & Breakfast',
        description: 'Daily breakfast at main restaurant',
        rates: [
          { type: 'adult', rate: 35, ageRange: '13+' },
          { type: 'child', rate: 18, ageRange: '4-12' },
          { type: 'infant', rate: 0, ageRange: '0-3' }
        ],
        inclusions: [
          'Breakfast Buffet',
          'Non-alcoholic Drinks',
          'Room Service'
        ]
      },
      {
        type: 'HB',
        name: 'Half Board',
        description: 'Daily breakfast and dinner at main restaurant',
        rates: [
          { type: 'adult', rate: 65, ageRange: '13+' },
          { type: 'child', rate: 33, ageRange: '4-12' },
          { type: 'infant', rate: 0, ageRange: '0-3' }
        ],
        inclusions: [
          'Breakfast Buffet',
          'Dinner Buffet',
          'Non-alcoholic Drinks',
          'Room Service'
        ]
      }
    ]);
  
    // Initialize room data
    this.roomsMap.set(1, [
      { 
        id: 1, 
        type: 'Deluxe Ocean View', 
        description: 'Elegant 45m² room featuring a private balcony with stunning views of the Indian Ocean. Modern tropical décor with king-size bed or twin beds.',
        location: 'Main Wing',
        maxOccupancy: {
          adults: 2,
          children: 2,
          infants: 1
        },
        amenities: ['Free WiFi', 'Ocean View', 'Mini Bar', 'Air Conditioning', 'Room Service', 'Satellite TV', 'Tea/Coffee Maker']
      },
      { 
        id: 2, 
        type: 'Nirvana Premium Suite', 
        description: 'Luxurious 75m² suite with separate living area, private terrace, and direct beach access. Adults-only wing with exclusive privileges.',
        location: 'Nirvana Wing',
        maxOccupancy: {
          adults: 3,
          children: 0,
          infants: 0
        },
        amenities: ['Private Pool', 'Butler Service', 'Premium WiFi', 'Nespresso Machine', 'Luxury Bathroom', 'Ocean Front', 'Club Lounge Access']
      },
      {
        id: 3,
        type: 'Family Suite Garden View',
        description: '65m² interconnecting rooms perfect for families, featuring garden views and extended living space.',
        location: 'Garden Wing',
        maxOccupancy: {
          adults: 2,
          children: 3,
          infants: 1
        },
        amenities: ['Garden View', 'Kids Welcome Pack', 'PlayStation 5', 'Mini Kitchen', 'Baby Cot Available', 'Child Safety Features']
      }
    ]);
  
    // Initialize hotel description
    this.hotelDataMap.set('1-description', 
      'Located on the northwest coast of Mauritius in the bay of Pointe aux Piments, Le Meridien Ile Maurice offers breathtaking views of the Indian Ocean. ' +
      'This 4-star deluxe resort provides an inspiring atmosphere for the modern traveler seeking a luxury tropical getaway. ' +
      'The resort features 261 rooms and suites, an adults-only Nirvana wing, four restaurants, three bars, and a world-class spa.'
    );
    
    // Initialize hotel policies
    this.hotelDataMap.set('1-cancellation', 
      'Peak Season (20 Dec - 10 Jan):\n' +
      '- Cancellation within 30 days: 100% charge\n' +
      '- No show: Full stay charge\n\n' +
      'Regular Season:\n' +
      '- Free cancellation up to 7 days prior to arrival\n' +
      '- Within 7 days: 1 night charge\n' +
      '- Within 48 hours: 50% of stay\n' +
      '- No show: First 2 nights charge'
    );
    
    this.hotelDataMap.set('1-checkInOut',
      'Check-in: 2:00 PM\n' +
      'Check-out: 11:00 AM\n\n' +
      'Early Check-in:\n' +
      '- Subject to availability\n' +
      '- Before 10 AM: Full night charge\n' +
      '- After 10 AM: 50% of night rate\n\n' +
      'Late Check-out:\n' +
      '- Until 6 PM: 50% of night rate\n' +
      '- After 6 PM: Full night charge'
    );
  }
  
  getHotels(): Hotel[] {
    return this.hotels;
  }

  addHotel(name: string): Hotel {
    const newHotel: Hotel = {
      id: this.hotels.length + 1,
      name
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

  setSelectedMenuItem(menuItem: MenuItemId): void {
    this.selectedMenuItem.next(menuItem);
  }

  getMarketsForHotel(hotelId: number): Market[] {
    return this.marketsMap.get(hotelId) || [];
  }

  addMarketToHotel(hotelId: number, name: string, currency: string): Market {
    const markets = this.getMarketsForHotel(hotelId);
    const newMarket: Market = {
      id: markets.length + 1,
      name,
      currency: currency as any
    };
    markets.push(newMarket);
    this.marketsMap.set(hotelId, markets);
    return newMarket;
  }

  getRooms(hotelId: number): any[] {
    return this.roomsMap.get(hotelId) || [];
  }

  getMealPlans(hotelId: number): MealPlan[] {
    return this.mealPlansMap.get(hotelId) || [];
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

  getHotelData(hotelId: number, menuItem: MenuItemId): string {
    const key = `${hotelId}-${menuItem}`;
    return this.hotelDataMap.get(key) || '';
  }

  saveHotelData(hotelId: number, menuItem: MenuItemId, content: string): void {
    const key = `${hotelId}-${menuItem}`;
    this.hotelDataMap.set(key, content);
  }

  updateHotelFaxSheet(hotelId: number, faxSheet: string | null): void {
    const hotel = this.hotels.find(h => h.id === hotelId);
    if (hotel) {
      hotel.faxSheet = faxSheet || undefined;
    }
  }

  addRoom(hotelId: number, room: any): void {
    const rooms = this.getRooms(hotelId);
    const newRoom = { ...room, id: rooms.length + 1 };
    rooms.push(newRoom);
    this.roomsMap.set(hotelId, rooms);
  }

  updateRoom(hotelId: number, room: any): void {
    const rooms = this.getRooms(hotelId);
    const index = rooms.findIndex(r => r.id === room.id);
    if (index !== -1) {
      rooms[index] = room;
      this.roomsMap.set(hotelId, rooms);
    }
  }

  deleteRoom(hotelId: number, roomId: number): void {
    const rooms = this.getRooms(hotelId);
    this.roomsMap.set(hotelId, rooms.filter(r => r.id !== roomId));
  }

  deleteMealPlan(hotelId: number, planType: string) {
    const currentPlans = this.mealPlansMap.get(hotelId) || [];
    const filteredPlans = currentPlans.filter(plan => plan.type !== planType);
    this.mealPlansMap.set(hotelId, filteredPlans);
  }
  
  updateMealPlan(hotelId: number, updatedPlan: MealPlan) {
    const currentPlans = this.mealPlansMap.get(hotelId) || [];
    const index = currentPlans.findIndex(plan => plan.type === updatedPlan.type);
    if (index !== -1) {
      currentPlans[index] = updatedPlan;
      this.mealPlansMap.set(hotelId, currentPlans);
    }
  }
  
  addMealPlan(hotelId: number, mealPlan: MealPlan) {
    const currentPlans = this.mealPlansMap.get(hotelId) || [];
    currentPlans.push(mealPlan);
    this.mealPlansMap.set(hotelId, currentPlans);
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
  
}