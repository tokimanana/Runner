import { Injectable } from '@angular/core';
import { Market } from '../models/types';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { defaultMarkets } from '../../data';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private markets = new BehaviorSubject<Market[]>([]);

  constructor() {
    // Initialize with markets from data.ts
    this.markets.next(defaultMarkets);
  }

  async getMarket(marketId: number): Promise<Market | null> {
    const market = this.markets.value.find(m => m.id === marketId);
    return market || null;
  }

  async getAllMarkets(): Promise<Market[]> {
    return this.markets.value;
  }

  async addMarket(market: Market): Promise<Market> {
    const currentMarkets = this.markets.value;
    const newMarket = {
      ...market,
      id: Math.max(0, ...currentMarkets.map(m => m.id)) + 1
    };
    this.markets.next([...currentMarkets, newMarket]);
    return newMarket;
  }

  async updateMarket(market: Market): Promise<Market> {
    const currentMarkets = this.markets.value;
    const index = currentMarkets.findIndex(m => m.id === market.id);
    if (index === -1) {
      throw new Error('Market not found');
    }
    currentMarkets[index] = market;
    this.markets.next([...currentMarkets]);
    return market;
  }

  getMarkets(): Observable<Market[]> {
    return of(this.markets.value);
  }

  async deleteMarket(marketId: number): Promise<void> {
    const currentMarkets = this.markets.value;
    const index = currentMarkets.findIndex(m => m.id === marketId);
    if (index === -1) {
      throw new Error('Market not found');
    }
    currentMarkets.splice(index, 1);
    this.markets.next([...currentMarkets]);
  }

  getMarketName(marketId: number): string {
    const market = this.markets.value.find(m => m.id === marketId);
    return market?.name || '';
  }
}