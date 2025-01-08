import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";
import { SpecialOffer } from "../models/types";
import { MockApiService } from "./mock/mock-api.service";
import { BaseDataService } from "./base-data.service";

@Injectable({
  providedIn: "root",
})
export class OffersService extends BaseDataService<SpecialOffer> {
  private offersSubject = new BehaviorSubject<SpecialOffer[]>([]);
  private rateOffersMap = new BehaviorSubject<Map<number, SpecialOffer[]>>(
    new Map()
  );

  constructor() {
    super();
    this.initializeOffers();

    // Debug log
    this.offers$.subscribe((offers) => {
      console.log("Current offers in service:", offers);
    });
  }

  // Get all offers
  get offers$(): Observable<SpecialOffer[]> {
    return this.offersSubject.asObservable();
  }

  // Get offers for a specific rate
  getRateOffers$(rateId: number): Observable<SpecialOffer[]> {
    return this.rateOffersMap.pipe(map((map) => map.get(rateId) || []));
  }

  // Initialize offers from mock storage
  private async initializeOffers() {
    try {
      const offers = await MockApiService.getOffers();
      this.offersSubject.next(offers);
    } catch (error) {
      this.handleError("Error initializing offers", error);
    }
  }

  // Create new offer
  async createOffer(
    offer: Omit<SpecialOffer, "id">
  ): Promise<SpecialOffer | null> {
    try {
      const newOffer = await MockApiService.createOffer(offer);
      const currentOffers = this.offersSubject.value;
      this.offersSubject.next([...currentOffers, newOffer]);
      return newOffer;
    } catch (error) {
      this.handleError("Error creating offer", error);
      return null;
    }
  }

  // Update existing offer
  async updateOffer(
    id: number,
    offerData: Partial<SpecialOffer>
  ): Promise<SpecialOffer | null> {
    try {
      const updatedOffer = await MockApiService.updateOffer(id, offerData);

      // Update the local state
      const currentOffers = this.offersSubject.value;
      const index = currentOffers.findIndex((o) => o.id === id);

      if (index !== -1) {
        currentOffers[index] = updatedOffer;
        this.offersSubject.next([...currentOffers]);
      }

      console.log("Offer updated successfully:", updatedOffer);
      return updatedOffer;
    } catch (error) {
      console.error("Error updating offer:", error);
      this.handleError("Error updating offer", error);
      return null;
    }
  }

  // Delete offer
  async deleteOffer(id: number): Promise<boolean> {
    try {
      await MockApiService.deleteOffer(id);
      const currentOffers = this.offersSubject.value;
      this.offersSubject.next(currentOffers.filter((o) => o.id !== id));

      // Remove offer from all rates
      const currentMap = this.rateOffersMap.value;
      currentMap.forEach((offers, rateId) => {
        currentMap.set(
          rateId,
          offers.filter((o) => o.id !== id)
        );
      });
      this.rateOffersMap.next(new Map(currentMap));

      return true;
    } catch (error) {
      this.handleError("Error deleting offer", error);
      return false;
    }
  }

  // Apply offer to rate
  async applyOfferToRate(rateId: number, offer: SpecialOffer): Promise<void> {
    try {
      const currentMap = this.rateOffersMap.value;
      const currentOffers = currentMap.get(rateId) || [];
      if (!currentOffers.find((o) => o.id === offer.id)) {
        currentMap.set(rateId, [...currentOffers, offer]);
        this.rateOffersMap.next(new Map(currentMap));
      }
    } catch (error) {
      this.handleError("Error applying offer to rate", error);
      throw error;
    }
  }

  // Remove offer from rate
  removeOfferFromRate(rateId: number, offerId: number): void {
    const currentMap = this.rateOffersMap.value;
    const currentOffers = currentMap.get(rateId) || [];
    currentMap.set(
      rateId,
      currentOffers.filter((o) => o.id !== offerId)
    );
    this.rateOffersMap.next(new Map(currentMap));
  }

  // Reset offers to initial state
  async resetOffers(): Promise<void> {
    try {
      await MockApiService.resetStorage();
      await this.initializeOffers();
    } catch (error) {
      this.handleError("Error resetting offers", error);
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
      this.handleError("Error saving offer data", error);
      throw error;
    }
  }

