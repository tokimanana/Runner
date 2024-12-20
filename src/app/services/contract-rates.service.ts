import { Injectable } from "@angular/core";
import { Contract, ContractPeriodRate, RoomTypeRate, PersonTypeRates } from "../models/types";
import { MockApiService } from "./mock/mock-api.service";
import { BehaviorSubject, Observable } from "rxjs";
import { BaseDataService } from "./base-data.service";

@Injectable({
  providedIn: "root",
})
export class ContractRateService extends BaseDataService<Contract> {
  protected override dataSubject = new BehaviorSubject<Contract[]>([]);

  constructor() {
    super();
  }

  async getContractRates(contractId: number): Promise<ContractPeriodRate[]> {
    try {
      return await MockApiService.getContractRates(contractId);
    } catch (error) {
      this.handleError(`Failed to get contract rates for contract ID ${contractId}`, error);
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
        isRatesConfigured: true
      });
    } catch (error) {
      this.handleError(`Failed to update contract rates for contract ID ${contractId}`, error);
      throw error;
    }
  }

  protected validateRates(rates: ContractPeriodRate[], contractId: number): void {
    if (!Array.isArray(rates) || rates.length === 0) {
      throw new Error(`Invalid rate configuration: Rates array is empty or not an array for contract ID ${contractId}`);
    }

    for (const period of rates) {
      this.validatePeriodRates(period, contractId);
    }
  }

  private validatePeriodRates(period: ContractPeriodRate, contractId: number): void {
    if (!period.roomRates || !Array.isArray(period.roomRates)) {
      throw new Error(`Invalid rate configuration: Room rates array is missing or not an array for contract ID ${contractId} and period ID ${period.periodId}`);
    }

    for (const roomRate of period.roomRates) {
      this.validateRoomRate(roomRate, contractId, period.periodId);
    }
  }

  private validateRoomRate(roomRate: RoomTypeRate, contractId: number, periodId: number): void {
    if (roomRate.rateType === "per_villa") {
      this.validatePerVillaRate(roomRate, contractId, periodId);
    } else if (roomRate.rateType === "per_pax") {
      this.validatePerPaxRate(roomRate, contractId, periodId);
    } else {
      throw new Error(`Invalid rate configuration: Invalid rate type "${roomRate.rateType}" for contract ID ${contractId}, period ID ${periodId}, and room type ID ${roomRate.roomTypeId}`);
    }
  }

  private validatePerVillaRate(roomRate: RoomTypeRate, contractId: number, periodId: number): void {
    if (typeof roomRate.villaRate !== "number") {
      throw new Error(`Invalid rate configuration: Villa rate is not a number for contract ID ${contractId}, period ID ${periodId}, and room type ID ${roomRate.roomTypeId}`);
    }
  }

  private validatePerPaxRate(roomRate: RoomTypeRate, contractId: number, periodId: number): void {
    if (!roomRate.personTypeRates) {
      throw new Error(`Invalid rate configuration: Person type rates are missing for contract ID ${contractId}, period ID ${periodId}, and room type ID ${roomRate.roomTypeId}`);
    }

    if (!this.hasValidPersonTypeRates(roomRate.personTypeRates)) {
      throw new Error(`Invalid rate configuration: No valid person type rates found for contract ID ${contractId}, period ID ${periodId}, and room type ID ${roomRate.roomTypeId}`);
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
