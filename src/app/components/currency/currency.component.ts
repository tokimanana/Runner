import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { AVAILABLE_CURRENCIES, Market, Currency, Hotel } from '../../models/types';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Template remains the same -->
  `,
  styles: [`
    /* Styles remain the same */
  `]
})
export class CurrencyComponent implements OnInit {
  @Input() hotel!: Hotel;
  selectedCurrency: Currency = AVAILABLE_CURRENCIES[0];
  availableCurrencies = AVAILABLE_CURRENCIES;
  markets: Market[] = [];
  showModal = false;
  editingMarket: Market | null = null;
  
  marketForm = {
    name: '',
    currency: AVAILABLE_CURRENCIES[0] as Currency
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.loadMarkets();
  }

  loadMarkets() {
    // Load markets from service
  }

  updateCurrency() {
    // Update base currency
  }

  showMarketForm() {
    this.showModal = true;
    this.editingMarket = null;
    this.marketForm = {
      name: '',
      currency: AVAILABLE_CURRENCIES[0]
    };
  }

  editMarket(market: Market) {
    this.editingMarket = market;
    this.marketForm = {
      name: market.name,
      currency: market.currency
    };
    this.showModal = true;
  }

  deleteMarket(market: Market) {
    if (confirm('Are you sure you want to delete this market?')) {
      // Delete market logic
    }
  }

  configureRates(market: Market) {
    // Navigate to rates configuration
  }

  saveMarket() {
    if (this.editingMarket) {
      // Update existing market
    } else {
      // Create new market
    }
    this.closeModal();
    this.loadMarkets();
  }

  closeModal() {
    this.showModal = false;
    this.editingMarket = null;
  }
}