import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialOffer, Rate } from '../../../models/types';
import { SpecialOffersService } from '../special-offers.service';
import { HotelService } from '../../../services/hotel.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offer-rates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-rates.component.html',
  styleUrls: ['./offer-rates.component.css']
})
export class OfferRatesComponent implements OnInit, OnDestroy {
  offers: SpecialOffer[] = [];
  rates: Rate[] = [];
  selectedRateId: number | null = null;
  appliedOffers: SpecialOffer[] = [];
  private subscriptions = new Subscription();

  constructor(
    private specialOffersService: SpecialOffersService,
    private hotelService: HotelService
  ) {}

  ngOnInit() {
    // Subscribe to offers from the service
    this.subscriptions.add(
      this.specialOffersService.getOffers().subscribe(offers => {
        this.offers = offers;
      })
    );

    // Subscribe to hotel changes to load rates
    this.subscriptions.add(
      this.hotelService.selectedHotel$.subscribe(hotel => {
        if (hotel) {
          this.loadRates(hotel.id);
        } else {
          this.rates = [];
          this.selectedRateId = null;
          this.appliedOffers = [];
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private async loadRates(hotelId: number) {
    try {
      this.rates = await this.hotelService.getRates(hotelId);
    } catch (error) {
      console.error('Error loading rates:', error);
      this.rates = [];
    }
  }

  onRateSelect(rateId: string) {
    this.selectedRateId = rateId ? parseInt(rateId, 10) : null;
    this.appliedOffers = [];
    
    if (this.selectedRateId) {
      const selectedRate = this.rates.find(r => r.id === this.selectedRateId);
      if (selectedRate?.specialOffers) {
        this.appliedOffers = selectedRate.specialOffers;
      }
    }
  }

  getApplicableDiscount(offer: SpecialOffer, bookingDate: Date): number {
    // Find the applicable discount value based on booking date
    const bookingDateStr = bookingDate.toISOString().split('T')[0];
    
    for (const discount of offer.discountValues) {
      const discountStartDate = discount.startDate || offer.startDate;
      const discountEndDate = discount.endDate || offer.endDate;
      
      if (discountStartDate && discountEndDate) {
        if (bookingDateStr >= discountStartDate && bookingDateStr <= discountEndDate) {
          return discount.value;
        }
      }
    }
    
    // Return the default discount value if no date-specific discount is found
    return offer.discountValues[0]?.value || 0;
  }

  async applyOffer(offer: SpecialOffer) {
    if (!this.selectedRateId) return;
    
    // Check if offer is already applied
    if (this.isOfferApplied(offer.id)) return;

    const selectedRate = this.rates.find(r => r.id === this.selectedRateId);
    if (!selectedRate) return;

    // Add offer to rate's special offers
    const updatedRate = {
      ...selectedRate,
      specialOffers: [...(selectedRate.specialOffers || []), offer]
    };

    try {
      await this.hotelService.updateRate(updatedRate);
      this.appliedOffers = [...this.appliedOffers, offer];
    } catch (error) {
      console.error('Error applying offer:', error);
    }
  }

  async removeOffer(offerId: number) {
    if (!this.selectedRateId) return;

    const selectedRate = this.rates.find(r => r.id === this.selectedRateId);
    if (!selectedRate) return;

    // Remove offer from rate's special offers
    const updatedRate = {
      ...selectedRate,
      specialOffers: (selectedRate.specialOffers || []).filter(o => o.id !== offerId)
    };

    try {
      await this.hotelService.updateRate(updatedRate);
      this.appliedOffers = this.appliedOffers.filter(offer => offer.id !== offerId);
    } catch (error) {
      console.error('Error removing offer:', error);
    }
  }

  isOfferApplied(offerId: number): boolean {
    return this.appliedOffers.some(offer => offer.id === offerId);
  }

  getRateName(rate: Rate): string {
    const roomType = this.hotelService.getRooms(rate.hotelId || 0)
      .find(r => r.id === rate.roomTypeId);
    const season = this.hotelService.getSeasons(rate.hotelId || 0)
      .find(s => s.id === rate.seasonId);
    const market = this.hotelService.getMarkets(rate.hotelId || 0)
      .find(m => m.id === rate.marketId);
    
    return `${roomType?.name || 'Unknown Room'} - ${season?.name || 'Unknown Season'} - ${market?.name || 'Unknown Market'}`;
  }
}