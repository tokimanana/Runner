import { Injectable } from "@angular/core";
import {
  Contract,
  ContractPeriodRate,
  RoomTypeRate,
  PersonTypeRates,
} from "../models/types";
import { MockApiService } from "./mock/mock-api.service";
import { BehaviorSubject, firstValueFrom, Observable } from "rxjs";
import { BaseDataService } from "./base-data.service";
import { SeasonService } from "./season.service";

@Injectable({
  providedIn: "root",
})
export class ContractRateService extends BaseDataService<Contract> {
  protected override dataSubject = new BehaviorSubject<Contract[]>([]);

  constructor(
    private seasonService: SeasonService
  ) {
    super();
  }

  // In contract-rates.service.ts
  async getContractRates(contractId: number): Promise<ContractPeriodRate[]> {
    if (!contractId) {
      throw new Error('Contract ID is required');
    }
    
    try {
      // Get rates from MockApiService
      const rates = await MockApiService.getContractRates(contractId);
      console.log('Retrieved rates from service:', rates); // Debug log

      // Ensure we always return an array of ContractPeriodRate
      const ratesArray = Array.isArray(rates) ? rates : [rates];

      // Validate the structure of returned rates
      this.validateRates(ratesArray, contractId);

      // Initialize missing rate structures if needed
      const normalizedRates = ratesArray.map(rate => ({
        contractId: rate.contractId,
        periodId: rate.periodId,
        roomRates: rate.roomRates.map(roomRate => ({
          roomTypeId: roomRate.roomTypeId,
          rateType: roomRate.rateType,
          villaRate: roomRate.rateType === 'per_villa' ? (roomRate.villaRate || 0) : undefined,
          personTypeRates: roomRate.rateType === 'per_pax' ? {
            adult: {
              rates: roomRate.personTypeRates?.['adult']?.rates || {}
            },
            child: {
              rates: roomRate.personTypeRates?.['child']?.rates || {}
            },
            infant: {
              rates: roomRate.personTypeRates?.['infant']?.rates || {}
            }
          } : undefined,
          mealPlanRates: roomRate.mealPlanRates || {}
        }))
      }));

      return normalizedRates;
    } catch (error) {
      console.error(`Error getting contract rates for contract ${contractId}:`, error);
      this.handleError(`Failed to get rates for contract ${contractId}`, error);
      throw error;
    }
  }


  async updateContractRates(
    contractId: number,
    rates: ContractPeriodRate[]
  ): Promise<Contract> {
    try {
      this.validateRates(rates, contractId);
      await MockApiService.updateContractRates(contractId, rates);

      // Update the contract's isRatesConfigured status
      const contract = await MockApiService.getContracts(contractId);
      return await MockApiService.updateContract(contractId, {
        ...contract,
        isRatesConfigured: true,
      });
    } catch (error) {
      this.handleError(
        `Failed to update contract rates for contract ID ${contractId}`,
        error
      );
      throw error;
    }
  }

  async validateRates(rates: ContractPeriodRate[], contractId: number): Promise<boolean> {
    // Get the specific contract, not all contracts
    const contractResponse = await MockApiService.getContract(contractId);
    
    if (!contractResponse || !contractResponse.hotelId || !contractResponse.seasonId) {
        throw new Error(`Invalid contract data for contract ${contractId}`);
    }

    const seasonMap = await firstValueFrom(this.seasonService.seasons$);
    const hotelSeasons = seasonMap.get(contractResponse.hotelId) || [];
    const season = hotelSeasons.find(s => s.id === contractResponse.seasonId);
    
    if (!season) {
        throw new Error(`Invalid season for contract ${contractId}`);
    }
    
    if (!season.periods) {
        throw new Error(`No periods defined for season ${season.id}`);
    }
    
    // Validate each rate's periodId exists in the season
    for (const rate of rates) {
        const periodExists = season.periods.some(p => p.id === rate.periodId);
        if (!periodExists) {
            throw new Error(`Invalid period ${rate.periodId} for season ${season.id}`);
        }
    }
    
    return true;
}


  private validatePeriodRates(
    period: ContractPeriodRate,
    contractId: number
  ): void {
    if (!period.roomRates || !Array.isArray(period.roomRates)) {
      throw new Error(
        `Invalid rate configuration: Room rates array is missing or not an array for contract ID ${contractId} and period ID ${period.periodId}`
      );
    }

    for (const roomRate of period.roomRates) {
      this.validateRoomRate(roomRate, contractId, period.periodId);
    }
  }

  private validateRoomRate(
    roomRate: RoomTypeRate,
    contractId: number,
    periodId: number
  ): void {
    if (roomRate.rateType === "per_villa") {
      this.validatePerVillaRate(roomRate, contractId, periodId);
    } else if (roomRate.rateType === "per_pax") {
      this.validatePerPaxRate(roomRate, contractId, periodId);
    } else {
      throw new Error(
        `Invalid rate configuration: Invalid rate type "${roomRate.rateType}" for contract ID ${contractId}, period ID ${periodId}, and room type ID ${roomRate.roomTypeId}`
      );
    }
  }

  private validatePerVillaRate(
    roomRate: RoomTypeRate,
    contractId: number,
    periodId: number
  ): void {
    if (typeof roomRate.villaRate !== "number") {
      throw new Error(
        `Invalid rate configuration: Villa rate is not a number for contract ID ${contractId}, period ID ${periodId}, and room type ID ${roomRate.roomTypeId}`
      );
    }
  }

  private validatePerPaxRate(
    roomRate: RoomTypeRate,
    contractId: number,
    periodId: number
  ): void {
    if (!roomRate.personTypeRates) {
      throw new Error(
        `Invalid rate configuration: Person type rates are missing for contract ID ${contractId}, period ID ${periodId}, and room type ID ${roomRate.roomTypeId}`
      );
    }

    if (!this.hasValidPersonTypeRates(roomRate.personTypeRates)) {
      throw new Error(
        `Invalid rate configuration: No valid person type rates found for contract ID ${contractId}, period ID ${periodId}, and room type ID ${roomRate.roomTypeId}`
      );
    }
  }

  private hasValidPersonTypeRates(personTypeRates: PersonTypeRates): boolean {
    return Object.keys(personTypeRates).some((personType) => {
      const rates = personTypeRates[personType]?.rates;
      return rates && Object.keys(rates).length > 0;
    });
  }

  protected override handleError(message: string, error: any): void {
    console.error("Contract rate service error:", message, error);
  }
}
