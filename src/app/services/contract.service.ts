// src/app/services/contract.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, firstValueFrom, from, map } from "rxjs";
import {
  Contract,
  ContractRate,
  ContractPeriodRate,
  RateConfiguration,
  Period,
} from "../models/types";
import { MockApiService } from "./mock/mock-api.service";
import { BaseDataService } from "./base-data.service";
import { ContractRateService } from "./contract-rates.service";
import { SeasonService } from "./season.service";

// Define allowed filter keys
type ContractFilterKeys = "name" | "hotelId" | "marketId";

// First, add this type definition at the top of your file or in your types.ts file
type ContractStatus = 'configured' | 'no_rate' | 'expired';

// Define the filter type
type ContractFilters = {
  [K in ContractFilterKeys]?: Contract[K];
};

@Injectable({
  providedIn: "root",
})
export class ContractService extends BaseDataService<Contract> {
  protected override dataSubject = new BehaviorSubject<Contract[]>([]);
  private totalSubject = new BehaviorSubject<number>(0);

  private ratesCache = new Map<
    number,
    {
      rates: ContractPeriodRate[];
      timestamp: number;
      hasRates: boolean;
    }
  >();
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  data$ = this.dataSubject.asObservable();
  total$ = this.totalSubject.asObservable();
  constructor(
    private contractRateService: ContractRateService,
    private seasonService: SeasonService
  ) {
    super();
    this.loadContracts();
  }

  async loadContracts(
    pageSize: number = 10,
    pageIndex: number = 0
  ): Promise<void> {
    try {
      const result = await MockApiService.getContracts(pageSize, pageIndex);
      this.dataSubject.next(result.contracts);
      this.totalSubject.next(result.total);
    } catch (error) {
      this.handleError("Failed to load contracts", error);
    }
  }

  getContracts(
    pageSize: number = 10,
    pageIndex: number = 0,
    filters?: ContractFilters
  ): Observable<Contract[]> {
    return from(MockApiService.getContracts(pageSize, pageIndex)).pipe(
      map((result) => {
        let contracts = result.contracts;

        if (filters) {
          contracts = this.applyFilters(contracts, filters);
        }

        return contracts;
      })
    );
  }

