import { Component, ElementRef, Input, OnInit, OnDestroy, signal, computed, input, effect } from '@angular/core';
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
import { firstValueFrom, Subject } from 'rxjs';

import { MarketService } from '../../services/market.service';
import { Market, MarketGroup, CurrencySetting, Hotel } from '../../models/types';
import { ModalComponent } from "../modal/modal.component";
import { CurrencyService } from 'src/app/services/currency.service';

@Component({
  selector: 'app-market-config',
  templateUrl: './market-config.component.html',
  styleUrls: ['./market-config.component.scss'],
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
   // Input signals
   hotel = input.required<Hotel>();
  
   // State signals
   markets = signal<Market[]>([]);
   marketGroups = signal<MarketGroup[]>([]);
   currencySettings = signal<CurrencySetting[]>([]);
   selectedMarket = signal<Market | null>(null);
   selectedMarketGroup = signal<MarketGroup | null>(null);
   
   // Modal signals
   showMarketModal = signal(false);
   showGroupModal = signal(false);
   modalTitle = computed(() => {
     if (this.showMarketModal()) {
       return this.selectedMarket() ? 'Edit Market' : 'Add Market';
     }
     return this.selectedMarketGroup() ? 'Edit Region' : 'Add Region';
   });
 
   // Form signals
   marketForm = signal<Partial<Market>>({});
   groupForm = signal<Partial<MarketGroup>>({});
 
   // Computed values
   hasRates = computed(() => {
     return (marketId: number) => {
       const market = this.markets().find(m => m.id === marketId);
       return market?.hasRates || false;
     };
   });

   private destroy$ = new Subject<void>();
 
   constructor(
     private marketService: MarketService,
     private currencyService: CurrencyService
   ) {
     // Setup effects
     effect(() => {
       if (this.hotel()) {
         this.loadMarketData();
       }
     });
   }

   ngOnInit() {
    // Any initialization logic if needed
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
 
   private async loadMarketData() {
    try {
      // Use firstValueFrom to convert observables to promises
      const [markets, groups, currencies] = await Promise.all([
        firstValueFrom(this.marketService.markets$),
        firstValueFrom(this.marketService.marketGroups$),
        firstValueFrom(this.currencyService.getCurrencySettings())
      ]);
      
      this.markets.set(markets);
      this.marketGroups.set(groups);
      this.currencySettings.set(currencies);
    } catch (error) {
      console.error('Error loading market data:', error);
    }
  }
 
   // Modal handlers
   openMarketModal(market?: Market, group?: MarketGroup) {
     this.selectedMarket.set(market || null);
     this.selectedMarketGroup.set(group || null);
     this.marketForm.set(market ? { ...market } : { 
       groupId: group?.id,
       currency: group?.defaultCurrency
     });
     this.showMarketModal.set(true);
   }
 
   openGroupModal(group?: MarketGroup) {
    this.selectedMarketGroup.set(group || null);
    this.groupForm.set(group ? { ...group } : {});
    this.showGroupModal.set(true);
  }
 
  closeModals() {
    this.showMarketModal.set(false);
    this.showGroupModal.set(false);
    this.selectedMarket.set(null);
    this.selectedMarketGroup.set(null);
    this.marketForm.set({});
    this.groupForm.set({});
  }

  // Helper methods for market data
  getMarketCurrency(marketId: number): string {
    const market = this.markets().find(m => m.id === marketId);
    return market?.currency || '';
  }

  getMarketDescription(marketId: number): string {
    const market = this.markets().find(m => m.id === marketId);
    return market?.description || '';
  }

  getMarket(marketId: number): Market | undefined {
    return this.markets().find(m => m.id === marketId);
  }

  getMarketName(marketId: number): string {
    const market = this.markets().find(m => m.id === marketId);
    return market?.name || '';
  }
 
   // Save handlers
   async saveMarket(formData: Partial<Market>) {
    try {
      // Ensure all required properties are present
      const newMarket: Omit<Market, 'id'> = {
        name: formData.name || '', // Provide default value
        code: formData.code || '',
        isActive: formData.isActive ?? true, // Provide default value
        currency: formData.currency || '',
        region: formData.region || '',
        description: formData.description, // Optional field can be undefined
        groupId: formData.groupId,        // Optional field can be undefined
        hasRates: formData.hasRates ?? false // Provide default value
      };
  
      const result = this.selectedMarket() 
        ? await this.marketService.updateMarket(this.selectedMarket()!.id, formData)
        : await this.marketService.createMarket(newMarket);
      
    } catch (error) {
      console.error('Error saving market:', error);
    }
  }
 
  async saveMarketGroup(formData: Partial<MarketGroup>) {
    try {
      // Create a complete MarketGroup object without the id
      const newMarketGroup: Omit<MarketGroup, 'id'> = {
        name: formData.name || '',
        region: formData.region || '',
        markets: formData.markets || [], // Provide empty array as default
        defaultCurrency: formData.defaultCurrency || '',
        description: formData.description, // Optional field can remain undefined
        isActive: formData.isActive ?? true // Default to true if undefined
      };
  
      const result = this.selectedMarketGroup()
        ? await this.marketService.updateMarketGroup(this.selectedMarketGroup()!.id, formData)
        : await this.marketService.createMarketGroup(newMarketGroup);
      
      this.marketGroups.update(groups =>
        this.selectedMarketGroup()
          ? groups.map(g => g.id === result.id ? result : g)
          : [...groups, result]
      );
      
      this.closeModals();
    } catch (error) {
      console.error('Error saving market group:', error);
    }
  }
  
 }