  protected validateData(data: SpecialOffer): boolean {
    if (!data) return false;
    if (!data.name || data.name.trim().length === 0) return false;
    if (!data.description || data.description.trim().length === 0) return false;

    // Validate discount values array
    if (
      !data.discountValues ||
      !Array.isArray(data.discountValues) ||
      data.discountValues.length === 0
    )
      return false;

    // Validate blackout dates if present
    if (data.blackoutDates) {
      if (!Array.isArray(data.blackoutDates)) return false;

      const isValidBlackoutDates = data.blackoutDates.every((blackout) => {
        if (!blackout.start || !blackout.end) return false;
        const start = new Date(blackout.start);
        const end = new Date(blackout.end);
        return start <= end;
      });

      if (!isValidBlackoutDates) return false;
    }

    // Validate each discount value
    return data.discountValues.every((discount) => {
      if (typeof discount.value !== "number" || discount.value < 0)
        return false;
      if (data.discountType === "percentage" && discount.value > 100)
        return false;
      return true;
    });
  }

  protected override handleError(message: string, error: any): void {
    console.error(message, error);
    super.handleError(message, error);
  }

  calculateDiscount(
    baseRate: number,
    offer: SpecialOffer,
    nights: number,
    bookingDate: string
  ): number {
    const reservationDate = new Date(bookingDate);
    let totalDiscountedRate = 0;

    for (let night = 0; night < nights; night++) {
      const currentNightDate = new Date(reservationDate);
      currentNightDate.setDate(currentNightDate.getDate() + night);

      // Check if current night is in blackout period
      const isBlackoutDate = offer.blackoutDates?.some(
        (blackout) =>
          currentNightDate >= new Date(blackout.start) &&
          currentNightDate <= new Date(blackout.end)
      );

      if (isBlackoutDate) {
        totalDiscountedRate += baseRate; // No discount for blackout dates
        continue;
      }

      const applicableDiscount = offer.discountValues.find((discount) => {
        const discountStartDate = new Date(discount.startDate);
        const discountEndDate = new Date(discount.endDate);
        return (
          currentNightDate >= discountStartDate &&
          currentNightDate <= discountEndDate
        );
      });

      if (applicableDiscount) {
        const nightRate =
          offer.discountType === "percentage"
            ? baseRate * (1 - applicableDiscount.value / 100)
            : Math.max(0, baseRate - applicableDiscount.value);
        totalDiscountedRate += nightRate;
      } else {
        totalDiscountedRate += baseRate;
      }
    }

    return totalDiscountedRate;
  }

  getApplicableOffers(checkIn: Date, checkOut: Date, roomTypeId: number): SpecialOffer[] {
    const offers = this.offersSubject.value;
    const today = new Date();
    const stayDuration = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
  
    console.log('Checking offers with parameters:', {
      checkIn,
      checkOut,
      roomTypeId,
      stayDuration,
      totalOffers: offers.length
    });
  
    return offers.filter((offer) => {
      const offerStartDate = new Date(offer.startDate);
      const offerEndDate = new Date(offer.endDate);
  
      // Check each condition and log the result
      const hasOverlap = checkIn <= offerEndDate && checkOut >= offerStartDate;
      const isWithinBookingWindow = !offer.bookingWindow || 
        (today >= new Date(offer.bookingWindow.start) && 
         today <= new Date(offer.bookingWindow.end));
      const meetsMinNights = !offer.minimumNights || stayDuration >= offer.minimumNights;
      
      // Instead of completely excluding offers with blackout dates,
      // check if there are valid dates outside the blackout period
      const hasValidDates = this.hasValidDatesOutsideBlackout(checkIn, checkOut, offer.blackoutDates);
  
      console.log('Offer evaluation:', {
        offerId: offer.id,
        offerName: offer.name,
        hasOverlap,
        isWithinBookingWindow,
        meetsMinNights,
        hasValidDates,
        offerPeriod: `${offer.startDate} - ${offer.endDate}`,
        blackoutDates: offer.blackoutDates
      });
  
      return hasOverlap && isWithinBookingWindow && meetsMinNights && hasValidDates;
    });
  }

  private hasValidDatesOutsideBlackout(
    checkIn: Date,
    checkOut: Date,
    blackoutDates?: Array<{ start: string; end: string }>
  ): boolean {
    if (!blackoutDates || blackoutDates.length === 0) return true;
  
    // Check if there's at least one day outside blackout periods
    const currentDate = new Date(checkIn);
    while (currentDate <= checkOut) {
      let isBlackoutDay = false;
      
      for (const blackout of blackoutDates) {
        const blackoutStart = new Date(blackout.start);
        const blackoutEnd = new Date(blackout.end);
        
        if (currentDate >= blackoutStart && currentDate <= blackoutEnd) {
          isBlackoutDay = true;
          break;
        }
      }
      
      if (!isBlackoutDay) {
        return true; // Found at least one valid date
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return false; // All dates are in blackout periods
  }
}