  private applyFilters(
    contracts: Contract[],
    filters: ContractFilters
  ): Contract[] {
    return contracts.filter((contract) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null) return true;
        return contract[key as keyof Contract] === value;
      });
    });
  }

  getTotalContracts(): Observable<number> {
    return this.total$;
  }

  private async validateContractSeason(contract: Contract): Promise<boolean> {
    try {
      const seasonMap = await firstValueFrom(this.seasonService.seasons$);
      const hotelSeasons = seasonMap.get(contract.hotelId) || [];
      
      const season = hotelSeasons.find(s => 
        s.id === contract.seasonId && 
        s.isActive === true
      );
      
      if (!season) {
        console.error('Invalid or inactive season:', {
          contractId: contract.id,
          hotelId: contract.hotelId,
          seasonId: contract.seasonId,
          availableSeasons: hotelSeasons
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error validating contract season:", error);
      return false;
    }
}


  async createContract(contract: Omit<Contract, "id">): Promise<Contract> {
    try {
      if (!this.validateContract(contract as Contract)) {
        throw new Error("Invalid contract data");
      }

      const isValidSeason = await this.validateContractSeason(
        contract as Contract
      );
      if (!isValidSeason) {
        throw new Error("Invalid season reference in contract");
      }

      const newContract = await MockApiService.createContract(contract);
      const currentContracts = this.dataSubject.value;
      this.dataSubject.next([...currentContracts, newContract]);
      this.totalSubject.next(this.totalSubject.value + 1);
      return newContract;
    } catch (error) {
      this.handleError("Error creating contract", error);
      throw error;
    }
  }

  // In ContractService or similar service
  private validateContract(contract: Contract): boolean {
    // Validate that room types and meal plans are selected
    if (
      !contract.selectedRoomTypes.length ||
      !contract.selectedMealPlans.length
    ) {
      return false;
    }

    if (
      !contract.baseMealPlan ||
      !contract.selectedMealPlans.includes(contract.baseMealPlan)
    ) {
      return false;
    }

    return true;
  }

  async updateContract(
    id: number,
    updates: Partial<Contract>
  ): Promise<Contract> {
    try {
      const updatedContract = await MockApiService.updateContract(id, updates);
      const currentContracts = this.dataSubject.value;
      const index = currentContracts.findIndex((c) => c.id === id);

      if (index !== -1) {
        currentContracts[index] = updatedContract;
        this.dataSubject.next([...currentContracts]);
      }
      return updatedContract;
    } catch (error) {
      this.handleError("Error updating contract", error);
      throw error;
    }
  }

  async deleteContract(id: number): Promise<void> {
    try {
      await MockApiService.deleteContract(id);
      const currentContracts = this.dataSubject.value;
      this.dataSubject.next(currentContracts.filter((c) => c.id !== id));
      this.totalSubject.next(this.totalSubject.value - 1);
    } catch (error) {
      this.handleError("Error deleting contract", error);
      throw error;
    }
  }

  getContractsByHotel(hotelId: number): Observable<Contract[]> {
    return this.data$.pipe(
      map((contracts) => contracts.filter((c) => c.hotelId === hotelId))
    );
  }
  // Helper methods
  getContractById(id: number): Observable<Contract | null> {
    return from(MockApiService.getContractById(id));
  }

  protected override handleError(message: string, error: any): void {
    console.error("Contract service error:", message, error);
    super.handleError(message, error);
  }

  // Reset to initial state
  async resetContracts(): Promise<void> {
    try {
      await MockApiService.resetDataForType("CONTRACTS");
      await this.loadContracts();
    } catch (error) {
      this.handleError("Failed to reset contracts", error);
      throw error;
    }
  }

  private async checkRatesWithCache(contractId: number): Promise<boolean> {
    const now = Date.now();
    const cached = this.ratesCache.get(contractId);

    // Check if we have a valid cache entry
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.hasRates;
    }

    // If no cache or expired, fetch fresh data
    try {
      const rates = await this.contractRateService.getContractRates(contractId);
      const hasRates = rates && rates.length > 0;

      // Update cache
      this.ratesCache.set(contractId, {
        rates,
        timestamp: now,
        hasRates,
      });

      return hasRates;
    } catch (error) {
      console.error("Error checking rates:", error);
      throw error;
    }
  }

  async updateContractStatus(
    id: number,
    contract: Contract
  ): Promise<Contract> {
    try {
      let newStatus: ContractStatus;

      // Use cached check for rates
      const hasRates = await this.checkRatesWithCache(id);

      if (!hasRates) {
        newStatus = "no_rate";
      }
      // Check if contract period is expired
      else if (
        contract.validityPeriod &&
        new Date(contract.validityPeriod.endDate) < new Date()
      ) {
        newStatus = "expired";
      }
      // Contract has rates and is within validity period
      else {
        newStatus = "configured";
      }

      const updates = {
        status: newStatus,
        isRatesConfigured: hasRates,
      };

      console.log("Updating contract status:", { id, updates });

      return this.updateContract(id, updates);
    } catch (error) {
      console.error("Error updating contract status:", error);
      throw error;
    }
  }

  // Add method to clear cache for a specific contract
  clearRatesCache(contractId?: number) {
    if (contractId) {
      this.ratesCache.delete(contractId);
    } else {
      this.ratesCache.clear();
    }
  }

  // Add method to refresh cache for a specific contract
  async refreshRatesCache(contractId: number) {
    try {
      const rates = await this.contractRateService.getContractRates(contractId);
      this.ratesCache.set(contractId, {
        rates,
        timestamp: Date.now(),
        hasRates: rates && rates.length > 0,
      });
    } catch (error) {
      console.error("Error refreshing rates cache:", error);
      throw error;
    }
  }

  getContractsByHotelAndMarket(
    hotelId: number,
    marketId: number
  ): Observable<Contract[]> {
    return this.data$.pipe(
      map((contracts) =>
        contracts.filter(
          (c) => c.hotelId === hotelId && c.marketId === marketId
        )
      )
    );
  }

  async getActiveContract(
    hotelId: number,
    marketId: number
  ): Promise<Contract | null> {
    const contracts = await firstValueFrom(this.getContracts());
    return (
      contracts.find(
        (c) =>
          c.hotelId === hotelId &&
          c.marketId === marketId &&
          c.isRatesConfigured === true
      ) || null
    );
  }

  getPeriods(seasonId: number): Observable<Period[]> {
    // Use the seasonService to get periods for the season
    return this.seasonService.getPeriodsBySeason(seasonId).pipe(
      map(periods => {
        console.log('Retrieved periods for season:', seasonId, periods);
        return periods;
      })
    );
  }
}
