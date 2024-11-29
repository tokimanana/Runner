import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { SpecialOffer } from '../../models/types';
import { HotelService } from '../../services/hotel.service';

@Injectable({
  providedIn: 'root'
})
export class SpecialOffersService {
  private offersSubject = new BehaviorSubject<SpecialOffer[]>([]);
  private appliedOffersMap = new BehaviorSubject<Map<number, SpecialOffer[]>>(new Map());
  
  // Form state management
  private editingOfferSubject = new BehaviorSubject<SpecialOffer | null>(null);
  private isFormVisibleSubject = new BehaviorSubject<boolean>(false);

  constructor(private hotelService: HotelService) {
    // Subscribe to hotel changes to load offers
    this.hotelService.getSelectedHotel().subscribe(hotel => {
      if (hotel) {
        const hotelOffers = this.hotelService.getSpecialOffersForHotel(hotel.id);
        this.offersSubject.next(hotelOffers || []);
      } else {
        this.offersSubject.next([]);
      }
    });
  }

  // Form visibility and editing state
  getIsFormVisible(): Observable<boolean> {
    return this.isFormVisibleSubject.asObservable();
  }

  getEditingOffer(): Observable<SpecialOffer | null> {
    return this.editingOfferSubject.asObservable();
  }

  openForm(offer?: SpecialOffer) {
    this.editingOfferSubject.next(offer || null);
    this.isFormVisibleSubject.next(true);
  }

  closeForm() {
    this.editingOfferSubject.next(null);
    this.isFormVisibleSubject.next(false);
  }

  // Offer management
  getOffers(): Observable<SpecialOffer[]> {
    return this.offersSubject.asObservable();
  }

  addOffer(offer: Omit<SpecialOffer, 'id'>): void {
    const currentOffers = this.offersSubject.value;
    const newId = currentOffers.length > 0 
      ? Math.max(...currentOffers.map(o => o.id)) + 1 
      : 1;
    
    const newOffer: SpecialOffer = {
      ...offer,
      id: newId
    };

    this.offersSubject.next([...currentOffers, newOffer]);
    
    // Update hotel service
    this.hotelService.getSelectedHotel().pipe(first()).subscribe(hotel => {
      if (hotel) {
        this.hotelService.updateSpecialOffersForHotel(hotel.id, [...currentOffers, newOffer]);
      }
    });
    
    this.closeForm();
  }

  updateOffer(updatedOffer: SpecialOffer): void {
    const currentOffers = this.offersSubject.value;
    const index = currentOffers.findIndex(o => o.id === updatedOffer.id);
    
    if (index !== -1) {
      currentOffers[index] = updatedOffer;
      this.offersSubject.next([...currentOffers]);
      
      // Update hotel service
      this.hotelService.getSelectedHotel().pipe(first()).subscribe(hotel => {
        if (hotel) {
          this.hotelService.updateSpecialOffersForHotel(hotel.id, currentOffers);
        }
      });
      
      this.closeForm();
    }
  }

  deleteOffer(offerId: number): void {
    const currentOffers = this.offersSubject.value;
    const updatedOffers = currentOffers.filter(o => o.id !== offerId);
    this.offersSubject.next(updatedOffers);
    
    // Update hotel service
    this.hotelService.getSelectedHotel().pipe(first()).subscribe(hotel => {
      if (hotel) {
        this.hotelService.updateSpecialOffersForHotel(hotel.id, updatedOffers);
      }
    });
    
    // Remove offer from all rates
    const currentMap = this.appliedOffersMap.value;
    currentMap.forEach((offers, rateId) => {
      currentMap.set(rateId, offers.filter(o => o.id !== offerId));
    });
    this.appliedOffersMap.next(new Map(currentMap));
  }

  // Rate application methods
  applyOfferToRate(rateId: number, offer: SpecialOffer): void {
    const currentMap = this.appliedOffersMap.value;
    const currentOffers = currentMap.get(rateId) || [];
    
    if (!currentOffers.find(o => o.id === offer.id)) {
      currentMap.set(rateId, [...currentOffers, offer]);
      this.appliedOffersMap.next(new Map(currentMap));
    }
  }

  removeOfferFromRate(rateId: number, offerId: number): void {
    const currentMap = this.appliedOffersMap.value;
    const currentOffers = currentMap.get(rateId) || [];
    
    currentMap.set(rateId, currentOffers.filter(o => o.id !== offerId));
    this.appliedOffersMap.next(new Map(currentMap));
  }

  getOffersForRate(rateId: number): Observable<SpecialOffer[]> {
    return new Observable<SpecialOffer[]>(subscriber => {
      this.appliedOffersMap.subscribe(map => {
        subscriber.next(map.get(rateId) || []);
      });
    });
  }
}