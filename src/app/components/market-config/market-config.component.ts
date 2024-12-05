import { Component, ElementRef, Input, OnInit, OnChanges, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
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
import { RouterModule } from '@angular/router'; 
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Subscription } from 'rxjs';

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
    RouterModule,
    ModalComponent
  ]
})
export class MarketConfigComponent implements OnInit, OnDestroy {
  @Input() hotel!: Hotel;
  
  marketGroups: MarketGroup[] = [];
  markets: Market[] = [];
  currencySettings: CurrencySetting[] = [];
  showMarketEditor = false;
  showMarketGroupEditor = false;
  selectedMarket: Market | null = null;
  selectedMarketGroup: MarketGroup | null = null;
  newMarket: Partial<Market> = {};
  newMarketGroup: Partial<MarketGroup> = {};
  private subscriptions: Subscription[] = [];
  private rates: Rate[] = [];
  private marketRatesCache = new Map<number, boolean>();

  constructor(
    private hotelService: HotelService,
    private router: Router
  ) {
    // Subscribe to currency settings changes
    this.subscriptions.push(
      this.hotelService.getCurrencySettings().subscribe(settings => {
        this.currencySettings = settings;
      }),
      // Subscribe to rates changes
      this.hotelService.getAllRates().subscribe(rates => {
        this.rates = rates;
      })
    );
  }

  async ngOnInit() {
    await this.loadData();
  }

  private async loadData() {
    if (this.hotel) {
      this.markets = this.hotelService.getMarketsForHotel(this.hotel.id);
      this.marketGroups = await firstValueFrom(this.hotelService.getMarketGroups());
      this.currencySettings = this.hotelService.getCurrentCurrencySettings();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hotel'] && this.hotel) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getMarketById(marketId: number): Market | undefined {
    return this.markets.find(m => m.id === marketId);
  }

  getMarketName(marketId: number): string {
    return this.getMarketById(marketId)?.name || '';
  }

  getMarketCurrency(marketId: number): string {
    return this.getMarketById(marketId)?.currency || '';
  }

  getMarketDescription(marketId: number): string {
    return this.getMarketById(marketId)?.description || '';
  }

  isMarketActive(marketId: number): boolean {
    return this.getMarketById(marketId)?.isActive || false;
  }

  hasRate(marketId: number): boolean {
    if (this.marketRatesCache.has(marketId)) {
      return this.marketRatesCache.get(marketId)!;
    }
    const hasRate = this.rates.some((rate: Rate) => rate.marketId === marketId);
    this.marketRatesCache.set(marketId, hasRate);
    return hasRate;
  }

  toggleMarketStatus(marketId: number): void {
    const market = this.getMarketById(marketId);
    if (market) {
      market.isActive = !market.isActive;
      this.hotelService.updateMarket(market);
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
      this.newMarket = {
        name: '',
        code: '',
        currency: group.defaultCurrency, // Always use group's currency
        region: group.name,
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
    if (!this.newMarket.name || !this.selectedMarketGroup) {
      alert('Market name is required');
      return;
    }

    try {
      const marketData: Market = {
        id: this.selectedMarket?.id || Math.max(0, ...this.markets.map(m => m.id)) + 1,
        name: this.newMarket.name,
        code: this.generateCode(this.newMarket.name),
        currency: this.selectedMarketGroup.defaultCurrency, // Always use group's currency
        region: this.selectedMarketGroup.name,
        description: this.newMarket.description || '',
        isActive: this.newMarket.isActive ?? true
      };

      if (this.selectedMarket) {
        this.hotelService.updateMarket(marketData);
      } else {
        this.hotelService.addMarket(marketData);
        // Add market to the group
        this.selectedMarketGroup.markets.push(marketData.id);
        this.hotelService.updateMarketGroup(this.selectedMarketGroup);
      }

      this.closeMarketEditor();
      this.loadData();
    } catch (error) {
      console.error('Failed to save market:', error);
      alert(error instanceof Error ? error.message : 'Failed to save market');
    }
  }

  openMarketGroupEditor(group?: MarketGroup): void {
    if (group) {
      this.selectedMarketGroup = group;
      this.newMarketGroup = { ...group };
    } else {
      this.selectedMarketGroup = null;
      this.newMarketGroup = {
        name: '',
        region: '',
        markets: [],
        defaultCurrency: '',
        isActive: true
      };
    }
    this.showMarketGroupEditor = true;
  }

  closeMarketGroupEditor(): void {
    this.showMarketGroupEditor = false;
    this.selectedMarketGroup = null;
    this.newMarketGroup = {};
  }

  saveMarketGroup(): void {
    if (!this.newMarketGroup.name?.trim() || !this.newMarketGroup.defaultCurrency) {
      alert('Name and default currency are required');
      return;
    }

    try {
      const groupData: MarketGroup = {
        id: this.selectedMarketGroup?.id || Math.max(0, ...this.marketGroups.map(g => g.id)) + 1,
        name: this.newMarketGroup.name.trim(),
        region: this.newMarketGroup.region || this.newMarketGroup.name.trim(),
        markets: this.newMarketGroup.markets || [],
        defaultCurrency: this.newMarketGroup.defaultCurrency,
        isActive: this.newMarketGroup.isActive ?? true
      };

      if (this.selectedMarketGroup) {
        this.hotelService.updateMarketGroup(groupData);
      } else {
        this.hotelService.addMarketGroup(groupData);
      }

      this.closeMarketGroupEditor();
      this.loadData();
    } catch (error) {
      console.error('Failed to save market group:', error);
      alert(error instanceof Error ? error.message : 'Failed to save market group');
    }
  }

  deleteMarket(marketId: number, group: MarketGroup): void {
    const market = this.getMarketById(marketId);
    if (!market) return;

    if (this.hasRate(marketId)) {
      alert('Cannot delete market with existing rates');
      return;
    }

    if (confirm(`Are you sure you want to delete ${market.name}?`)) {
      try {
        // Remove market from group
        group.markets = group.markets.filter(id => id !== marketId);
        this.hotelService.updateMarketGroup(group);
        
        // Delete market
        this.hotelService.deleteMarket(marketId);
        this.loadData();
      } catch (error) {
        console.error('Failed to delete market:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete market');
      }
    }
  }

  deleteMarketGroup(group: MarketGroup): void {
    if (group.markets.length > 0) {
      alert('Cannot delete region with markets. Please delete or move all markets first.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${group.name}?`)) {
      try {
        this.hotelService.deleteMarketGroup(group.id);
        this.loadData();
      } catch (error) {
        console.error('Failed to delete market group:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete market group');
      }
    }
  }

  private generateCode(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .substring(0, 10);
  }
}