import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { SpecialOffer } from '../models/types';
import { MockApiService } from './mock/mock-api.service';
import { BaseDataService } from './base-data.service';

@Injectable({
  providedIn: 'root'
})
export class OffersService extends BaseDataService<SpecialOffer> {
  private offersSubject = new BehaviorSubject<SpecialOffer[]>([]);
  private rateOffersMap = new BehaviorSubject<Map<number, SpecialOffer[]>>(new Map());

  constructor() {
    super();
    this.initializeOffers();
  }

  // Get all offers
  get offers$(): Observable<SpecialOffer[]> {
    return this.offersSubject.asObservable();
  }

  // Get offers for a specific rate
  getRateOffers$(rateId: number): Observable<SpecialOffer[]> {
    return this.rateOffersMap.pipe(
      map(map => map.get(rateId) || [])
    );
  }

  // Initialize offers from mock storage
  private async initializeOffers() {
    try {
      const offers = await MockApiService.getOffers();
      this.offersSubject.next(offers);
    } catch (error) {
      this.handleError('Error initializing offers', error);
    }
  }

  // Create new offer
  async createOffer(offer: Omit<SpecialOffer, 'id'>): Promise<SpecialOffer | null> {
    try {
      const newOffer = await MockApiService.createOffer(offer);
      const currentOffers = this.offersSubject.value;
      this.offersSubject.next([...currentOffers, newOffer]);
      return newOffer;
    } catch (error) {
      this.handleError('Error creating offer', error);
      return null;
    }
  }

  // Update existing offer
  async updateOffer(id: number, offerData: Partial<SpecialOffer>): Promise<SpecialOffer | null> {
    try {
      const updatedOffer = await MockApiService.updateOffer(id, offerData);
      const currentOffers = this.offersSubject.value;
      const index = currentOffers.findIndex(o => o.id === id);
      if (index !== -1) {
        currentOffers[index] = updatedOffer;
        this.offersSubject.next([...currentOffers]);
      }
      return updatedOffer;
    } catch (error) {
      this.handleError('Error updating offer', error);
      return null;
    }
  }

  // Delete offer
  async deleteOffer(id: number): Promise<boolean> {
    try {
      await MockApiService.deleteOffer(id);
      const currentOffers = this.offersSubject.value;
      this.offersSubject.next(currentOffers.filter(o => o.id !== id));

      // Remove offer from all rates
      const currentMap = this.rateOffersMap.value;
      currentMap.forEach((offers, rateId) => {
        currentMap.set(rateId, offers.filter(o => o.id !== id));
      });
      this.rateOffersMap.next(new Map(currentMap));

      return true;
    } catch (error) {
      this.handleError('Error deleting offer', error);
      return false;
    }
  }

  // Apply offer to rate
  async applyOfferToRate(rateId: number, offer: SpecialOffer): Promise<void> {
    try {
        const currentMap = this.rateOffersMap.value;
        const currentOffers = currentMap.get(rateId) || [];
        if (!currentOffers.find(o => o.id === offer.id)) {
            currentMap.set(rateId, [...currentOffers, offer]);
            this.rateOffersMap.next(new Map(currentMap));
        }
    } catch (error) {
        this.handleError('Error applying offer to rate', error);
        throw error;
    }
}

  // Remove offer from rate
  removeOfferFromRate(rateId: number, offerId: number): void {
    const currentMap = this.rateOffersMap.value;
    const currentOffers = currentMap.get(rateId) || [];
    currentMap.set(rateId, currentOffers.filter(o => o.id !== offerId));
    this.rateOffersMap.next(new Map(currentMap));
  }

  // Reset offers to initial state
  async resetOffers(): Promise<void> {
    try {
      await MockApiService.resetStorage();
      await this.initializeOffers();
    } catch (error) {
      this.handleError('Error resetting offers', error);
    }
  }

  protected override async loadData(): Promise<void> {
    await this.initializeOffers();
  }

  public load(): Promise<void> {
    return this.loadData();
  }

  protected async saveData(data: any): Promise<void> {
    try {
        if (data.id) {
            await MockApiService.updateOffer(data.id, data);
        } else {
            await MockApiService.createOffer(data);
        }
    } catch (error) {
        this.handleError('Error saving offer data', error);
        throw error;
    }
}

protected validateData(data: SpecialOffer): boolean {
  if (!data) return false;
  if (!data.name || data.name.trim().length === 0) return false;
  if (!data.description || data.description.trim().length === 0) return false;

  // Validate discount values array
  if (!data.discountValues || !Array.isArray(data.discountValues) || data.discountValues.length === 0) return false;

  // Validate each discount value
  return data.discountValues.every(discount => {
      if (typeof discount.value !== 'number' || discount.value < 0) return false;
      if (data.discountType === 'percentage' && discount.value > 100) return false;
      return true;
  });
}

  protected override handleError(message: string, error: any): void {
    console.error(message, error);
    super.handleError(message, error);
  }

  calculateDiscount(baseRate: number, offer: SpecialOffer, nights: number, bookingDate: string): number {
    const reservationDate = new Date(bookingDate);
    const offerStartDate = offer.bookingWindow?.start ? new Date(offer.bookingWindow.start) : offer.startDate ? new Date(offer.startDate) : null;
    const offerEndDate = offer.bookingWindow?.end ? new Date(offer.bookingWindow.end) : offer.endDate ? new Date(offer.endDate) : null;

    if (!offerStartDate || !offerEndDate || reservationDate < offerStartDate || reservationDate > offerEndDate) {
      return baseRate; // Offer not applicable
    }

    let discountedRate = baseRate;
    const applicableDiscount = offer.discountValues.find(discount => {
      const discountStartDate = new Date(discount.startDate);
      const discountEndDate = new Date(discount.endDate);
      return reservationDate >= discountStartDate && reservationDate <= discountEndDate;
    });

    if (applicableDiscount) {
      discountedRate = offer.discountType === 'percentage'
        ? baseRate * (1 - applicableDiscount.value / 100)
        : Math.max(0, baseRate - applicableDiscount.value);
    }

    return discountedRate;
  }

  getApplicableOffers(checkIn: Date, checkOut: Date, roomTypeId: number): SpecialOffer[] {
    const offers = this.offersSubject.value;
    const today = new Date();
    
    return offers.filter(offer => {
      const offerStartDate = new Date(offer.startDate);
      const offerEndDate = new Date(offer.endDate);
      
      // Check if offer is valid for the booking dates
      const isValidDate = checkIn >= offerStartDate && checkOut <= offerEndDate;
      
      // Check booking window if exists
      const isWithinBookingWindow = !offer.bookingWindow || (
        today >= new Date(offer.bookingWindow.start) && 
        today <= new Date(offer.bookingWindow.end)
      );
      
      // Check minimum nights if specified
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const meetsMinNights = !offer.minimumNights || nights >= offer.minimumNights;
      
      return isValidDate && isWithinBookingWindow && meetsMinNights;
    });
  }
}
