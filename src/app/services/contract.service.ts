import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, map, firstValueFrom } from 'rxjs';
import { Contract, ContractPeriodRate, MealPlanType, RoomOccupancy, RateCalculationResult, Period, RoomTypeRate } from '../models/types';
import { defaultContracts } from '../../data';
import { HotelService } from './hotel.service';
import { CurrencyService } from './currency.service';
import { MarketService } from './market.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private contracts: Contract[] = defaultContracts;
  private currentContractSubject = new BehaviorSubject<Contract | null>(null);

  constructor(
    private hotelService: HotelService, 
    private currencyService: CurrencyService,
    private marketService: MarketService
  ) {}

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

  async calculateRate(
    contract: Contract,
    periodId: number,
    roomTypeId: number,
    occupancy: RoomOccupancy,
    mealPlan?: MealPlanType
  ): Promise<RateCalculationResult> {
    const periodRate = contract.periodRates.find(pr => pr.periodId === periodId);
    if (!periodRate) {
      throw new Error('Period rate not found');
    }

    const roomRate = periodRate.roomRates.find(rr => rr.roomTypeId === roomTypeId);
    if (!roomRate) {
      throw new Error('Room rate not found');
    }

    const market = await firstValueFrom(this.marketService.getMarket(contract.marketId));
    if (!market) {
      throw new Error('Market not found');
    }

    const currency = market.currency;
    let baseRate = 0;
    let mealPlanTotal = 0;

    if (roomRate.rateType === 'per_pax') {
      baseRate = this.calculatePerPaxRate(roomRate, occupancy);
      if (mealPlan) {
        mealPlanTotal = this.calculateMealPlanTotal(roomRate, occupancy, mealPlan);
      }
    } else {
      baseRate = this.calculatePerVillaRate(roomRate, occupancy);
      if (mealPlan) {
        mealPlanTotal = this.calculateMealPlanTotal(roomRate, occupancy, mealPlan);
      }
    }

    const total = baseRate + mealPlanTotal;

    return {
      baseRate,
      supplements: {
        mealPlan: mealPlanTotal
      },
      breakdown: {
        baseRate,
        mealPlanTotal
      },
      total,
      currency
    };
  }

  private calculatePerPaxRate(
    roomRate: RoomTypeRate,
    occupancy: RoomOccupancy
  ): number {
    const { adults, children, infants } = occupancy;
    let baseRate = 0;

    // Calculate adult rates
    const adultRates = roomRate.personTypeRates['adult']?.rates || {};
    for (let i = 1; i <= adults; i++) {
      const rate = adultRates[i] || 0;
      baseRate += rate;
    }

    // Calculate child rates
    const childRates = roomRate.personTypeRates['child']?.rates || {};
    for (let i = 1; i <= children; i++) {
      const rate = childRates[i] || 0;
      baseRate += rate;
    }

    // Calculate infant rates
    const infantRates = roomRate.personTypeRates['infant']?.rates || {};
    for (let i = 1; i <= infants; i++) {
      const rate = infantRates[i] || 0;
      baseRate += rate;
    }

    return baseRate;
  }

  private calculatePerVillaRate(
    roomRate: RoomTypeRate,
    occupancy: RoomOccupancy
  ): number {
    const { adults, children, infants } = occupancy;
    let baseRate = 0;

    // Get base villa rate
    const baseVillaRate = roomRate.personTypeRates['base']?.rates?.[1] || 0;
    baseRate = baseVillaRate;

    // Calculate additional person charges
    const adultRates = roomRate.personTypeRates['adult']?.rates || {};
    for (let i = 1; i <= adults; i++) {
      const rate = adultRates[i] || 0;
      if (rate > 0) {
        baseRate += rate;
      }
    }

    const childRates = roomRate.personTypeRates['child']?.rates || {};
    for (let i = 1; i <= children; i++) {
      const rate = childRates[i] || 0;
      if (rate > 0) {
        baseRate += rate;
      }
    }

    return baseRate;
  }

  private calculateMealPlanTotal(
    roomRate: RoomTypeRate,
    occupancy: RoomOccupancy,
    mealPlan: MealPlanType
  ): number {
    const { adults, children, infants } = occupancy;
    let mealPlanTotal = 0;

    const mealPlanRates = roomRate.mealPlanRates[mealPlan];
    if (mealPlanRates) {
      const adultMealPlan = adults * (mealPlanRates['adult'] || 0);
      const childMealPlan = children * (mealPlanRates['child'] || 0);
      const infantMealPlan = infants * (mealPlanRates['infant'] || 0);

      mealPlanTotal = adultMealPlan + childMealPlan + infantMealPlan;
    }

    return mealPlanTotal;
  }
}
