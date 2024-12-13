// src/app/services/market.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Market, MarketGroup } from '../models/types';
import { MockApiService } from './mock/mock-api.service';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private marketsSubject = new BehaviorSubject<Market[]>([]);
  private marketGroupsSubject = new BehaviorSubject<MarketGroup[]>([]);
  
  markets$ = this.marketsSubject.asObservable();
  marketGroups$ = this.marketGroupsSubject.asObservable();

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      const [markets, groups] = await Promise.all([
        MockApiService.getMarkets(),
        MockApiService.getMarketGroups()
      ]);
      
      this.marketsSubject.next(markets);
      this.marketGroupsSubject.next(groups);
    } catch (error) {
      console.error('Error initializing market data:', error);
    }
  }

  // Market Operations
  async createMarket(market: Omit<Market, 'id'>): Promise<Market> {
    try {
      const newMarket = await MockApiService.createMarket(market);
      const currentMarkets = this.marketsSubject.value;
      this.marketsSubject.next([...currentMarkets, newMarket]);
      return newMarket;
    } catch (error) {
      console.error('Error creating market:', error);
      throw error;
    }
  }

  async updateMarket(id: number, marketData: Partial<Market>): Promise<Market> {
    try {
      const updatedMarket = await MockApiService.updateMarket(id, marketData);
      const currentMarkets = this.marketsSubject.value;
      const index = currentMarkets.findIndex(m => m.id === id);
      
      if (index !== -1) {
        currentMarkets[index] = updatedMarket;
        this.marketsSubject.next([...currentMarkets]);
      }
      
      return updatedMarket;
    } catch (error) {
      console.error('Error updating market:', error);
      throw error;
    }
  }

  async deleteMarket(id: number): Promise<void> {
    try {
      await MockApiService.deleteMarket(id);
      const currentMarkets = this.marketsSubject.value;
      this.marketsSubject.next(currentMarkets.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting market:', error);
      throw error;
    }
  }

  // Market Group Operations
  async createMarketGroup(group: Omit<MarketGroup, 'id'>): Promise<MarketGroup> {
    try {
      const newGroup = await MockApiService.createMarketGroup(group);
      const currentGroups = this.marketGroupsSubject.value;
      this.marketGroupsSubject.next([...currentGroups, newGroup]);
      return newGroup;
    } catch (error) {
      console.error('Error creating market group:', error);
      throw error;
    }
  }

  async updateMarketGroup(id: number, groupData: Partial<MarketGroup>): Promise<MarketGroup> {
    try {
      const updatedGroup = await MockApiService.updateMarketGroup(id, groupData);
      const currentGroups = this.marketGroupsSubject.value;
      const index = currentGroups.findIndex(g => g.id === id);
      
      if (index !== -1) {
        currentGroups[index] = updatedGroup;
        this.marketGroupsSubject.next([...currentGroups]);
      }
      
      return updatedGroup;
    } catch (error) {
      console.error('Error updating market group:', error);
      throw error;
    }
  }

  async deleteMarketGroup(id: number): Promise<void> {
    try {
      await MockApiService.deleteMarketGroup(id);
      const currentGroups = this.marketGroupsSubject.value;
      this.marketGroupsSubject.next(currentGroups.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting market group:', error);
      throw error;
    }
  }

  // Helper Methods
  getMarketsByGroup(groupId: number): Observable<Market[]> {
    return new Observable(subscriber => {
      const markets = this.marketsSubject.value.filter(
        market => market.groupId === groupId
      );
      subscriber.next(markets);
      subscriber.complete();
    });
  }

  getMarketById(id: number): Observable<Market | null> {
    return new Observable(subscriber => {
      const market = this.marketsSubject.value.find(m => m.id === id);
      subscriber.next(market || null);
      subscriber.complete();
    });
  }

  getMarketGroupById(id: number): Observable<MarketGroup | null> {
    return new Observable(subscriber => {
      const group = this.marketGroupsSubject.value.find(g => g.id === id);
      subscriber.next(group || null);
      subscriber.complete();
    });
  }

  // Utility methods
  async refresh(): Promise<void> {
    await this.initializeData();
  }

  isMarketInUse(marketId: number): boolean {
    const groups = this.marketGroupsSubject.value;
    return groups.some(group => group.markets.includes(marketId));
  }

  getMarketName(marketId: number): string {
    const market = this.marketsSubject.value.find(m => m.id === marketId);
    return market?.name || '';
  }
}
