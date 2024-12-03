import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModalComponent } from '../modal/modal.component';
import { Subscription } from 'rxjs';

import { HotelService } from '../../services/hotel.service';
import { CurrencySetting, Hotel } from '../../models/types';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    ModalComponent
  ]
})
export class CurrencyComponent implements OnInit, OnDestroy {
  @Input() hotel!: Hotel;
  
  currencySettings: CurrencySetting[] = [];
  displayedColumns: string[] = ['code', 'symbol', 'name', 'status', 'actions'];
  showCurrencyEditor = false;
  selectedCurrency: CurrencySetting | null = null;
  newCurrency: Partial<CurrencySetting> = {
    code: '',
    symbol: '',
    name: '',
    isActive: true
  };
  private subscription: Subscription;

  @ViewChild('firstInput') firstInput!: ElementRef;

  constructor(private hotelService: HotelService) {
    this.subscription = this.hotelService.getCurrencySettings().subscribe(settings => {
      this.currencySettings = settings;
    });
  }

  ngOnInit(): void {
    this.loadCurrencySettings();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadCurrencySettings(): void {
    this.currencySettings = this.hotelService.getCurrentCurrencySettings();
  }

  openCurrencyEditor(currency?: CurrencySetting): void {
    if (currency) {
      // Cannot edit active currencies
      if (currency.isActive) {
        alert('Cannot edit an active currency. Remove it from all markets first.');
        return;
      }
      this.selectedCurrency = currency;
      this.newCurrency = { ...currency };
    } else {
      this.selectedCurrency = null;
      this.newCurrency = {
        code: '',
        symbol: '',
        name: '',
        isActive: false
      };
    }
    this.showCurrencyEditor = true;
    
    // Focus the first input after the modal is shown
    setTimeout(() => {
      if (this.firstInput) {
        this.firstInput.nativeElement.focus();
      }
    });
  }

  closeCurrencyEditor(): void {
    this.showCurrencyEditor = false;
    this.selectedCurrency = null;
    this.newCurrency = {
      code: '',
      symbol: '',
      name: '',
      isActive: true
    };
  }

  saveCurrency(): void {
    try {
      // Validate required fields
      if (!this.newCurrency.code || !this.newCurrency.name || !this.newCurrency.symbol) {
        throw new Error('All currency fields are required');
      }

      // Validate currency code format (3 uppercase letters)
      if (!/^[A-Z]{3}$/.test(this.newCurrency.code)) {
        throw new Error('Currency code must be 3 uppercase letters');
      }

      if (this.selectedCurrency) {
        // Update existing currency
        const index = this.currencySettings.findIndex(c => c.code === this.selectedCurrency?.code);
        if (index === -1) {
          throw new Error('Currency not found');
        }
        this.currencySettings = [
          ...this.currencySettings.slice(0, index),
          { ...this.newCurrency as CurrencySetting },
          ...this.currencySettings.slice(index + 1)
        ];
      } else {
        // Check for duplicate currency code
        if (this.currencySettings.some(c => c.code === this.newCurrency.code)) {
          throw new Error('Currency code already exists');
        }
        // Add new currency with generated ID
        const newId = Math.max(...this.currencySettings.map(c => c.id ?? 0), 0) + 1;
        this.currencySettings = [
          ...this.currencySettings,
          { ...this.newCurrency, id: newId } as CurrencySetting
        ];
      }
      
      this.hotelService.updateCurrencySettings([...this.currencySettings]);
      this.closeCurrencyEditor();
    } catch (error) {
      console.error('Failed to save currency:', error);
      alert(error instanceof Error ? error.message : 'Failed to save currency');
    }
  }

  updateCurrencyStatus(currency: CurrencySetting): void {
    try {
      // Prevent deactivating the last active currency
      if (currency.isActive && this.currencySettings.filter(c => c.isActive).length <= 1) {
        throw new Error('At least one currency must remain active');
      }

      const index = this.currencySettings.findIndex(c => c.code === currency.code);
      if (index === -1) {
        throw new Error('Currency not found');
      }

      this.currencySettings = [
        ...this.currencySettings.slice(0, index),
        { ...currency, isActive: !currency.isActive },
        ...this.currencySettings.slice(index + 1)
      ];

      this.hotelService.updateCurrencySettings([...this.currencySettings]);
    } catch (error) {
      console.error('Failed to update currency status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update currency status');
    }
  }

  deleteCurrency(currency: CurrencySetting): void {
    if (confirm(`Are you sure you want to delete ${currency.name}?`)) {
      try {
        this.hotelService.deleteCurrency(currency);
        // No need to manually update currencySettings as it will be updated through the subscription
      } catch (error) {
        console.error('Failed to delete currency:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete currency');
      }
    }
  }
}