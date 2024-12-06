import { Injectable } from '@angular/core';
import { Market, MarketGroup, CurrencySetting } from '../models/types';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { defaultMarkets, defaultMarketGroups } from '../../data';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private markets = new BehaviorSubject<Market[]>([]);
  private marketGroups = new BehaviorSubject<MarketGroup[]>([]);
  private currencySettings = new BehaviorSubject<CurrencySetting[]>([]);

  constructor() {
    // Initialize with data from data.ts
    this.markets.next(defaultMarkets);
    this.marketGroups.next(defaultMarketGroups);
  }

  // Currency Operations
  setCurrencySettings(settings: CurrencySetting[]) {
    this.currencySettings.next(settings);
  }

  getCurrencySettings(): Observable<CurrencySetting[]> {
    return this.currencySettings.pipe(
      map(settings => settings.filter(s => s.isActive))
    );
  }

  // Market Group Operations
  getMarketGroups(): Observable<MarketGroup[]> {
    return this.marketGroups.asObservable();
  }

  addMarketGroup(group: Partial<MarketGroup>): Observable<MarketGroup> {
    if (!group.name || !group.defaultCurrency) {
      throw new Error('Name and default currency are required');
    }

    const currentGroups = this.marketGroups.value;
    const newGroup: MarketGroup = {
      id: Math.max(0, ...currentGroups.map(g => g.id)) + 1,
      name: group.name,
      region: group.name, // Region same as name by default
      markets: [],
      defaultCurrency: group.defaultCurrency,
      description: group.description || '',
      isActive: true
    };

    this.marketGroups.next([...currentGroups, newGroup]);
    return new Observable(subscriber => {
      subscriber.next(newGroup);
      subscriber.complete();
    });
  }

  updateMarketGroup(group: MarketGroup): Observable<MarketGroup> {
    if (!group.name || !group.defaultCurrency) {
      throw new Error('Name and default currency are required');
    }

    const currentGroups = this.marketGroups.value;
    const index = currentGroups.findIndex(g => g.id === group.id);
    if (index === -1) {
      throw new Error('Market group not found');
    }

    // Update all markets in this group to use the new currency
    const currentMarkets = this.markets.value;
    const updatedMarkets = currentMarkets.map(market => {
      if (group.markets.includes(market.id)) {
        return { ...market, currency: group.defaultCurrency };
      }
      return market;
    });

    currentGroups[index] = group;
    this.marketGroups.next([...currentGroups]);
    this.markets.next(updatedMarkets);

    return new Observable(subscriber => {
      subscriber.next(group);
      subscriber.complete();
    });
  }

  deleteMarketGroup(groupId: number): Observable<void> {
    const currentGroups = this.marketGroups.value;
    const group = currentGroups.find(g => g.id === groupId);
    
    if (!group) {
      throw new Error('Market group not found');
    }

    if (group.markets.length > 0) {
      throw new Error('Cannot delete region with active markets');
    }

    this.marketGroups.next(currentGroups.filter(g => g.id !== groupId));
    return new Observable(subscriber => {
      subscriber.next();
      subscriber.complete();
    });
  }

  // Market Operations
  getMarkets(): Observable<Market[]> {
    return this.markets.asObservable();
  }

  getMarket(marketId: number): Observable<Market | null> {
    return this.markets.pipe(
      map(markets => markets.find(m => m.id === marketId) || null)
    );
  }

  getMarketsForGroup(groupId: number): Observable<Market[]> {
    return this.markets.pipe(
      map(markets => {
        const group = this.marketGroups.value.find(g => g.id === groupId);
        return group ? markets.filter(m => group.markets.includes(m.id)) : [];
      })
    );
  }

  addMarket(market: Market): Observable<Market> {
    const currentMarkets = this.markets.value;
    const group = this.marketGroups.value.find(g => g.id === market.groupId);
    if (!group) {
      throw new Error('Market group not found');
    }

    if (!market.name) {
      throw new Error('Market name is required');
    }

    const newMarket: Market = {
      ...market,
      id: Math.max(0, ...currentMarkets.map(m => m.id)) + 1,
      code: this.generateMarketCode(market.name),
      currency: group.defaultCurrency, // Use group's currency
      region: group.name,
      isActive: true
    };

    // Add market to the group
    const updatedGroup = {
      ...group,
      markets: [...group.markets, newMarket.id]
    };

    // Update both markets and groups
    this.markets.next([...currentMarkets, newMarket]);
    this.updateMarketGroup(updatedGroup);

    return new Observable(subscriber => {
      subscriber.next(newMarket);
      subscriber.complete();
    });
  }

  updateMarket(market: Market): Observable<Market> {
    const currentMarkets = this.markets.value;
    const index = currentMarkets.findIndex(m => m.id === market.id);
    if (index === -1) {
      throw new Error('Market not found');
    }

    const group = this.marketGroups.value.find(g => 
      g.markets.includes(market.id)
    );
    if (!group) {
      throw new Error('Market group not found');
    }

    const updatedMarket: Market = {
      ...currentMarkets[index],
      ...market,
      currency: group.defaultCurrency // Always use group's currency
    };

    currentMarkets[index] = updatedMarket;
    this.markets.next([...currentMarkets]);

    return new Observable(subscriber => {
      subscriber.next(updatedMarket);
      subscriber.complete();
    });
  }

  deleteMarket(marketId: number): Observable<void> {
    const currentMarkets = this.markets.value;
    const market = currentMarkets.find(m => m.id === marketId);
    if (!market) {
      throw new Error('Market not found');
    }

    // Remove market from its group
    const currentGroups = this.marketGroups.value;
    const group = currentGroups.find(g => g.markets.includes(marketId));
    if (group) {
      const updatedGroup = {
        ...group,
        markets: group.markets.filter(id => id !== marketId)
      };
      this.updateMarketGroup(updatedGroup);
    }

    // Remove market
    this.markets.next(currentMarkets.filter(m => m.id !== marketId));
    return new Observable(subscriber => {
      subscriber.next();
      subscriber.complete();
    });
  }

  // Helper Methods
  private generateMarketCode(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 3)
      .toUpperCase();
  }

  getMarketName(marketId: number): string {
    const market = this.markets.value.find(m => m.id === marketId);
    return market?.name || '';
  }

  getMarketCurrency(marketId: number): string {
    const market = this.markets.value.find(m => m.id === marketId);
    return market?.currency || '';
  }
}