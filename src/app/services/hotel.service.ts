// src/app/services/hotel.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { distinctUntilChanged, map, tap, catchError } from 'rxjs/operators';
import { 
  Hotel, 
  AgeCategory, 
  HotelPolicies, 
  HotelCapacity, 
  MenuItemId,
  DressCodePolicy,
  HotelDataKey
} from '../models/types';
import { MockApiService } from './mock/mock-api.service';
import { BaseDataService } from './base-data.service';

@Injectable({
  providedIn: 'root'
})
export class HotelService extends BaseDataService<Hotel> {
  private selectedHotelSubject = new BehaviorSubject<Hotel | null>(null);
  private selectedMenuItemSubject = new BehaviorSubject<MenuItemId | null>(null);
  private hotels$ = new BehaviorSubject<Hotel[]>([]);

  readonly selectedHotel$ = this.selectedHotelSubject.asObservable();
  readonly selectedMenuItem$ = this.selectedMenuItemSubject.asObservable();
  readonly allHotels$ = this.hotels$.asObservable();

  constructor() {
    super();
    this.selectedHotel$.pipe(
      distinctUntilChanged()
    ).subscribe(hotel => {
      if (hotel) {
        this.loadHotelData(hotel);
      }
    });
  }

  protected override handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
  async loadHotels(): Promise<void> {
    try {
      const hotels = await MockApiService.getHotels();
      this.hotels$.next(hotels);
    } catch (error) {
      console.error('Failed to load hotels:', error);
      throw error;
    }
  }

  // Initialize data from localStorage or mock data
  private async initializeData() {
    try {
      const hotels = await MockApiService.getHotels();
      this.hotels$.next(hotels);
    } catch (error) {
      console.error('Failed to initialize hotels:', error);
    }
  }

  // Load full hotel data including relationships
  private async loadHotelData(hotel: Hotel) {
    try {
      const fullHotelData = await MockApiService.getHotelById(hotel.id);
      if (fullHotelData) {
        this.selectedHotelSubject.next(fullHotelData);
      }
    } catch (error) {
      console.error(`Failed to load hotel data for hotel ${hotel.id}:`, error);
    }
  }

  // Public methods
  // Get full hotel data
  getHotels(): Observable<Hotel[]> {
    return this.allHotels$;
  }
  async getHotelById(id: number): Promise<Hotel> {
    try {
      const hotel = await MockApiService.getHotelById(id);
      if (!hotel) {
        throw new Error(`Hotel with ID ${id} not found`);
      }
      return hotel;
    } catch (error) {
      console.error('Error fetching hotel:', error);
      throw error;
    }
  }

  // Hotel selection management
  setSelectedHotel(hotel: Hotel | null): void {
    this.selectedHotelSubject.next(hotel);
  }

  setSelectedMenuItem(menuItem: MenuItemId): void {
    this.selectedMenuItemSubject.next(menuItem);
  }

  // Update methods
  async updateHotel(id: number, updates: Partial<Hotel>): Promise<Hotel | null> {
    try {
      const updatedHotel = await MockApiService.updateHotel(id, updates);
      
      // Update hotels list
      const currentHotels = this.hotels$.value;
      const index = currentHotels.findIndex(h => h.id === id);
      if (index !== -1) {
        currentHotels[index] = updatedHotel;
        this.hotels$.next([...currentHotels]);
      }

      // Update selected hotel if it's the one being updated
      if (this.selectedHotelSubject.value?.id === id) {
        this.selectedHotelSubject.next(updatedHotel);
      }

      return updatedHotel;
    } catch (error) {
      console.error(`Failed to update hotel ${id}:`, error);
      return null;
    }
  }

