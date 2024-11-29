import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferListComponent } from './offer-list/offer-list.component';
import { OfferRatesComponent } from './offer-rates/offer-rates.component';
import { appliedRatesExamples } from '../../../data';

@Component({
  selector: 'app-special-offers',
  templateUrl: './special-offers.component.html',
  styleUrls: ['./special-offers.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    OfferListComponent,
    OfferRatesComponent
  ]
})
export class SpecialOffersComponent {
  activeTab: 'offers' | 'rates' | 'examples' = 'offers';
  appliedRatesExamples = appliedRatesExamples;

  switchTab(tab: 'offers' | 'rates' | 'examples') {
    this.activeTab = tab;
  }
}