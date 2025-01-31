import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { Market, MarketGroup } from "../models/types";
import { MockApiService } from "./mock/mock-api.service";
import { BaseDataService } from "./base-data.service";

@Injectable({
  providedIn: "root",
})
export class MarketService extends BaseDataService<Market> {
  // State management
  private marketsSubject = new BehaviorSubject<Market[]>([]);
  private marketGroupsSubject = new BehaviorSubject<MarketGroup[]>([]);
  private loading = new BehaviorSubject<boolean>(false);
  private initialized = false;
  private error = new BehaviorSubject<string | null>(null);

  // Public observables
  override readonly loading$ = this.loading.asObservable();
  override readonly error$ = this.error.asObservable();
  readonly markets$ = this.dataSubject.asObservable();
  readonly marketGroups$ = this.marketGroupsSubject.asObservable();

  constructor() {
    super();
    this.initialize();
  }

  private async initializeData(): Promise<void> {
    if (this.initialized || this.loading.value) {
      return;
    }

    try {
      this.loading.next(true);
      const [markets, groups] = await Promise.all([
        MockApiService.getMarkets(),
        MockApiService.getMarketGroups(),
      ]);

      this.marketsSubject.next(markets);
      this.marketGroupsSubject.next(groups);
      this.initialized = true;
    } catch (error) {
      console.error("Error loading market data:", error);
      this.marketsSubject.next([]);
      this.marketGroupsSubject.next([]);
      throw error;
    } finally {
      this.loading.next(false);
    }
  }

  private async initialize() {
    if (!this.initialized) {
      await this.loadInitialData();
      this.initialized = true;
    }
  }

  private async loadInitialData(): Promise<void> {
    try {
      const [markets, groups] = await Promise.all([
        MockApiService.getMarkets(),
        MockApiService.getMarketGroups(),
      ]);

      this.dataSubject.next(markets);
      this.marketGroupsSubject.next(groups);
    } catch (error) {
      console.error("Error loading initial market data:", error);
      this.dataSubject.next([]);
      this.marketGroupsSubject.next([]);
      throw error;
    }
  }

  // Market Operations
  getMarkets(): Observable<Market[]> {
    // Trigger initialization on first data request
    if (!this.initialized) {
      this.initializeData().catch((error) => {
        console.error("Failed to initialize market data:", error);
      });
    }
    return this.markets$;
  }

  async createMarket(market: Omit<Market, "id">): Promise<Market> {
    try {
      const newMarket = await MockApiService.createMarket(market);
      const currentMarkets = this.dataSubject.value;
      this.dataSubject.next([...currentMarkets, newMarket]);
      return newMarket;
    } catch (error) {
      console.error("Error creating market:", error);
      throw error;
    }
  }

  async updateMarket(id: number, updates: Partial<Market>): Promise<Market> {
    try {
      const updatedMarket = await MockApiService.updateMarket(id, updates);
      const currentMarkets = this.dataSubject.value;
      const index = currentMarkets.findIndex((m) => m.id === id);
      if (index !== -1) {
        currentMarkets[index] = updatedMarket;
        this.dataSubject.next([...currentMarkets]);
      }
      return updatedMarket;
    } catch (error) {
      console.error("Error updating market:", error);
      throw error;
    }
  }

  async deleteMarket(id: number): Promise<void> {
    try {
      await MockApiService.deleteMarket(id);
      const currentMarkets = this.dataSubject.value;
      this.dataSubject.next(currentMarkets.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error deleting market:", error);
      throw error;
    }
  }

  // Market Group Operations
  getMarketGroups(): Observable<MarketGroup[]> {
    if (!this.initialized) {
      this.initializeData().catch((error) => {
        console.error("Failed to initialize market data:", error);
      });
    }
    return this.marketGroups$;
  }

  async createMarketGroup(
    group: Omit<MarketGroup, "id">
  ): Promise<MarketGroup> {
    try {
      const newGroup = await MockApiService.createMarketGroup(group);
      const currentGroups = this.marketGroupsSubject.value;
      this.marketGroupsSubject.next([...currentGroups, newGroup]);
      return newGroup;
    } catch (error) {
      console.error("Error creating market group:", error);
      throw error;
    }
  }

  async updateMarketGroup(
    id: number,
    groupData: Partial<MarketGroup>
  ): Promise<MarketGroup> {
    try {
      const updatedGroup = await MockApiService.updateMarketGroup(
        id,
        groupData
      );
      const currentGroups = this.marketGroupsSubject.value;
      const index = currentGroups.findIndex((g) => g.id === id);

      if (index !== -1) {
        currentGroups[index] = updatedGroup;
        this.marketGroupsSubject.next([...currentGroups]);
      }

      return updatedGroup;
    } catch (error) {
      console.error("Error updating market group:", error);
      throw error;
    }
  }

  async deleteMarketGroup(id: number): Promise<void> {
    try {
      await MockApiService.deleteMarketGroup(id);
      const currentGroups = this.marketGroupsSubject.value;
      this.marketGroupsSubject.next(currentGroups.filter((g) => g.id !== id));
    } catch (error) {
      console.error("Error deleting market group:", error);
      throw error;
    }
  }

  // Helper Methods
  getMarketById(id: number): Observable<Market | undefined> {
    return of(this.dataSubject.value.find((m) => m.id === id));
  }

  getMarketGroupById(id: number): Observable<MarketGroup | undefined> {
    return of(this.marketGroupsSubject.value.find((g) => g.id === id));
  }

  getMarketsByGroup(groupId: number): Observable<Market[]> {
    return of(this.dataSubject.value.filter(
      (market) => market.groupId === groupId
    ));
  }

  // Status and Utility Methods
  async updateMarketStatus(id: number, isActive: boolean): Promise<Market> {
    try {
      const updatedMarket = await MockApiService.updateMarket(id, { isActive });
      const currentMarkets = this.dataSubject.value;
      const index = currentMarkets.findIndex((m) => m.id === id);

      if (index !== -1) {
        currentMarkets[index] = updatedMarket;
        this.dataSubject.next([...currentMarkets]);
      }

      return updatedMarket;
    } catch (error) {
      console.error("Error updating market status:", error);
      throw error;
    }
  }

  isMarketActive(id: number): Observable<boolean> {
    return this.getMarketById(id).pipe(
      map(market => market ? market.isActive : false)
    );
  }

  isMarketInUse(marketId: number): boolean {
    const groups = this.marketGroupsSubject.value;
    return groups.some((group) => group.markets.includes(marketId));
  }

  getMarketName(marketId: number): Observable<string> {
    return this.getMarketById(marketId).pipe(
      map(market => market?.name || "")
    );
  }

  getMarketCurrency(marketId: number): Observable<string> {
    return this.getMarketById(marketId).pipe(
      map(market => market?.currency || "")
    );
  }

  // Error handling
  protected override handleError(message: string, error: any): void {
    console.error('Market service error:', message, error);
    super.handleError(message, error);
  }

  // Refresh functionality
  async refresh(): Promise<void> {
    await this.loadInitialData();
  }
}