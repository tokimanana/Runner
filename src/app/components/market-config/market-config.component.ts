import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { MarketService } from '../../services/market.service';
import { Market, MarketGroup, CurrencySetting } from '../../models/types';
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
  markets: Market[] = [];
  marketGroups: MarketGroup[] = [];
  currencySettings: CurrencySetting[] = [];
  showMarketEditor = false;
  showMarketGroupEditor = false;
  selectedMarket: Market | null = null;
  selectedMarketGroup: MarketGroup | null = null;
  newMarket: Partial<Market> = {};
  newMarketGroup: Partial<MarketGroup> = {};
  
  private destroy$ = new Subject<void>();

  constructor(private marketService: MarketService) {}

  ngOnInit() {
    // Subscribe to markets
    this.marketService.getMarkets()
      .pipe(takeUntil(this.destroy$))
      .subscribe(markets => this.markets = markets);

    // Subscribe to market groups
    this.marketService.getMarketGroups()
      .pipe(takeUntil(this.destroy$))
      .subscribe(groups => this.marketGroups = groups);

    // Subscribe to currency settings
    this.marketService.getCurrencySettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => this.currencySettings = settings);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Market Operations
  openMarketEditor(marketId: number | null = null, group?: MarketGroup) {
    if (marketId) {
      this.marketService.getMarket(marketId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(market => {
          this.selectedMarket = market;
          this.newMarket = market ? { ...market } : {};
        });
    } else {
      this.selectedMarket = null;
      this.newMarket = {
        groupId: group?.id // Set the group ID when creating a new market
      };
    }
    this.selectedMarketGroup = group || null;
    this.showMarketEditor = true;
  }

  closeMarketEditor() {
    this.showMarketEditor = false;
    this.selectedMarket = null;
    this.newMarket = {};
  }

  saveMarket() {
    if (!this.newMarket || !this.selectedMarketGroup) return;

    const market: Market = {
      ...this.newMarket as Market,
      groupId: this.selectedMarketGroup.id,
      currency: this.selectedMarketGroup.defaultCurrency // Use group's currency
    };

    const operation = market.id
      ? this.marketService.updateMarket(market)
      : this.marketService.addMarket(market);

    operation
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.closeMarketEditor(),
        error: (error) => console.error('Error saving market:', error)
      });
  }

  // Market Group Operations
  openMarketGroupEditor(group: MarketGroup | null = null) {
    this.selectedMarketGroup = group;
    this.newMarketGroup = group ? { ...group } : {};
    this.showMarketGroupEditor = true;
  }

  closeMarketGroupEditor() {
    this.showMarketGroupEditor = false;
    this.selectedMarketGroup = null;
    this.newMarketGroup = {};
  }

  saveMarketGroup() {
    if (!this.newMarketGroup?.name || !this.newMarketGroup?.defaultCurrency) return;

    const operation = this.selectedMarketGroup
      ? this.marketService.updateMarketGroup(this.newMarketGroup as MarketGroup)
      : this.marketService.addMarketGroup(this.newMarketGroup);

    operation
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.closeMarketGroupEditor(),
        error: (error) => console.error('Error saving market group:', error)
      });
  }

  deleteMarketGroup(group: MarketGroup) {
    if (confirm(`Are you sure you want to delete the region "${group.name}"?`)) {
      this.marketService.deleteMarketGroup(group.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (error) => console.error('Error deleting market group:', error)
        });
    }
  }

  deleteMarket(market: Market | number) {
    const marketId = typeof market === 'number' ? market : market.id;
    const marketName = typeof market === 'number' 
      ? this.getMarketName(market)
      : market.name;

    if (confirm(`Are you sure you want to delete the market "${marketName}"?`)) {
      this.marketService.deleteMarket(marketId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.markets = this.markets.filter(m => m.id !== marketId);
          },
          error: (error) => console.error('Error deleting market:', error)
        });
    }
  }

  // Helper Methods
  getMarketName(marketId: number): string {
    return this.marketService.getMarketName(marketId);
  }

  getMarketCurrency(marketId: number): string {
    return this.marketService.getMarketCurrency(marketId);
  }

  hasRate(marketId: number): boolean {
    const market = this.markets.find(m => m.id === marketId);
    return market?.hasRates || false;
  }

  isMarketActive(marketId: number): boolean {
    const market = this.markets.find(m => m.id === marketId);
    return market?.isActive || false;
  }

  toggleMarketStatus(marketId: number) {
    const market = this.markets.find(m => m.id === marketId);
    if (market) {
      market.isActive = !market.isActive;
      this.marketService.updateMarket(market).subscribe();
    }
  }

  getMarketDescription(marketId: number): string {
    const market = this.markets.find(m => m.id === marketId);
    return market?.description || '';
  }

  onMarketSelect(market: Market) {
    this.selectedMarket = market;
  }
}