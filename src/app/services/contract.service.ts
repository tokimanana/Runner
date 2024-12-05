import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, map, firstValueFrom } from 'rxjs';
import { Contract, ContractPeriodRate, MealPlanType, RoomOccupancy, RateCalculationResult, Period } from '../models/types';
import { defaultContracts } from '../../data';
import { HotelService } from './hotel.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private contracts: Contract[] = defaultContracts;
  private currentContractSubject = new BehaviorSubject<Contract | null>(null);

  constructor(private hotelService: HotelService) {}

  getContracts(): Observable<Contract[]> {
    return of(this.contracts);
  }

  getContractsByHotelId(hotelId: number): Observable<Contract[]> {
    return of(this.contracts.filter(c => c.hotelId === hotelId));
  }

  getContract(id: string): Observable<Contract> {
    const contract = this.contracts.find(c => c.id === Number(id));
    if (!contract) {
      throw new Error('Contract not found');
    }
    return of(contract);
  }

  createContract(contract: Partial<Contract>): Observable<Contract> {
    const newContract: Contract = {
      ...contract,
      id: Math.max(...this.contracts.map(c => c.id)) + 1,
      status: 'draft'
    } as Contract;
    this.contracts.push(newContract);
    return of(newContract);
  }

  updateContract(contract: Partial<Contract>): Observable<Contract> {
    const index = this.contracts.findIndex(c => c.id === contract.id);
    if (index === -1) {
      throw new Error('Contract not found');
    }
    this.contracts[index] = { ...this.contracts[index], ...contract };
    return of(this.contracts[index]);
  }

  deleteContract(id: string): Observable<void> {
    const index = this.contracts.findIndex(c => c.id === Number(id));
    if (index !== -1) {
      this.contracts.splice(index, 1);
    }
    return of(void 0);
  }

  getCurrentContract(): Observable<Contract | null> {
    return this.currentContractSubject.asObservable();
  }

  setCurrentContract(contract: Contract | null): void {
    this.currentContractSubject.next(contract);
  }

  updateContractRates(
    contractId: string,
    seasonId: string,
    rates: ContractPeriodRate[]
  ): Observable<Contract> {
    const contract = this.contracts.find(c => c.id === Number(contractId));
    if (!contract) {
      throw new Error('Contract not found');
    }
    contract.periodRates = rates;
    return of(contract);
  }

  getContractRates(contractId: string, seasonId: string): Observable<ContractPeriodRate[]> {
    const contract = this.contracts.find(c => c.id === Number(contractId));
    if (!contract) {
      throw new Error('Contract not found');
    }

    return of(this.hotelService.getHotel(contract.hotelId)).pipe(
      map(hotel => {
        // L'hôtel doit toujours exister
        if (!hotel) {
          throw new Error(`Hotel ${contract.hotelId} not found for contract ${contractId}`);
        }

        const season = hotel.seasons?.find(s => s.id === Number(seasonId));
        if (!season?.periods) {
          throw new Error(`Season ${seasonId} not found or has no periods for hotel ${hotel.id}`);
        }

        const periodIds = season.periods.map((p: Period) => p.id);
        const rates = (contract.periodRates || []).filter(rate => 
          periodIds.includes(rate.periodId)
        );

        if (rates.length === 0) {
          throw new Error(`No rates found for contract ${contractId} in season ${seasonId}`);
        }

        return rates;
      })
    );
  }

  calculateRate(
    periodRate: ContractPeriodRate,
    occupancy: RoomOccupancy,
    mealPlan: MealPlanType
  ): RateCalculationResult {
    if (periodRate.rateType === 'per_unit') {
      return this.calculatePerUnitRate(periodRate, occupancy, mealPlan);
    } else {
      return this.calculatePerPaxRate(periodRate, occupancy, mealPlan);
    }
  }

  private calculatePerPaxRate(
    periodRate: ContractPeriodRate,
    occupancy: RoomOccupancy,
    mealPlan: MealPlanType
  ): RateCalculationResult {
    const { adults, children, infants } = occupancy;
    const baseRates = periodRate.baseRates;
    const supplements = periodRate.supplements;

    let baseRate = 0;
    let baseRateDescription = '';
    if (adults === 1 && baseRates.single) {
      baseRate = baseRates.single;
      baseRateDescription = 'Single occupancy base rate';
    } else if (adults === 2 && baseRates.double) {
      baseRate = baseRates.double;
      baseRateDescription = 'Double occupancy base rate';
    } else if (adults === 3 && baseRates.triple) {
      baseRate = baseRates.triple;
      baseRateDescription = 'Triple occupancy base rate';
    } else if (adults === 4 && baseRates.quad) {
      baseRate = baseRates.quad;
      baseRateDescription = 'Quad occupancy base rate';
    } else if (adults === 5 && baseRates.quint) {
      baseRate = baseRates.quint;
      baseRateDescription = 'Quint occupancy base rate';
    }

    const supplementsList: RateCalculationResult['breakdown']['supplements'] = [];
    let supplementsTotal = 0;

    const extraAdults = Math.max(0, adults - (baseRate ? 1 : 0));
    if (extraAdults > 0) {
      const extraAdultAmount = extraAdults * supplements.extraAdult;
      supplementsTotal += extraAdultAmount;
      supplementsList.push({
        amount: extraAdultAmount,
        description: `Extra adult supplement (${extraAdults} × ${supplements.extraAdult})`
      });
    }

    if (children > 0) {
      const childAmount = children * supplements.child;
      supplementsTotal += childAmount;
      supplementsList.push({
        amount: childAmount,
        description: `Child supplement (${children} × ${supplements.child})`
      });
    }

    const mealPlanRates = periodRate.mealPlanRates.find(r => r.mealPlanType === mealPlan);
    let mealPlanTotal = 0;
    const mealPlanBreakdown: RateCalculationResult['breakdown']['mealPlan'] = [];

    if (mealPlanRates) {
      if (mealPlanRates.roomRates) {
        const occupancyKey = this.getOccupancyKey(adults);
        const rates = mealPlanRates.roomRates[occupancyKey];
        if (rates) {
          const adultMealPlan = adults * rates.adult;
          const childMealPlan = children * rates.child;
          const infantMealPlan = infants * rates.infant;

          mealPlanTotal = adultMealPlan + childMealPlan + infantMealPlan;
          mealPlanBreakdown.push(
            { amount: adultMealPlan, description: `Adult meal plan ${mealPlan} (${adults} × ${rates.adult})` },
            { amount: childMealPlan, description: `Child meal plan ${mealPlan} (${children} × ${rates.child})` },
            { amount: infantMealPlan, description: `Infant meal plan ${mealPlan} (${infants} × ${rates.infant})` }
          );
        }
      } else if (mealPlanRates.rates) {
        const adultMealPlan = adults * mealPlanRates.rates.adult;
        const childMealPlan = children * mealPlanRates.rates.child;
        const infantMealPlan = infants * mealPlanRates.rates.infant;

        mealPlanTotal = adultMealPlan + childMealPlan + infantMealPlan;
        mealPlanBreakdown.push(
          { amount: adultMealPlan, description: `Adult meal plan ${mealPlan} (${adults} × ${mealPlanRates.rates.adult})` },
          { amount: childMealPlan, description: `Child meal plan ${mealPlan} (${children} × ${mealPlanRates.rates.child})` },
          { amount: infantMealPlan, description: `Infant meal plan ${mealPlan} (${infants} × ${mealPlanRates.rates.infant})` }
        );
      }
    }

    return {
      baseRate,
      supplementsTotal,
      mealPlanTotal,
      total: baseRate + supplementsTotal + mealPlanTotal,
      breakdown: {
        base: { amount: baseRate, description: baseRateDescription },
        supplements: supplementsList,
        mealPlan: mealPlanBreakdown
      }
    };
  }

  private calculatePerUnitRate(
    periodRate: ContractPeriodRate,
    occupancy: RoomOccupancy,
    mealPlan: MealPlanType
  ): RateCalculationResult {
    const { adults, children, infants } = occupancy;
    const unitRate = periodRate.baseRates.unitRate || 0;

    const supplementsTotal = 0;
    const supplementsList: RateCalculationResult['breakdown']['supplements'] = [];

    const mealPlanRates = periodRate.mealPlanRates.find(r => r.mealPlanType === mealPlan);
    let mealPlanTotal = 0;
    const mealPlanBreakdown: RateCalculationResult['breakdown']['mealPlan'] = [];

    if (mealPlanRates) {
      if (mealPlanRates.rates) {
        const adultMealPlan = adults * mealPlanRates.rates.adult;
        const childMealPlan = children * mealPlanRates.rates.child;
        const infantMealPlan = infants * mealPlanRates.rates.infant;

        mealPlanTotal = adultMealPlan + childMealPlan + infantMealPlan;
        mealPlanBreakdown.push(
          { amount: adultMealPlan, description: `Adult meal plan ${mealPlan} (${adults} × ${mealPlanRates.rates.adult})` },
          { amount: childMealPlan, description: `Child meal plan ${mealPlan} (${children} × ${mealPlanRates.rates.child})` },
          { amount: infantMealPlan, description: `Infant meal plan ${mealPlan} (${infants} × ${mealPlanRates.rates.infant})` }
        );
      }
    }

    return {
      baseRate: unitRate,
      supplementsTotal,
      mealPlanTotal,
      total: unitRate + mealPlanTotal,
      breakdown: {
        base: { amount: unitRate, description: 'Fixed room rate' },
        supplements: supplementsList,
        mealPlan: mealPlanBreakdown
      }
    };
  }

  private getOccupancyKey(adults: number): 'single' | 'double' | 'triple' | 'quad' | 'quint' {
    switch (adults) {
      case 1: return 'single';
      case 2: return 'double';
      case 3: return 'triple';
      case 4: return 'quad';
      case 5: return 'quint';
      default: throw new Error(`Invalid number of adults: ${adults}`);
    }
  }
}
