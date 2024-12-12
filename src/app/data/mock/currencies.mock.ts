// src/data/mock/currencies.mock.ts
import { CurrencySetting } from '../../models/types';

export const currencySettings: CurrencySetting[] = [
  {
    id: 1,
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
    isActive: true
  },
  {
    id: 2,
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
    isActive: true
  },
  {
    id: 3,
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
    isActive: true
  },
  {
    id: 4,
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimals: 0,
    isActive: false
  },
  {
    id: 5,
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    decimals: 2,
    isActive: false
  },
  {
    id: 6,
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    decimals: 2,
    isActive: false
  },
  {
    id: 7,
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    decimals: 2,
    isActive: false
  },
  {
    id: 8,
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    decimals: 2,
    isActive: false
  }
];

// Optional: Export helper functions for currency operations
export const getActiveCurrencies = () => 
  currencySettings.filter(currency => currency.isActive);

export const getCurrencyByCode = (code: string) =>
  currencySettings.find(currency => currency.code === code);

