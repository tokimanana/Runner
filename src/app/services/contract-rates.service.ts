import { Injectable } from "@angular/core";
import { Contract, ContractRate, RateConfiguration } from "../models/types";
import { MockApiService } from "./mock/mock-api.service";

// src/app/services/contract-rate.service.ts
@Injectable({
  providedIn: 'root'
})
export class ContractRateService {
  constructor() {}

  // Move these methods from ContractService
  async updateContractRates(contractId: number, rates: RateConfiguration): Promise<Contract> {
    try {
      const contractRates: ContractRate[] = [{
        contractId: contractId,
        periodRates: rates.map(rate => ({
          periodId: rate.periodId,
          roomRates: rate.roomRates
        }))
      }];

      return MockApiService.updateContractRates(contractId, contractRates);
    } catch (error) {
      this.handleError('Failed to update contract rates', error);
      throw error;
    }
  }

  private validateRates(rates: ContractRate[]): boolean {
    if (!Array.isArray(rates)) {
      throw new Error('Rates must be an array');
    }

    for (const rate of rates) {
      if (!rate.contractId) {
        throw new Error('Contract ID is required for rates');
      }

      if (!Array.isArray(rate.periodRates)) {
        throw new Error('Period rates must be an array');
      }

      for (const periodRate of rate.periodRates) {
        if (!periodRate.periodId) {
          throw new Error('Period ID is required for period rates');
        }

        if (!Array.isArray(periodRate.roomRates)) {
          throw new Error('Room rates must be an array');
        }
      }
    }

    return true;
  }

  protected handleError(message: string, error: any): void {
    console.error('Contract rate service error:', message, error);
  }
}
