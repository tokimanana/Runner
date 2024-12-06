import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HotelPolicies, PolicyType, Hotel } from '../models/types';
import { HOTELS } from '../../data';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private hotelPolicies = new BehaviorSubject<{ [hotelId: number]: HotelPolicies }>(
    HOTELS.reduce((acc, hotel) => ({
      ...acc,
      [hotel.id]: hotel.policies
    }), {})
  );

  constructor() {}

  // Get policies for a specific hotel
  getPolicies(hotelId: number): Observable<HotelPolicies | null> {
    return this.hotelPolicies.pipe(
      map(policies => policies[hotelId] || null)
    );
  }

  // Update a specific policy type for a hotel
  updatePolicy(hotelId: number, policyType: PolicyType, policyData: any): Observable<HotelPolicies | null> {
    const currentPolicies = this.hotelPolicies.value;
    
    if (!currentPolicies[hotelId]) {
      currentPolicies[hotelId] = {} as HotelPolicies;
    }

    const updatedPolicies = {
      ...currentPolicies,
      [hotelId]: {
        ...currentPolicies[hotelId],
        [policyType]: policyData
      }
    };

    this.hotelPolicies.next(updatedPolicies);
    return this.getPolicies(hotelId);
  }

  // Get a policy template by type
  getPolicyTemplate(type: PolicyType): any {
    switch (type) {
      case PolicyType.CANCELLATION:
        return {
          description: 'Standard cancellation policy',
          rules: [],
          noShowCharge: 100,
          noShowChargeType: 'PERCENTAGE'
        };
      case PolicyType.CHECK_IN:
        return {
          standardTime: '15:00',
          earliestTime: '13:00',
          requirements: [],
          additionalCharges: {
            early: {},
            late: {}
          }
        };
      case PolicyType.CHECK_OUT:
        return {
          standardTime: '11:00',
          latestTime: '13:00',
          requirements: [],
          additionalCharges: {
            early: {},
            late: {}
          }
        };
      case PolicyType.CHILD:
        return {
          allowChildren: true,
          maxChildAge: 12,
          maxInfantAge: 2,
          childrenStayFree: false,
          maxChildrenFree: 0,
          requiresAdult: true,
          minAdultAge: 18,
          extraBedPolicy: {
            available: false,
            maxExtraBeds: 0,
            charge: 0,
            chargeType: 'PER_NIGHT'
          },
          restrictions: []
        };
      case PolicyType.PET:
        return {
          allowPets: false,
          maxPets: 0,
          petTypes: [],
          restrictions: [],
          requirements: []
        };
      case PolicyType.DRESS_CODE:
        return {
          general: '',
          restaurants: [],
          publicAreas: []
        };
      default:
        return {};
    }
  }
}