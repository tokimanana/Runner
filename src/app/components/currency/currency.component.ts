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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalComponent } from '../modal/modal.component';
import { Subscription } from 'rxjs';

import { CurrencyService } from '../../services/currency.service';
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
    MatProgressSpinnerModule,
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
    isActive: false
  };
  private subscriptions: Subscription[] = [];
  modalMessage = '';
  modalError = false;
  isLoading = false;

  @ViewChild('firstInput') firstInput!: ElementRef;

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.loadCurrencySettings();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCurrencySettings(): void {
    this.isLoading = true;
    this.subscriptions.push(
      this.currencyService.getCurrencySettings().subscribe({
        next: (settings) => {
          this.currencySettings = settings;
          this.isLoading = false;
        },
        error: (error: Error) => {
          console.error('Error loading currency settings:', error);
          this.showError('Failed to load currency settings. Please try again.');
          this.isLoading = false;
        }
      })
    );
  }

  openCurrencyEditor(currency?: CurrencySetting): void {
    if (currency?.isActive) {
      this.showError('Cannot edit an active currency. Please deactivate it in all markets first.');
      return;
    }

    this.selectedCurrency = currency || null;
    this.newCurrency = currency ? { ...currency } : {
      code: '',
      symbol: '',
      name: '',
      isActive: false
    };
    this.showCurrencyEditor = true;
    
    setTimeout(() => {
      if (this.firstInput) {
        this.firstInput.nativeElement.focus();
      }
    });
  }

  saveCurrency(): void {
    try {
      const newCurrency = { ...this.newCurrency } as CurrencySetting;
      
      if (this.selectedCurrency) {
        this.currencyService.updateCurrency(newCurrency);
      } else {
        this.currencyService.addCurrency(newCurrency);
      }

      this.showSuccess(`Currency ${this.selectedCurrency ? 'updated' : 'added'} successfully`);
      this.closeCurrencyEditor();
      this.loadCurrencySettings();
    } catch (error) {
      console.error('Error saving currency:', error);
      this.showError(error instanceof Error ? error.message : 'Failed to save currency');
    }
  }

  deleteCurrency(currency: CurrencySetting): void {
    if (currency.isActive) {
      this.showError('Cannot delete an active currency. Please deactivate it in all markets first.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${currency.name}?`)) {
      try {
        this.currencyService.deleteCurrency(currency);
        this.showSuccess('Currency deleted successfully');
        this.loadCurrencySettings();
      } catch (error) {
        console.error('Error deleting currency:', error);
        this.showError(error instanceof Error ? error.message : 'Failed to delete currency');
      }
    }
  }

  updateCurrencyStatus(currency: CurrencySetting): void {
    try {
      const updatedCurrency = {
        ...currency,
        isActive: !currency.isActive
      };

      this.currencyService.updateCurrency(updatedCurrency);
      this.showSuccess(`Currency ${updatedCurrency.isActive ? 'activated' : 'deactivated'} successfully`);
      this.loadCurrencySettings();
    } catch (error) {
      console.error('Error updating currency status:', error);
      this.showError(error instanceof Error ? error.message : 'Failed to update currency status');
    }
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

  showSuccess(message: string): void {
    this.modalMessage = message;
    this.modalError = false;
    setTimeout(() => {
      this.modalMessage = '';
    }, 3000);
  }

  showError(message: string): void {
    this.modalMessage = message;
    this.modalError = true;
    setTimeout(() => {
      this.modalMessage = '';
      this.modalError = false;
    }, 3000);
  }
}