import { Component, ElementRef, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router'; // Added import
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { HotelService } from '../../services/hotel.service';
import { Market, Hotel, CurrencySetting, MarketGroup, Rate } from '../../models/types';
import { ModalComponent } from "../modal/modal.component";

@Component({
  selector: 'app-market-config',
  templateUrl: './market-config.component.html',
  styleUrls: ['./market-config.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    RouterModule // Added import,
    ,
    ModalComponent
]
})
export class MarketConfigComponent implements OnInit, OnChanges {
  @Input() hotel!: Hotel;
  
  marketGroups: MarketGroup[] = [];
  currencySettings: CurrencySetting[] = [];
  markets: Market[] = [];
  rates: Rate[] = [];
  private marketRatesCache = new Map<number, boolean>();
  
  newMarketGroup: Partial<MarketGroup> = {
    defaultCurrency: '',
    markets: [],
    isActive: true
  };
  selectedMarketGroup: MarketGroup | null = null;
  showMarketGroupEditor = false;
  selectedMarket: Market | null = null;
  showMarketEditor = false;
  newMarket: Partial<Market> = {};
  
  @ViewChild('firstInput') firstInput!: ElementRef;

  constructor(
    private hotelService: HotelService,
    private router: Router
  ) {}

  // Helper method to get Market object from ID
  private getMarketById(marketId: number): Market | undefined {
    return this.markets.find(m => m.id === marketId);
  }

  // Helper method to get markets for a group
  getMarketsForGroup(group: MarketGroup): Market[] {
    return group.markets
      .map(marketId => this.getMarketById(marketId))
      .filter((market): market is Market => market !== undefined);
  }

  async ngOnInit() {
    await this.loadData();
  }

  private async loadData() {
    if (this.hotel) {
      // Convert synchronous methods to observables
      this.markets = this.hotelService.getMarketsForHotel(this.hotel.id);
      this.marketGroups = await firstValueFrom(this.hotelService.getMarketGroups());
      this.rates = await firstValueFrom(this.hotelService.getAllRates());
      this.currencySettings = this.hotelService.getCurrencySettings();
    }
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

  async loadMarketGroups(): Promise<void> {
    try {
      this.hotelService.getMarketGroups().subscribe(
        marketGroups => {
          this.marketGroups = marketGroups;
          console.log('Loaded market groups:', this.marketGroups.map(g => ({
            name: g.name,
            markets: g.markets.map(marketId => {
              const market = this.getMarketById(marketId);
              return {
                id: marketId,
                name: market ? market.name : 'Unknown Market'
              };
            })
          })));
        },
        error => {
          console.error('Error loading market groups:', error);
          this.marketGroups = []; // Initialize to empty array on error
        }
      );
    } catch (error) {
      console.error('Error in loadMarketGroups:', error);
      this.marketGroups = []; // Initialize to empty array on error
    }
  }

  loadCurrencySettings(): void {
    console.log('Loading currency settings');
    this.currencySettings = this.hotelService.getCurrencySettings();
    console.log('Loaded currency settings:', this.currencySettings);
  }

  async loadRates(): Promise<void> {
    try {
      this.rates = await firstValueFrom(this.hotelService.getAllRates());
      console.log('Loaded rates:', this.rates);

      this.marketGroups.forEach(group => {
        console.log('Processing group:', group.name);
        group.markets.forEach(marketId => {
          const market = this.getMarketById(marketId);
          const marketRates = this.rates.filter(r => r.marketId === marketId);
          const hasRate = marketRates.length > 0;
          
          console.log(`Market ${market ? market.name : 'Unknown'} (ID: ${marketId}):`, { 
            hasRate, 
            marketId,
            rateCount: marketRates.length,
            rates: marketRates.map(r => ({
              id: r.id,
              baseRate: r.baseRate,
              currency: r.currency
            }))
          });
          
          this.marketRatesCache.set(marketId, hasRate);
        });
      });
    } catch (error) {
      console.error('Error loading rates:', error);
      this.rates = [];
    }
  }

  openMarketGroupEditor(group?: MarketGroup): void {
    this.selectedMarketGroup = group || null;
    if (group) {
      this.newMarketGroup = { ...group };
    } else {
      this.newMarketGroup = {
        defaultCurrency: '',
        markets: [],
        isActive: true
      };
    }
    this.showMarketGroupEditor = true;
  }

  closeMarketGroupEditor(): void {
    this.showMarketGroupEditor = false;
    this.selectedMarketGroup = null;
    this.newMarketGroup = {
      defaultCurrency: '',
      markets: [],
      isActive: true
    };
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
    if (this.selectedMarketGroup) {
      // Update existing group
      const updatedGroup: MarketGroup = {
        ...this.selectedMarketGroup,
        name: this.newMarketGroup.name || this.selectedMarketGroup.name,
        region: this.newMarketGroup.region || this.selectedMarketGroup.region,
        defaultCurrency: this.newMarketGroup.defaultCurrency || this.selectedMarketGroup.defaultCurrency,
        description: this.newMarketGroup.description,
        isActive: this.newMarketGroup.isActive !== undefined ? this.newMarketGroup.isActive : this.selectedMarketGroup.isActive
      };
      this.hotelService.updateMarketGroup(updatedGroup);
    } else {
      // Create new group
      const newGroup: MarketGroup = {
        id: this.getNextGroupId(),
        name: this.newMarketGroup.name || '',
        region: this.newMarketGroup.region || '',
        markets: this.newMarketGroup.markets || [],
        defaultCurrency: this.newMarketGroup.defaultCurrency || '',
        description: this.newMarketGroup.description,
        isActive: this.newMarketGroup.isActive || true
      };
      this.hotelService.addMarketGroup(newGroup);
    }
    this.closeMarketGroupEditor();
  }

  deleteMarket(marketId: number, group: MarketGroup): void {
    const marketIndex = group.markets.indexOf(marketId);
    if (marketIndex !== -1) {
      // Get the market object to access its currency
      const market = this.getMarketById(marketId);
      if (!market) return;
      
      // Store the currency before removing the market
      const currency = market.currency;
      
      // Remove the market
      group.markets.splice(marketIndex, 1);
      this.hotelService.updateMarketGroups(this.marketGroups);

      // Check and deactivate currency if not used anymore
      this.deactivateUnusedCurrency(currency);
    }
  }

  openMarketEditor(marketId: number | null, group: MarketGroup): void {
    this.selectedMarketGroup = group;
    if (marketId !== null) {
      const market = this.getMarketById(marketId);
      this.selectedMarket = market || null;
      this.newMarket = market ? { ...market } : {};
    } else {
      this.selectedMarket = null;
      this.initializeNewMarket();
    }
    this.showMarketEditor = true;
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

  toggleMarketStatus(marketId: number): void {
    const market = this.getMarketById(marketId);
    if (market) {
      market.isActive = !market.isActive;
      this.hotelService.updateMarket(market);  // Pass the single market object instead of the array
    }
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

  hasRate(marketId: number): boolean {
    if (this.marketRatesCache.has(marketId)) {
      return this.marketRatesCache.get(marketId)!;
    }

    const market = this.getMarketById(marketId);
    if (!market) return false;

    const marketRates = this.rates.filter(r => r.marketId === market.id);
    const hasRate = marketRates.length > 0;
    
    if (marketRates.length > 0) {
      console.log(`Market ${market.name} (ID: ${market.id}):`, {
        ratesCount: marketRates.length,
        marketId: market.id,
        rates: marketRates
      });
    }
    
    this.marketRatesCache.set(marketId, hasRate);
    return hasRate;
  }

  getMarketName(marketId: number): string {
    const market = this.getMarketById(marketId);
    return market?.name || `Market ${marketId}`;
  }

  isMarketActive(marketId: number): boolean {
    const market = this.getMarketById(marketId);
    return market?.isActive || false;
  }

  getMarketCurrency(marketId: number): string {
    const market = this.getMarketById(marketId);
    return market?.currency || '';
  }

  getMarketDescription(marketId: number): string {
    const market = this.getMarketById(marketId);
    return market?.description || '';
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

  addMarketGroup(group: Omit<MarketGroup, 'id'>): void {
    const newId = this.getNextGroupId();
    const newGroup: MarketGroup = {
      id: newId,
      name: group.name,
      region: group.region,
      markets: group.markets || [],
      defaultCurrency: group.defaultCurrency,
      description: group.description,
      isActive: group.isActive ?? true
    };
    this.marketGroups.push(newGroup);
    this.hotelService.updateMarketGroups(this.marketGroups);
    this.loadMarketGroups();
  }

  getNextGroupId(): number {
    const maxId = Math.max(0, ...this.marketGroups.map(g => g.id));
    return maxId + 1;
  }

  updateMarket(marketData: Market): void {
    if (!this.selectedMarketGroup) return;

    const marketIndex = this.selectedMarketGroup.markets.findIndex(id => id === marketData.id);
    if (marketIndex !== -1) {
      // Just update the market ID since we store IDs in the market group
      this.selectedMarketGroup.markets[marketIndex] = marketData.id;
      
      // Update the markets array to include the updated market data
      const marketArrayIndex = this.markets.findIndex(m => m.id === marketData.id);
      if (marketArrayIndex !== -1) {
        this.markets[marketArrayIndex] = marketData;
      }
      
      this.hotelService.updateMarketGroups(this.marketGroups);
      this.closeMarketEditor();
      this.loadMarketGroups();
    }
  }

  addMarket(marketData: Market): void {
    if (!this.selectedMarketGroup) return;

    // Add the market ID to the selected group
    this.selectedMarketGroup.markets.push(marketData.id);
    
    // Add or update the market in the markets array
    const existingIndex = this.markets.findIndex(m => m.id === marketData.id);
    if (existingIndex !== -1) {
      this.markets[existingIndex] = marketData;
    } else {
      this.markets.push(marketData);
    }
    
    this.hotelService.updateMarketGroups(this.marketGroups);
    this.closeMarketEditor();
    this.loadMarketGroups();
  }

  isCurrencyUsedInOtherMarkets(currency: string, excludedMarketId?: number): boolean {
    // Get all market IDs from all groups
    const allMarketIds = this.marketGroups.flatMap(g => g.markets);
    
    // Find markets that use the specified currency
    return this.markets.some(market => 
      allMarketIds.includes(market.id) && 
      market.currency === currency && 
      market.id !== excludedMarketId
    );
  }

  deactivateUnusedCurrency(currency: string): void {
    const currencySetting = this.currencySettings.find(c => c.code === currency);
    if (currencySetting && !this.isCurrencyUsedInOtherMarkets(currency)) {
      currencySetting.isActive = false;
      this.hotelService.updateCurrencySettings(this.currencySettings);
    }
  }

  mapRateToDisplay(r: Rate) {
    return {
      id: r.id,
      marketId: r.marketId,
      seasonId: r.seasonId,
      roomTypeId: r.roomTypeId,
      baseRate: r.baseRate,
      extraAdult: r.extraAdult,
      extraChild: r.extraChild,
      singleOccupancy: r.singleOccupancy,
      currency: r.currency,
      startDate: r.startDate,
      endDate: r.endDate,
      mlos: r.mlos,
      isBlackout: r.isBlackout,
      isActive: r.isActive
    };
  }

  updateRate(rate: Rate) {
    const index = this.rates.findIndex(r => r.id === rate.id);
    if (index !== -1) {
      this.rates[index] = {
        ...rate,
        updatedAt: new Date()
      };
    }
  }

  duplicateRate(rate: Rate) {
    const newRate: Rate = {
      id: 0,  // Use 0 as a temporary ID, backend will assign real ID
      name: `Copy of ${rate.name}`,
      marketId: rate.marketId,
      seasonId: rate.seasonId,
      roomTypeId: rate.roomTypeId,
      contractId: rate.contractId,
      currency: rate.currency,
      amount: rate.amount,
      baseRate: rate.baseRate,
      extraAdult: rate.extraAdult,
      extraChild: rate.extraChild,
      singleOccupancy: rate.singleOccupancy,
      supplements: {
        extraAdult: rate.supplements.extraAdult,
        extraChild: rate.supplements.extraChild,
        singleOccupancy: rate.supplements.singleOccupancy
      },
      ageCategoryRates: { ...rate.ageCategoryRates },
      specialOffers: [...rate.specialOffers]
    };
    this.rates.push(newRate);
  }

  deleteMarketGroup(group: MarketGroup): void {
    const index = this.marketGroups.findIndex(g => g.id === group.id);
    if (index !== -1) {
      this.marketGroups.splice(index, 1);
      this.hotelService.updateMarketGroups(this.marketGroups);
    }
  }
}