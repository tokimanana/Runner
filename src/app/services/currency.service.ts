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
  }

  protected override async loadData(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      const settings = await MockApiService.getCurrencySettings();
      this.dataSubject.next(settings);
    } catch (error) {
      this.handleError("Failed to load currency settings", error);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  getCurrencySettings(): Observable<CurrencySetting[]> {
    if (!this.initialized) {
      this.initialized = true;
      this.loadData();
    }
    return this.getData();
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