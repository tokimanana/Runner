import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { 
  Hotel, 
  AgeCategory, 
  HotelPolicies, 
  HotelCapacity, 
  MenuItemId, 
  CancellationChargeType, 
  DressCodePolicy,
  DressCodeVenue,
  DressCodeArea,
  RoomCategory
} from '../models/types';
import { sampleData } from '../../data';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  // BehaviorSubjects
  private selectedHotelSubject = new BehaviorSubject<Hotel | null>(null);
  private selectedMenuItemSubject = new BehaviorSubject<MenuItemId | null>(null);
  private activeTabSubject = new BehaviorSubject<string | null>(null);
  private hotelPoliciesSubject = new BehaviorSubject<HotelPolicies | null>(null);
  private hotelCapacitySubject = new BehaviorSubject<HotelCapacity | null>(null);

  // Observables
  public selectedHotel$ = this.selectedHotelSubject.asObservable();
  public selectedMenuItem$ = this.selectedMenuItemSubject.asObservable();
  public activeTab$ = this.activeTabSubject.asObservable();
  public hotelPolicies$ = this.hotelPoliciesSubject.asObservable();
  public hotelCapacity$ = this.hotelCapacitySubject.asObservable();

  // Data
  private hotels: Hotel[] = sampleData.hotels;

  constructor() {
    this.loadInitialData();
    this.selectedHotelSubject.next(null);
    this.selectedMenuItemSubject.next(null);

    this.selectedHotel$.pipe(
      distinctUntilChanged()
    ).subscribe(hotel => {
      if (hotel) {
        this.loadHotelData(hotel);
      }
    });
  }

  private loadInitialData(): void {
    this.hotels = sampleData.hotels;
  }

  private loadHotelData(hotel: Hotel): void {
    if (hotel.policies) {
      this.hotelPoliciesSubject.next(hotel.policies);
    }
    if (hotel.capacity) {
      this.hotelCapacitySubject.next(hotel.capacity);
    }
  }

  // Public methods
  public setSelectedHotel(hotel: Hotel | null): void {
    this.selectedHotelSubject.next(hotel);
  }

  public setSelectedMenuItem(menuItem: MenuItemId): void {
    this.selectedMenuItemSubject.next(menuItem);
  }

  public setActiveTab(tab: string): void {
    this.activeTabSubject.next(tab);
  }

  public getHotels(): Observable<Hotel[]> {
    return of(this.hotels);
  }

  public getHotel(id: number): Hotel | undefined {
    return this.hotels.find(h => h.id === id);
  }

  public getHotelName(id: number): string {
    const hotel = this.getHotel(id);
    return hotel?.name || '';
  }

  public getHotelDescription(hotelId: number): Observable<string> {
    const hotel = this.hotels.find(h => h.id === hotelId);
    return of(hotel?.description || '');
  }

  public getHotelDressCode(hotelId: number): Observable<DressCodePolicy | null> {
    const hotel = this.hotels.find(h => h.id === hotelId);
    return of(hotel?.policies?.dressCode || null);
  }

  public getHotelFactSheet(hotelId: number): Observable<string> {
    const hotel = this.hotels.find(h => h.id === hotelId);
    return of(hotel?.factSheet || '');
  }

  public addHotel(name: string): Hotel {
    const defaultAgeCategories: AgeCategory[] = [
      {
        id: 1,
        name: 'Adult',
        type: 'adult',
        label: 'Adult (18+ years)',
        minAge: 18,
        maxAge: 99,
        defaultRate: 100,
        description: 'Adult age category (18+ years)',
        isActive: true
      },
      {
        id: 2,
        name: 'Child',
        type: 'child',
        label: 'Child (2-17 years)',
        minAge: 2,
        maxAge: 17,
        defaultRate: 50,
        description: 'Child age category (2-17 years)',
        isActive: true
      },
      {
        id: 3,
        name: 'Infant',
        type: 'infant',
        label: 'Infant (0-1 years)',
        minAge: 0,
        maxAge: 1,
        defaultRate: 0,
        description: 'Infant age category (0-1 years)',
        isActive: true
      }
    ];

    const newHotel: Hotel = {
      id: this.hotels.length + 1,
      name,
      description: '',
      address: '',
      city: '',
      country: '',
      rating: 0,
      factSheet: '',
      ageCategories: defaultAgeCategories,
      amenities: {},
      checkInTime: '14:00',
      checkOutTime: '12:00',
      policies: {
        dressCode: {
          general: 'Smart casual attire is required throughout the hotel.',
          restaurants: [
            {
              name: 'Main Restaurant',
              code: 'MAIN',
              description: 'Smart casual attire is required',
              restrictions: ['No beachwear', 'No shorts']
            }
          ],
          publicAreas: [
            {
              area: 'Lobby',
              code: 'LOBBY',
              description: 'Smart casual attire is required',
              restrictions: ['No swimwear']
            }
          ]
        },
        cancellation: {
          id: 1,
          name: 'Standard',
          description: 'Standard cancellation policy',
          rules: [{
            daysBeforeArrival: 7,
            charge: 100,
            chargeType: CancellationChargeType.PERCENTAGE
          }],
          noShowCharge: 100,
          noShowChargeType: CancellationChargeType.PERCENTAGE
        },
        checkIn: {
          standardTime: '14:00'
        },
        checkOut: {
          standardTime: '12:00'
        },
        child: {
          maxChildAge: 17,
          maxInfantAge: 1,
          allowChildren: true,
          childrenStayFree: false,
          maxChildrenFree: 0,
          requiresAdult: true,
          minAdultAge: 18
        },
        pet: {
          allowPets: false,
          maxPets: 0,
          petTypes: []
        }
      },
      features: {
        restaurants: [],
        spa: {
          name: '',
          treatments: [],
          openingHours: '',
          description: ''
        }
      },
      images: [],
      contactInfo: {
        phone: '',
        email: ''
      }
    };

    this.hotels.push(newHotel);
    return newHotel;
  }

  public updateHotelAgeCategories(hotelId: number, ageCategories: AgeCategory[]): Observable<Hotel> {
    const hotel = this.getHotel(hotelId);
    if (hotel) {
      hotel.ageCategories = ageCategories;
    }
    return of(hotel!);
  }

  public updateHotel(hotel: Hotel): Observable<Hotel> {
    const index = this.hotels.findIndex(h => h.id === hotel.id);
    if (index !== -1) {
      this.hotels[index] = hotel;
      if (this.selectedHotelSubject.value?.id === hotel.id) {
        this.selectedHotelSubject.next(hotel);
      }
      return of(hotel);
    }
    return of(hotel);
  }

  public saveHotelData(hotelId: number, field: string, value: any): Observable<Hotel> {
    const hotel = this.getHotel(hotelId);
    if (hotel) {
      (hotel as any)[field] = value;
    }
    return of(hotel!);
  }

  public getHotelData<T>(hotelId: number, field: string): Observable<T | null> {
    const hotel = this.getHotel(hotelId);
    if (hotel) {
      return of((hotel as any)[field] as T);
    }
    return of(null);
  }
}