  // Specific update methods
   // Method to update age categories with validation
   async updateHotelAgeCategories(hotelId: number, categories: AgeCategory[]): Promise<Hotel> {
    try {
      // Validate categories before updating
      this.validateAgeCategories(categories);
      
      const updatedHotel = await MockApiService.updateHotelAgeCategories(hotelId, categories);
      this.updateHotelInStore(updatedHotel);
      return updatedHotel;
    } catch (error) {
      // Convert error to string before passing to handleError
      this.handleError(error instanceof Error ? error.message : 'Failed to update age categories');
      throw error;
    }
  }
  

  private updateHotelInStore(updatedHotel: Hotel) {
    const currentHotels = this.hotels$.value;
    const index = currentHotels.findIndex(h => h.id === updatedHotel.id);
    if (index !== -1) {
      currentHotels[index] = updatedHotel;
      this.hotels$.next([...currentHotels]);
    }
  }

  async updateHotelPolicies(hotelId: number, policies: HotelPolicies): Promise<Hotel | null> {
    return this.updateHotel(hotelId, { policies });
  }

  getHotelDescription(hotelId: number): Observable<string> {
    return this.getHotelData<string>(hotelId, 'description').pipe(
      map(description => description || ''),
      catchError(error => {
        console.error('Error loading hotel description:', error);
        return of('');
      })
    );
  }

  getHotelDressCode(hotelId: number): Observable<DressCodePolicy | null> {
    return this.getHotelData<DressCodePolicy>(hotelId, 'dressCode').pipe(
      catchError(error => {
        console.error('Error loading hotel dress code:', error);
        return of(null);
      })
    );
  }

  getHotelFactSheet(hotelId: number): Observable<string> {
    return this.getHotelData<string>(hotelId, 'factSheet').pipe(
      map(factSheet => factSheet || ''),
      catchError(error => {
        console.error('Error loading hotel fact sheet:', error);
        return of('');
      })
    );
  }

  // async updateHotelCapacity(hotelId: number, capacity: HotelCapacity): Promise<Hotel | null> {
  //   return this.updateHotel(hotelId, { capacity });
  // }

  // Storage management methods
  saveHotelData<T>(hotelId: number, key: HotelDataKey, value: T): Observable<void> {
    return from(MockApiService.saveHotelData(hotelId, key, value)).pipe(
      catchError(error => {
        console.error(`Failed to save hotel data for key ${key}:`, error);
        throw error;
      })
    );
  }

  getHotelData<T>(hotelId: number, key: HotelDataKey): Observable<T | null> {
    return from(MockApiService.getHotelData<T>(hotelId, key)).pipe(
      catchError(error => {
        console.error(`Error getting hotel data for key ${key}:`, error);
        return of(null);
      })
    );
  }

  // Reset data
  async resetHotels(): Promise<void> {
    try {
      await MockApiService.resetStorage();
      await this.loadHotels();
    } catch (error) {
      console.error('Failed to reset hotels:', error);
    }
  }

  // Helper methods
  getHotelName(id: number): string {
    return this.hotels$.value.find(h => h.id === id)?.name || '';
  }

  // New method to get age categories directly
  getHotelAgeCategories(hotelId: number): Observable<AgeCategory[]> {
    return from(MockApiService.getHotelAgeCategories(hotelId)).pipe(
      map(categories => categories || []),
      catchError(this.handleError('getHotelAgeCategories', []))
    );
  }

  private validateAgeCategories(categories: AgeCategory[]): void {
    // Ensure no overlapping age ranges
    categories.forEach((category, index) => {
      const nextCategory = categories[index + 1];
      if (nextCategory && category.maxAge >= nextCategory.minAge) {
        throw new Error('Age categories cannot have overlapping ranges');
      }
      // Ensure valid age ranges
      if (category.minAge < 0 || category.maxAge < category.minAge) {
        throw new Error('Invalid age range');
      }
    });
    
    // Ensure continuous coverage
    for (let i = 0; i < categories.length - 1; i++) {
      if (categories[i].maxAge + 1 !== categories[i + 1].minAge) {
        throw new Error('Age categories must be continuous');
      }
    }
  }

}
