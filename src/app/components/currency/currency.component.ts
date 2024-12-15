import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, inject, signal, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalComponent } from '../modal/modal.component';
import { firstValueFrom, Subject, Subscription } from 'rxjs';

import { CurrencyService } from '../../services/currency.service';
import { CurrencySetting, Hotel } from '../../models/types';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';

interface CurrencyField {
  key: keyof CurrencySetting;  // This ensures key can only be valid CurrencySetting properties
  label: string;
  type: string;
  required?: boolean;
}

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatMenuModule,
    ModalComponent
  ]
})
export class CurrencyComponent implements OnInit, OnDestroy {
  @Input({ required: true }) show!: boolean;
  @Input({ required: true }) hotel!: Hotel;
  @Input() title: string = '';
  @Output() close = new EventEmitter<void>();
  
  private currencyService = inject(CurrencyService);
  private destroy$ = new Subject<void>();
  
  // Signals
  currencySettings = signal<CurrencySetting[]>([]);
  showCurrencyEditor = signal(false);
  selectedCurrency = signal<CurrencySetting | null>(null);
  modalMessage = signal('');
  modalError = signal(false);
  showEditor = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  modalInitialValues = signal<Partial<CurrencySetting>>({
    code: '',
    symbol: '',
    name: '',
    isActive: false
  });



  // Component properties
  displayedColumns = ['code', 'symbol', 'name', 'status', 'actions'];
  
  currencyFormFields: CurrencyField[] = [
    { key: 'code', label: 'Currency Code', type: 'text', required: true },
    { key: 'symbol', label: 'Symbol', type: 'text', required: true },
    { key: 'name', label: 'Currency Name', type: 'text', required: true },
  ];

  constructor() {
    this.loadCurrencySettings();
  }

  ngOnInit() {
    // Initialize your component here
    this.loadCurrencySettings();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadCurrencySettings() {
    try {
      const settings = await firstValueFrom(this.currencyService.getCurrencySettings());
      this.currencySettings.set(settings);
    } catch (error) {
      console.error('Error loading currency settings:', error);
      this.showError('Failed to load currency settings');
    }
  }

  openCurrencyEditor(currency?: CurrencySetting) {
    if (currency?.isActive) {
      this.showError('Cannot edit an active currency. Please deactivate it in all markets first.');
      return;
    }

    this.selectedCurrency.set(currency || null);
    this.modalInitialValues.set(currency ? { ...currency } : {
      code: '',
      symbol: '',
      name: '',
      isActive: false
    });
    this.showCurrencyEditor.set(true);
  }

  closeCurrencyEditor() {
    this.showCurrencyEditor.set(false);
    this.selectedCurrency.set(null);
    this.modalInitialValues.set({
      code: '',
      symbol: '',
      name: '',
      isActive: false
    });
  }

  async saveCurrency(formData: Partial<CurrencySetting>) {
    try {
      if (this.selectedCurrency()) {
        await this.currencyService.updateCurrency({
          ...this.selectedCurrency()!,
          ...formData
        });
      } else {
        await this.currencyService.addCurrency(formData as CurrencySetting);
      }
      
      this.showSuccess(`Currency ${this.selectedCurrency() ? 'updated' : 'added'} successfully`);
      this.showCurrencyEditor();
      this.loadCurrencySettings();
    } catch (error) {
      console.error('Error saving currency:', error);
      this.showError(error instanceof Error ? error.message : 'Failed to save currency');
    }
  }
  

  async toggleCurrencyStatus(currency: CurrencySetting) {
    try {
      const updatedCurrency = { ...currency, isActive: !currency.isActive };
      await this.currencyService.updateCurrency(updatedCurrency);
      this.showSuccess(`Currency ${updatedCurrency.isActive ? 'activated' : 'deactivated'} successfully`);
      this.loadCurrencySettings();
    } catch (error) {
      console.error('Error updating currency status:', error);
      this.showError(error instanceof Error ? error.message : 'Failed to update currency status');
    }
  }

  async deleteCurrency(currency: CurrencySetting) {
    if (currency.isActive) {
      this.showError('Cannot delete an active currency. Please deactivate it in all markets first.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${currency.name}?`)) {
      try {
        await this.currencyService.deleteCurrency(currency);
        this.showSuccess('Currency deleted successfully');
        this.loadCurrencySettings();
      } catch (error) {
        console.error('Error deleting currency:', error);
        this.showError(error instanceof Error ? error.message : 'Failed to delete currency');
      }
    }
  }

  private showSuccess(message: string) {
    this.modalMessage.set(message);
    this.modalError.set(false);
    setTimeout(() => this.modalMessage.set(''), 3000);
  }

  private showError(message: string) {
    this.modalMessage.set(message);
    this.modalError.set(true);
    setTimeout(() => {
      this.modalMessage.set('');
      this.modalError.set(false);
    }, 3000);
  }

  
}
