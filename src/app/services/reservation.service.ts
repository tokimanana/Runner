import { Injectable } from "@angular/core";
import { combineLatest, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { ContractService } from "./contract.service";
import { SeasonService } from "./season.service";
import {
  ContractPeriodRate,
  Period,
  PeriodRateInfo,
  RoomTypeRate,
} from "../models/types";
import { ContractRateService } from "./contract-rates.service";

@Injectable({
  providedIn: "root",
})
export class ReservationService {
  constructor(
    private contractService: ContractService,
    private seasonService: SeasonService,
    private contractRateService: ContractRateService
  ) {}

  getPeriodsFromBooking(
    checkInDate: Date,
    checkOutDate: Date,
    seasonId: number
  ): Observable<Period[]> {
    if (!seasonId) {
      return of([]);
    }

    return this.seasonService.getPeriodsBySeason(seasonId).pipe(
      map((periods) => {
        const overlappingPeriods = periods.filter((period) => {
          const periodStart = new Date(period.startDate);
          const periodEnd = new Date(period.endDate);

          // Check for overlap with the booking dates
          return checkInDate <= periodEnd && checkOutDate >= periodStart;
        });
        return overlappingPeriods;
      })
    );
  }

  // Get room rate for a single period
  // getRoomRateForPeriod(roomTypeId: number, periodId: number, contractId: number, occupancy: {adults: number, children: number, infants: number}): Observable<number | null> {
  //   return this.contractRateService.getContractRates(contractId).pipe(
  //     map(contractRates => {
  //       // 2. Find the rate for the given roomTypeId and periodId
  //       const periodRate = contractRates.find(rate => rate.periodId === periodId);
  //       const roomRate = periodRate?.roomRates.find(rate => rate.roomTypeId === roomTypeId);

  //       if (!roomRate) {
  //         return null; // No rate found
  //       }

  //       // 3. Apply rate calculations based on rateType and occupancy
  //       let calculatedRate: number | null = null;
  //       if (roomRate.rateType === 'per_villa') {
  //         calculatedRate = roomRate.villaRate || null;
  //       } else if (roomRate.rateType === 'per_pax') {
  //         calculatedRate = this.calculatePerPaxRate(roomRate, occupancy);
  //       }

  //       return calculatedRate;
  //     })
  //   );
  // }

  // // Helper function to calculate per-pax rate based on occupancy
  // private calculatePerPaxRate(roomRate: RoomTypeRate, occupancy: { adults: number, children: number, infants: number }): number {
  //   let totalRate = 0;

  //   // Add adult rates
  //   totalRate += (roomRate.personTypeRates?.['adult']?.rates[occupancy.adults] || 0) * occupancy.adults;

  //   totalRate += this.calculateChildRate(roomRate, occupancy.children);

  //   totalRate += this.calculateInfantRate(roomRate, occupancy.infants);

  //   return totalRate;
  // }

  // // Implement logic for calculating child rates based on your business rules
  // private calculateChildRate(roomRate: RoomTypeRate, numChildren: number): number {
  //   // ... Your child rate calculation logic
  //   return 0; // Placeholder - replace with your logic
  // }

  // // Implement logic for calculating infant rates based on your business rules
  // private calculateInfantRate(roomRate: RoomTypeRate, numInfants: number): number {

  //   return 0;
  // }
}
