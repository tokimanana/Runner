import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialOffer, Rate, Hotel } from '../../../models/types';
import { SpecialOffersService } from '../special-offers.service';
import { HotelService } from '../../../services/hotel.service';
import { Subscription } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-offer-rates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-rates.component.html',
  styleUrls: ['./offer-rates.component.css']
})
export class OfferRatesComponent implements OnInit, OnDestroy {
  @Input() hotel!: Hotel;
  offers: SpecialOffer[] = [];
  rates: Rate[] = [];
  selectedRateId: number | null = null;
  appliedOffers: SpecialOffer[] = [];
  private subscriptions = new Subscription();

  constructor(
    private specialOffersService: SpecialOffersService,
    private hotelService: HotelService
  ) {}

  async ngOnInit() {
    // Subscribe to offers
    this.subscriptions.add(
      this.specialOffersService.getOffers().subscribe(offers => {
        this.offers = offers;
      })
    );

    // Load rates if hotel is available
    if (this.hotel) {
      try {
        this.rates = await this.hotelService.getRates(this.hotel.id);
      } catch (error) {
        console.error('Error loading rates:', error);
        this.rates = [];
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onRateSelect(rateId: string) {
    this.selectedRateId = rateId ? parseInt(rateId, 10) : null;
    if (this.selectedRateId) {
      this.loadAppliedOffers(this.selectedRateId);
    } else {
      this.appliedOffers = [];
    }
  }

  private async loadAppliedOffers(rateId: number) {
    try {
      this.appliedOffers = await firstValueFrom(
        this.specialOffersService.getOffersForRate(rateId)
      );
    } catch (error) {
      console.error('Error loading applied offers:', error);
      this.appliedOffers = [];
    }
  }

  getRateName(rate: Rate): string {
    return `${rate.name || 'Unnamed Rate'} (${rate.baseRate} ${rate.currency})`;
  }

  isOfferApplied(offerId: number): boolean {
    return this.appliedOffers.some(offer => offer.id === offerId);
  }

  async applyOffer(offer: SpecialOffer) {
    if (!this.selectedRateId) return;
    
    try {
      this.specialOffersService.applyOfferToRate(this.selectedRateId, offer);
      await this.loadAppliedOffers(this.selectedRateId);
    } catch (error) {
      console.error('Error applying offer:', error);
    }
  }

  async removeOffer(offerId: number) {
    if (!this.selectedRateId) return;
    
    try {
      this.specialOffersService.removeOfferFromRate(this.selectedRateId, offerId);
      await this.loadAppliedOffers(this.selectedRateId);
    } catch (error) {
      console.error('Error removing offer:', error);
    }
  }
}