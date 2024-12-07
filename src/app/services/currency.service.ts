import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CurrencySetting } from '../models/types';
import { currencySettings as defaultCurrencySettings } from '../../data';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currencySettings: CurrencySetting[] = [];
  private currencySettingsSubject = new BehaviorSubject<CurrencySetting[]>([]);

  constructor() {
    // Initialize with default currencies from data.ts
    this.currencySettings = [...defaultCurrencySettings];
    this.currencySettingsSubject.next(this.currencySettings);
  }

  getCurrencySettings(): Observable<CurrencySetting[]> {
    return this.currencySettingsSubject.asObservable();
  }

  getCurrentCurrencySettings(): CurrencySetting[] {
    return this.currencySettings;
  }

  addCurrency(currency: Omit<CurrencySetting, 'isActive'>): void {
    // Validate currency code uniqueness
    if (this.currencySettings.some(c => c.code === currency.code)) {
      throw new Error(`Currency with code ${currency.code} already exists`);
    }

    // Add new currency (initially inactive)
    const newCurrency: CurrencySetting = {
      ...currency,
      isActive: false
    };

    this.currencySettings.push(newCurrency);
    this.currencySettingsSubject.next(this.currencySettings);
  }

  updateCurrency(currency: CurrencySetting): void {
    // Cannot update active currencies
    const existingCurrency = this.currencySettings.find(c => c.code === currency.code);
    if (existingCurrency?.isActive) {
      throw new Error('Cannot update an active currency');
    }

    // Find and update currency
    const index = this.currencySettings.findIndex(c => c.code === currency.code);
    if (index === -1) {
      throw new Error('Currency not found');
    }

    // Preserve active status
    this.currencySettings[index] = {
      ...currency,
      isActive: this.currencySettings[index].isActive
    };

    this.currencySettingsSubject.next(this.currencySettings);
  }

  deleteCurrency(currency: CurrencySetting): void {
    // Cannot delete active currencies
    if (currency.isActive) {
      throw new Error('Cannot delete an active currency');
    }

    // Find and remove currency
    const index = this.currencySettings.findIndex(c => c.code === currency.code);
    if (index === -1) {
      throw new Error('Currency not found');
    }

    this.currencySettings.splice(index, 1);
    this.currencySettingsSubject.next(this.currencySettings);
  }

  updateCurrencyStatuses(activeMarkets: { currency: string }[]): void {
    // Reset all currencies to inactive
    this.currencySettings.forEach(currency => {
      currency.isActive = false;
    });

    // Set currencies to active based on market usage
    activeMarkets.forEach(market => {
      const currency = this.currencySettings.find(c => c.code === market.currency);
      if (currency) {
        currency.isActive = true;
      }
    });

    this.currencySettingsSubject.next(this.currencySettings);
  }

  getCurrencyByCode(code: string): CurrencySetting | undefined {
    return this.currencySettings.find(c => c.code === code);
  }

  isCurrencyActive(code: string): boolean {
    return this.currencySettings.some(c => c.code === code && c.isActive);
  }

  updateCurrencySettings(settings: CurrencySetting[]): void {
    this.currencySettings = settings;
    this.currencySettingsSubject.next(this.currencySettings);
  }
}
