import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CurrencySetting } from "../models/types";
import { MockApiService } from "./mock/mock-api.service";
import { BaseDataService } from "./base-data.service";

@Injectable({
  providedIn: "root",
})
export class CurrencyService extends BaseDataService<CurrencySetting> {
  private initialized = false;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    if (!this.initialized) {
      await this.loadData(() => MockApiService.getCurrencySettings());
      this.initialized = true;
    }
  }

  

  protected override async loadData(
    fetchFunction: () => Promise<CurrencySetting[]>
  ): Promise<void> {
    try {
      const data = await fetchFunction();
      this.dataSubject.next(data);
    } catch (error) {
      console.error('Error loading currency data:', error);
      this.dataSubject.next([]);
      throw error;
    }
  }

  getCurrencySettings(): Observable<CurrencySetting[]> {
    if (!this.initialized) {
      this.initialize();
    }
    return this.dataSubject.asObservable();
  }

  async addCurrency(currency: Omit<CurrencySetting, "id">): Promise<CurrencySetting> {
    return this.addData(
      (data) => MockApiService.addCurrencySetting(data),
      currency
    );
  }

  async updateCurrency(currency: CurrencySetting): Promise<CurrencySetting> {
    return this.updateData(
      currency.id,
      (id, updates) => MockApiService.updateCurrencySetting(currency.code, updates),
      currency
    );
  }

  async deleteCurrency(currency: CurrencySetting): Promise<void> {
    if (currency.isActive) {
      throw new Error("Cannot delete an active currency");
    }
    return this.deleteData(
      () => MockApiService.deleteCurrencySetting(currency.code),
      currency.id
    );
  }

  async updateCurrencyStatus(code: string, isActive: boolean): Promise<CurrencySetting> {
    try {
      const updatedCurrency = await MockApiService.updateCurrencyStatus(code, isActive);
      const currentData = this.dataSubject.value;
      const index = currentData.findIndex((c) => c.code === code);
      
      if (index !== -1) {
        currentData[index] = updatedCurrency;
        this.dataSubject.next([...currentData]);
      }
      
      return updatedCurrency;
    } catch (error) {
      this.handleError("Failed to update currency status", error);
      throw error;
    }
  }

  getCurrencyByCode(code: string): CurrencySetting | undefined {
    return this.dataSubject.value.find((c) => c.code === code);
  }

  isCurrencyActive(code: string): boolean {
    return this.dataSubject.value.some((c) => c.code === code && c.isActive);
  }

  protected override handleError(message: string, error: any): void {
    console.error("Currency service error:", message, error);
    super.handleError(message, error);
  }
}