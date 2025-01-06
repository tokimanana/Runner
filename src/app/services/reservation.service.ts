import { Injectable } from "@angular/core";
import { combineLatest, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { ContractService } from "./contract.service";
import { SeasonService } from "./season.service";
import {
  Contract,
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

  getContractsForReservation(hotelId: number): Observable<Contract[]> {
    return this.contractService.getAllContracts().pipe(
      map(contracts => contracts.filter(c => c.hotelId === hotelId))
    );
  }
  
  
}
