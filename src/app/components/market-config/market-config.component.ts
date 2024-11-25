import { Component, ElementRef, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router'; // Added import
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { HotelService } from '../../services/hotel.service';
import { Market, Hotel, CurrencySetting, MarketGroup, Rate } from '../../models/types';

@Component({
  selector: 'app-market-config',
  templateUrl: './market-config.component.html',
  styleUrls: ['./market-config.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatDialogModule,
    RouterModule // Added import
  ]
})
export class MarketConfigComponent implements OnInit, OnChanges {
  @Input() hotel!: Hotel;
  
  marketGroups: MarketGroup[] = [];
  currencySettings: CurrencySetting[] = [];
  newMarketGroup: Partial<MarketGroup> = {};
  selectedMarketGroup: MarketGroup | null = null;
  showMarketGroupEditor = false;
  selectedMarket: Market | null = null;
  showMarketEditor = false;
  newMarket: Partial<Market> = {};
  rates: Rate[] = [];

  @ViewChild('firstInput') firstInput!: ElementRef;

  private marketRatesCache = new Map<number, boolean>();

  constructor(
    private hotelService: HotelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Component initializing with hotel:', this.hotel);
    this.loadMarketGroups();
    this.loadCurrencySettings();
    this.loadRates(); // Load rates during initialization
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Changes detected:', changes);
    if (changes['hotel']) {
      console.log('Hotel changed:', {
        previous: changes['hotel'].previousValue,
        current: changes['hotel'].currentValue
      });
      this.loadRates(); // Reload rates when hotel changes
    }
  }

  loadMarketGroups(): void {
    console.log('Loading market groups');
    this.marketGroups = this.hotelService.getMarketGroups();
    console.log('Loaded market groups:', this.marketGroups.map(g => ({
      name: g.name,
      markets: g.markets.map(m => ({
        id: m.id,
        name: m.name
      }))
    })));
  }

  loadCurrencySettings(): void {
    console.log('Loading currency settings');
    this.currencySettings = this.hotelService.getCurrencySettings();
    console.log('Loaded currency settings:', this.currencySettings);
  }

  async loadRates(): Promise<void> {
    try {
      const contracts = await firstValueFrom(this.hotelService.getContracts(this.hotel.id));
      console.log('Found contracts:', contracts.map(c => ({
        id: c.id,
        name: c.name,
        marketId: c.marketId,
        ratesCount: c.rates?.length || 0
      })));

      this.rates = contracts.flatMap(contract => contract.rates || []);
      console.log('Extracted rates:', this.rates.map(r => ({
        id: r.id,
        marketId: r.marketId,
        amount: r.amount,
        currency: r.currency
      })));
      
      // Clear the cache when loading new rates
      this.marketRatesCache.clear();
      
      // Pre-calculate results for all markets
      const marketIdsWithRates = new Set(this.rates.map(rate => rate.marketId));
      console.log('Market IDs with rates:', Array.from(marketIdsWithRates));
      
      // Initialize cache for all markets
      if (this.marketGroups) {
        this.marketGroups.forEach(group => {
          console.log('Processing group:', group.name);
          group.markets.forEach(market => {
            const marketRates = this.rates.filter(r => r.marketId === market.id);
            const hasRate = marketRates.length > 0;
            
            console.log(`Market ${market.name} (ID: ${market.id}):`, { 
              hasRate, 
              marketId: market.id,
              rateCount: marketRates.length,
              rates: marketRates.map(r => ({
                id: r.id,
                amount: r.amount,
                currency: r.currency
              }))
            });
            
            this.marketRatesCache.set(market.id, hasRate);
          });
        });
        
        console.log('Final market rates cache:', Array.from(this.marketRatesCache.entries()).map(([id, hasRate]) => {
          const market = this.marketGroups
            .flatMap(g => g.markets)
            .find(m => m.id === id);
          return [
            `${market?.name || id}`, 
            { 
              hasRate,
              matchingRates: this.rates.filter(r => r.marketId === id).map(r => ({
                id: r.id,
                amount: r.amount,
                currency: r.currency
              }))
            }
          ];
        }));
      }
    } catch (error) {
      console.error('Error loading rates:', error);
    }
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

  generateCode(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_') // Replace special chars with underscore
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
  }

  saveMarketGroup(): void {
    if (this.newMarketGroup.name) {
      const marketGroupData = {
        ...this.newMarketGroup,
        code: this.generateCode(this.newMarketGroup.name)
      };

      if (this.selectedMarketGroup) {
        // Update existing group
        this.updateMarketGroup(marketGroupData);
      } else {
        // Add new group
        this.addMarketGroup(marketGroupData);
      }
    }
  }

  deleteMarketGroup(group: MarketGroup): void {
    if (group.markets.length > 0) {
      // Handle error (you can add a notification service here)
      console.error('Cannot delete region that contains markets');
      return;
    }

    try {
      this.hotelService.deleteMarketGroup(group.id);
      this.loadMarketGroups();
    } catch (error) {
      console.error('Error deleting market group:', error);
    }
  }

  openMarketEditor(market: Market | null, group: MarketGroup): void {
    this.selectedMarketGroup = group;
    this.showMarketEditor = true;
    
    if (market) {
      this.selectedMarket = market;
      this.newMarket = { ...market };
    } else {
      this.selectedMarket = null;
      this.newMarket = {
        name: '',
        description: '',
        currency: this.getDefaultCurrency(),
        isActive: true
      };
    }

    setTimeout(() => this.firstInput?.nativeElement?.focus(), 0);
  }

  getDefaultCurrency(): string {
    // Get first active currency, or fallback to 'USD'
    return this.currencySettings.find(c => c.isActive)?.code || 'USD';
  }

  closeMarketEditor(): void {
    this.showMarketEditor = false;
    this.selectedMarket = null;
    this.newMarket = {};
  }

  saveMarket(): void {
    if (!this.newMarket.name || !this.newMarket.currency || !this.selectedMarketGroup) {
      console.error('Invalid market data');
      return;
    }

    const marketData: Market = {
      id: this.selectedMarket?.id || this.getNextMarketId(),
      name: this.newMarket.name,
      code: this.generateCode(this.newMarket.name),
      description: this.newMarket.description || '',
      currency: this.newMarket.currency,
      isActive: this.newMarket.isActive ?? true,
      region: this.selectedMarketGroup.name
    };

    if (this.selectedMarket) {
      this.updateMarket(marketData);
    } else {
      this.addMarket(marketData);
    }
  }

  deleteMarket(market: Market, group: MarketGroup): void {
    const marketIndex = group.markets.findIndex(m => m.name === market.name);
    if (marketIndex !== -1) {
      // Store the currency before removing the market
      const currency = market.currency;
      
      // Remove the market
      group.markets.splice(marketIndex, 1);
      this.hotelService.updateMarketGroups(this.marketGroups);

      // Check and deactivate currency if not used anymore
      this.deactivateUnusedCurrency(currency);
    }
  }

  toggleMarketStatus(market: Market): void {
    market.isActive = !market.isActive;
    this.hotelService.updateMarketGroups(this.marketGroups);
  }

  navigateToRates(market: Market): void {
    this.router.navigate(['/rates', market.code]);
  }

  initializeNewMarket(): void {
    this.newMarket = {
      name: '',
      description: '',
      currency: '',
      isActive: true
    };
  }

  hasRate(market: Market): boolean {
    // Check cache first
    let hasRate = this.marketRatesCache.get(market.id);
    
    // If not in cache, calculate and store
    if (hasRate === undefined) {
      console.log(`Calculating rate for market ${market.name} (ID: ${market.id})`);
      
      const marketRates = this.rates.filter(r => r.marketId === market.id);
      hasRate = marketRates.length > 0;
      
      console.log(`Result for ${market.name}:`, { 
        hasRate,
        rateCount: marketRates.length,
        rates: marketRates.map(r => ({
          id: r.id,
          amount: r.amount,
          currency: r.currency
        }))
      });
      
      this.marketRatesCache.set(market.id, hasRate);
    }
    
    return hasRate;
  }

  getNextMarketId(): number {
    // Implement logic to get the next market ID
    // For demonstration purposes, return a fixed ID
    return 1;
  }

  updateMarketGroup(marketGroupData: Partial<MarketGroup>): void {
    if (!this.selectedMarketGroup?.id) {
      console.error('No market group selected');
      return;
    }

    const updatedGroup = {
      ...this.selectedMarketGroup,
      ...marketGroupData
    };
    
    const index = this.marketGroups.findIndex(g => g.id === this.selectedMarketGroup!.id);
    if (index !== -1) {
      this.marketGroups[index] = updatedGroup;
      this.hotelService.updateMarketGroups(this.marketGroups);
      this.closeMarketGroupEditor();
      this.loadMarketGroups();
    }
  }

  addMarketGroup(marketGroupData: Partial<MarketGroup>): void {
    const newGroup: MarketGroup = {
      id: this.getNextGroupId(),
      name: marketGroupData.name || '',
      code: marketGroupData.code || '',
      defaultCurrency: marketGroupData.defaultCurrency || this.getDefaultCurrency(),
      markets: []
    };
    
    this.marketGroups.push(newGroup);
    this.hotelService.updateMarketGroups(this.marketGroups);
    this.closeMarketGroupEditor();
    this.loadMarketGroups();
  }

  getNextGroupId(): number {
    const maxId = Math.max(0, ...this.marketGroups.map(g => g.id));
    return maxId + 1;
  }

  updateMarket(marketData: Market): void {
    if (!this.selectedMarketGroup) {
      console.error('No market group selected');
      return;
    }

    const marketIndex = this.selectedMarketGroup.markets.findIndex(m => m.id === marketData.id);
    if (marketIndex !== -1) {
      this.selectedMarketGroup.markets[marketIndex] = marketData;
      this.hotelService.updateMarketGroups(this.marketGroups);
      this.closeMarketEditor();
      this.loadMarketGroups();
    }
  }

  addMarket(marketData: Market): void {
    if (!this.selectedMarketGroup) {
      console.error('No market group selected');
      return;
    }

    this.selectedMarketGroup.markets.push(marketData);
    this.hotelService.updateMarketGroups(this.marketGroups);
    this.closeMarketEditor();
    this.loadMarketGroups();
  }

  isCurrencyUsedInOtherMarkets(currency: string, excludedMarketId?: number): boolean {
    return this.marketGroups.some(group =>
      group.markets.some(market =>
        market.currency === currency && market.id !== excludedMarketId
      )
    );
  }

  deactivateUnusedCurrency(currency: string): void {
    const currencySetting = this.currencySettings.find(c => c.code === currency);
    if (currencySetting && !this.isCurrencyUsedInOtherMarkets(currency)) {
      currencySetting.isActive = false;
      this.hotelService.updateCurrencySettings(this.currencySettings);
    }
  }
}