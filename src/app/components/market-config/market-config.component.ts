import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';

import { HotelService } from '../../services/hotel.service';
import { Market, Hotel, CurrencySettings, MarketGroup } from '../../models/types';

@Component({
  selector: 'app-market-config',
  templateUrl: './market-config.component.html',
  styleUrls: ['./market-config.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatSlideToggleModule
  ]
})
export class MarketConfigComponent implements OnInit {
  @Input() hotel!: Hotel;
  
  marketGroups: MarketGroup[] = [];
  currencySettings: CurrencySettings[] = [];
  newMarketGroup: Partial<MarketGroup> = {};
  selectedMarketGroup: MarketGroup | null = null;
  showMarketGroupEditor = false;
  selectedMarket: Market | null = null;
  showMarketEditor = false;
  newMarket: Partial<Market> = {};

  constructor(
    private hotelService: HotelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMarketGroups();
    this.loadCurrencySettings();
  }

  loadMarketGroups(): void {
    this.marketGroups = this.hotelService.getMarketGroups();
  }

  loadCurrencySettings(): void {
    this.currencySettings = this.hotelService.getCurrencySettings();
  }

  openMarketGroupEditor(group?: MarketGroup): void {
    this.selectedMarketGroup = group || null;
    if (group) {
      this.newMarketGroup = { ...group };
    } else {
      this.newMarketGroup = {};
    }
    this.showMarketGroupEditor = true;
  }

  closeMarketGroupEditor(): void {
    this.showMarketGroupEditor = false;
    this.selectedMarketGroup = null;
    this.newMarketGroup = {};
  }

  saveMarketGroup(): void {
    if (this.selectedMarketGroup) {
      // Update existing group
      const index = this.marketGroups.findIndex(g => g.code === this.selectedMarketGroup?.code);
      if (index !== -1) {
        this.marketGroups[index] = { 
          ...this.newMarketGroup as MarketGroup,
          markets: this.marketGroups[index].markets 
        };
      }
    } else {
      // Add new group
      this.marketGroups.push({ 
        ...this.newMarketGroup as MarketGroup,
        markets: []
      });
    }
    this.hotelService.updateMarketGroups(this.marketGroups);
    this.closeMarketGroupEditor();
  }

  deleteMarketGroup(group: MarketGroup): void {
    if (group.markets.length === 0) {
      const index = this.marketGroups.findIndex(g => g.code === group.code);
      if (index !== -1) {
        this.marketGroups.splice(index, 1);
        this.hotelService.updateMarketGroups(this.marketGroups);
      }
    }
  }

  openMarketEditor(market: Market | null | undefined, group?: MarketGroup): void {
    this.selectedMarket = market || null;
    this.selectedMarketGroup = group || null;
    
    if (market) {
      this.newMarket = { ...market };
    } else {
      this.newMarket = {
        isActive: true
      };
    }
    this.showMarketEditor = true;
  }

  closeMarketEditor(): void {
    this.showMarketEditor = false;
    this.selectedMarket = null;
    this.newMarket = {};
  }

  saveMarket(): void {
    if (!this.selectedMarketGroup?.code) {
      return;
    }

    const market = { ...this.newMarket as Market };
    const groupCode = this.selectedMarketGroup.code;
    
    if (this.selectedMarket) {
      // Update existing market
      const groupIndex = this.marketGroups.findIndex(g => g.code === groupCode);
      if (groupIndex !== -1) {
        const marketIndex = this.marketGroups[groupIndex].markets.findIndex(
          m => m.code === this.selectedMarket?.code
        );
        if (marketIndex !== -1) {
          this.marketGroups[groupIndex].markets[marketIndex] = market;
        }
      }
    } else {
      // Add new market
      const groupIndex = this.marketGroups.findIndex(g => g.code === groupCode);
      if (groupIndex !== -1) {
        this.marketGroups[groupIndex].markets.push(market);
      }
    }
    
    this.hotelService.updateMarketGroups(this.marketGroups);
    this.closeMarketEditor();
  }

  deleteMarket(market: Market): void {
    const groupIndex = this.marketGroups.findIndex(g => 
      g.markets.some(m => m.code === market.code)
    );
    
    if (groupIndex !== -1) {
      const marketIndex = this.marketGroups[groupIndex].markets.findIndex(
        m => m.code === market.code
      );
      if (marketIndex !== -1) {
        this.marketGroups[groupIndex].markets.splice(marketIndex, 1);
        this.hotelService.updateMarketGroups(this.marketGroups);
      }
    }
  }

  toggleMarketStatus(market: Market): void {
    market.isActive = !market.isActive;
    this.hotelService.updateMarketGroups(this.marketGroups);
  }

  navigateToRates(market: Market): void {
    this.router.navigate(['/rates', market.code]);
  }
}