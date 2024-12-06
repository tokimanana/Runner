import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Hotel, AgeCategory, HotelPolicies, HotelCapacity, MenuItemId, CancellationChargeType } from '../models/types';
import { sampleData } from '../../data';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  // Static data
  private hotels: Hotel[] = sampleData.hotels as Hotel[];

  // BehaviorSubjects for dynamic data
  private selectedHotel = new BehaviorSubject<Hotel | null>(null);
  private selectedMenuItem = new BehaviorSubject<MenuItemId | null>(null);
  private activeTab = new BehaviorSubject<string>('general');
  private hotelPolicies = new BehaviorSubject<HotelPolicies | null>(null);
  private hotelCapacity = new BehaviorSubject<HotelCapacity | null>(null);

  constructor() {
    this.loadInitialData();
    this.selectedHotel.next(null);
    this.selectedMenuItem.next(null);

    // Subscribe to hotel changes for dependent data
    this.selectedHotel$
      .pipe(
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
      )
      .subscribe((hotel: Hotel | null) => {  
        if (hotel && 'id' in hotel) {  
          this.loadHotelData(hotel);
        }
      });
  }

  private loadInitialData(): void {
    this.hotels = sampleData.hotels as Hotel[];
  }

  private loadHotelData(hotel: Hotel): void {
    if (hotel.policies) {
      this.hotelPolicies.next(hotel.policies);
    }
    if (hotel.capacity) {
      this.hotelCapacity.next(hotel.capacity);
    }
  }

  // Public observables
  public selectedHotel$ = this.selectedHotel.asObservable();
  public selectedMenuItem$ = this.selectedMenuItem.asObservable();
  public activeTab$ = this.activeTab.asObservable();

  // Public methods
  setSelectedHotel(hotel: Hotel | null): void {
    this.selectedHotel.next(hotel);
  }

  setSelectedMenuItem(menuItem: MenuItemId): void {
    this.selectedMenuItem.next(menuItem);
  }

  setActiveTab(tab: string): void {
    this.activeTab.next(tab);
  }

  getHotels(): Observable<Hotel[]> {
    return of(this.hotels);
  }

  getHotel(id: number): Hotel | undefined {
    return this.hotels.find(h => h.id === id);
  }

  getHotelName(id: number): string {
    const hotel = this.getHotel(id);
    return hotel?.name || '';
  }

  getHotelPolicies(): Observable<HotelPolicies | null> {
    return this.hotelPolicies.asObservable();
  }

  updateHotelAgeCategories(hotelId: number, ageCategories: AgeCategory[]): Observable<Hotel> {
    const hotel = this.getHotel(hotelId);
    if (hotel) {
      hotel.ageCategories = ageCategories;
      return this.updateHotel(hotel);
    }
    return of(hotel!);
  }

  updateHotel(hotel: Hotel): Observable<Hotel> {
    const index = this.hotels.findIndex(h => h.id === hotel.id);
    if (index !== -1) {
      this.hotels[index] = hotel;
      if (this.selectedHotel.value?.id === hotel.id) {
        this.selectedHotel.next(hotel);
      }
    }
    return of(hotel);
  }

  addHotel(name: string): Hotel {
    const defaultAgeCategories: AgeCategory[] = [
      {
        id: 1,
        type: 'adult',
        name: 'Adult',
        label: 'Adult (18+ years)',
        minAge: 18,
        maxAge: 100,
        description: 'Adult age category (18+ years)',
        defaultRate: 100,
        isActive: true
      },
      {
        id: 2,
        type: 'child',
        name: 'Child',
        label: 'Child (2-17 years)',
        minAge: 2,
        maxAge: 17,
        description: 'Child age category (2-17 years)',
        defaultRate: 50,
        isActive: true
      },
      {
        id: 3,
        type: 'infant',
        name: 'Infant',
        label: 'Infant (0-1 years)',
        minAge: 0,
        maxAge: 1,
        description: 'Infant age category (0-1 years)',
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
      amenities: {},
      checkInTime: '14:00',
      checkOutTime: '12:00',
      policies: {
        cancellation: {
          description: 'Default cancellation policy',
          rules: [
            {
              daysBeforeArrival: 7,
              charge: 100,
              chargeType: CancellationChargeType.PERCENTAGE
            }
          ],
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
          minAdultAge: 18,
          extraBedPolicy: {
            available: true,
            maxExtraBeds: 1,
            charge: 50,
            chargeType: 'per_night'
          }
        },
        pet: {
          allowPets: false,
          maxPets: 0,
          petTypes: []
        },
        dressCode: {
          general: 'Smart casual attire is required in all public areas.',
          restaurants: [],
          publicAreas: []
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
}