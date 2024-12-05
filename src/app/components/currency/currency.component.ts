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
  private subscriptions: Subscription[] = [];
  modalMessage = '';
  modalError = false;

  @ViewChild('firstInput') firstInput!: ElementRef;

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    // Subscribe to currency settings changes
    this.subscriptions.push(
      this.hotelService.getCurrencySettings().subscribe(settings => {
        this.currencySettings = settings;
        console.log('Currency settings updated:', settings.length, 'currencies');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCurrencySettings(): void {
    this.currencySettings = this.hotelService.getCurrentCurrencySettings();
  }

  openCurrencyEditor(currency?: CurrencySetting): void {
    if (currency) {
      // Cannot edit active currencies
      if (currency.isActive) {
        this.showError('Cannot edit an active currency. Remove it from all markets first.');
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

      let updatedSettings: CurrencySetting[];
      if (this.selectedCurrency) {
        // Update existing currency
        updatedSettings = this.currencySettings.map(c => 
          c.id === this.selectedCurrency?.id ? { ...this.newCurrency, id: c.id } as CurrencySetting : c
        );
      } else {
        // Add new currency with generated ID
        const newId = Math.max(...this.currencySettings.map(c => c.id ?? 0), 0) + 1;
        const newCurrency = { ...this.newCurrency, id: newId } as CurrencySetting;
        updatedSettings = [...this.currencySettings, newCurrency];
      }

      this.hotelService.updateCurrencySettings(updatedSettings);
      this.showSuccess(`Currency ${this.selectedCurrency ? 'updated' : 'added'} successfully`);
      this.closeCurrencyEditor();
    } catch (error) {
      console.error('Error saving currency:', error);
      this.showError(error instanceof Error ? error.message : 'Failed to save currency');
    }
  }

  deleteCurrency(currency: CurrencySetting): void {
    if (currency.isActive) {
      this.showError('Cannot delete an active currency. Remove it from all markets first.');
      return;
    }

    const updatedSettings = this.currencySettings.filter(c => c.id !== currency.id);
    this.hotelService.updateCurrencySettings(updatedSettings);
    this.showSuccess('Currency deleted successfully');
  }

  updateCurrencyStatus(currency: CurrencySetting): void {
    try {
      // Prevent deactivating the last active currency
      if (!currency.isActive && this.currencySettings.filter(c => c.isActive).length <= 1) {
        throw new Error('Cannot deactivate the last active currency');
      }

      const index = this.currencySettings.findIndex(c => c.id === currency.id);
      if (index === -1) {
        throw new Error('Currency not found');
      }

      const updatedSettings = [
        ...this.currencySettings.slice(0, index),
        { ...currency, isActive: !currency.isActive },
        ...this.currencySettings.slice(index + 1)
      ];

      this.hotelService.updateCurrencySettings(updatedSettings);
      this.showSuccess(`Currency ${currency.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error updating currency status:', error);
      this.showError(error instanceof Error ? error.message : 'Failed to update currency status');
    }
  }

  private showSuccess(message: string): void {
    this.modalMessage = message;
    this.modalError = false;
    setTimeout(() => {
      this.modalMessage = '';
    }, 3000);
  }

  private showError(message: string): void {
    this.modalMessage = message;
    this.modalError = true;
    setTimeout(() => {
      this.modalMessage = '';
    }, 3000);
  }

  closeCurrencyEditor(): void {
    this.showCurrencyEditor = false;
    this.selectedCurrency = null;
    this.newCurrency = {
      code: '',
      symbol: '',
      name: '',
      isActive: false
    };
  }
}