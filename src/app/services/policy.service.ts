// src/app/services/policy.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { HotelPolicies, PolicyType } from '../models/types';
import { BaseDataService } from './base-data.service';
import { MockApiService } from './mock/mock-api.service';


@Injectable({
  providedIn: 'root'
})
export class PolicyService extends BaseDataService<HotelPolicies> {
  private policiesMap = new BehaviorSubject<Map<number, HotelPolicies>>(new Map());
  private updateQueue = new Map<number, Observable<HotelPolicies>>();
  // Add override modifier and match the parent class signature
  protected override handleError(message: string, error?: any): void {
    console.error(message, error);
    // Now it matches the base class signature
    super.handleError(message, error);
  }

  constructor() {
    super();
    this.initializePolicies();
  }

  protected logError(message: string, error: any): void {
    console.error(message, error);
    this.handleError(error);
  }

  private async initializePolicies() {
    try {
      const hotels = await MockApiService.getHotels();
      const policiesPromises = hotels.map(hotel => 
        MockApiService.getPolicies(hotel.id)
          .then(policies => [hotel.id, policies] as [number, HotelPolicies])
      );
      
      const policiesEntries = await Promise.all(policiesPromises);
      const policiesMap = new Map<number, HotelPolicies>(
        policiesEntries.filter((entry): entry is [number, HotelPolicies] => 
          entry[1] !== null && entry[1] !== undefined
        )
      );
      this.policiesMap.next(policiesMap);
    } catch (error) {
      this.handleError('Failed to initialize policies', error);
    }
  }
  

  protected getStorageKey(): string {
    return MockApiService.getStorageKey('POLICIES');
  }

  // Get policies for a specific hotel
  getPolicies(hotelId: number): Observable<HotelPolicies | null> {
    return from(MockApiService.getPolicies(hotelId)).pipe(
      catchError(error => {
        this.logError('Error getting policies', error);
        return [null];
      })
    );
  }

  // Update a specific policy type for a hotel
  updatePolicy(
    hotelId: number, 
    policyType: PolicyType, 
    policyData: any
  ): Observable<HotelPolicies | null> {
    // Cancel any pending updates for this hotel
    if (this.updateQueue.has(hotelId)) {
      return throwError(() => new Error('Update already in progress'));
    }

    const update$ = from(
      MockApiService.updatePolicies(hotelId, policyType, policyData)
    ).pipe(
      tap(policies => {
        const currentMap = this.policiesMap.value;
        currentMap.set(hotelId, policies);
        this.policiesMap.next(new Map(currentMap));
      }),
      finalize(() => {
        this.updateQueue.delete(hotelId);
      }),
      shareReplay(1)
    );

    this.updateQueue.set(hotelId, update$);
    return update$;
  }

  // Get a policy template by type
  getPolicyTemplate(type: PolicyType): any {
    switch (type) {
      case PolicyType.CANCELLATION:
        return {
          charges: [],
          terms: [],
          exceptions: []
        };
      case PolicyType.CHECK_IN:
        return {
          standardTime: '14:00',
          earliestTime: '12:00',
          requirements: []
        };
      // ... other policy templates
      default:
        return {};
    }
  }

  // Reset policies to initial state
  async resetPolicies(): Promise<void> {
    try {
      await MockApiService.resetStorage();
      await this.initializePolicies();
    } catch (error) {
      this.handleError('Error resetting policies', error);
    }
  }

  // Implement required abstract methods from BaseDataService
  protected override async loadData(): Promise<void> {
    await this.initializePolicies();
}

  protected async saveData(data: any): Promise<void> {
    // Implementation based on your needs
  }

  protected validateData(data: any): boolean {
    // Add validation logic
    return true;
  }
}
