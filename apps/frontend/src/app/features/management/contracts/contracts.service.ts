import { buildPaginationParams } from '@/app/shared/utils/http-params.util';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Contract,
  ContractDto,
  ContractFilters,
  ContractPeriod,
  ContractPeriodDto,
  MealPlanSupplement,
  MealPlanSupplementDto,
  PaginatedResult,
  PaginationParams,
  RoomPrice,
  RoomPriceDto,
  StopSalesDate,
} from '@runner/shared/types';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContractsService {
  private readonly apiUrl = `${environment.apiUrl}/contracts`;
  private readonly http = inject(HttpClient);

  private readonly _contracts$ = new BehaviorSubject<Contract[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _totalCount$ = new BehaviorSubject<number>(0);

  readonly contracts$ = this._contracts$.asObservable();
  readonly loading$ = this._loading$.asObservable();
  readonly totalCount$ = this._totalCount$.asObservable();

  create(dto: ContractDto): Observable<Contract> {
    return this.http.post<Contract>(this.apiUrl, dto).pipe(
      tap((contractFromApi) => {
        this._contracts$.next([
          ...this._contracts$.getValue(),
          contractFromApi,
        ]);
      })
    );
  }

  update(id: string, dto: Partial<ContractDto>): Observable<Contract> {
    return this.http.patch<Contract>(`${this.apiUrl}/${id}`, dto).pipe(
      tap((updatedContract) => {
        this._contracts$.next(
          this._contracts$
            .getValue()
            .map((contract) =>
              contract.id === updatedContract.id ? updatedContract : contract
            )
        );
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._contracts$.next(
          this._contracts$.getValue().filter((contract) => contract.id !== id)
        );
      })
    );
  }

  findAll(
    filters: ContractFilters = {},
    pagination: PaginationParams = {}
  ): Observable<PaginatedResult<Contract>> {
    this._loading$.next(true);

    let params = buildPaginationParams(pagination);
    if (filters.hotelId) params = params.set('hotelId', filters.hotelId);
    if (filters.marketId) params = params.set('marketId', filters.marketId);

    return this.http
      .get<PaginatedResult<Contract>>(this.apiUrl, { params })
      .pipe(
        tap((result) => {
          this._loading$.next(false);
          this._contracts$.next(result.data);
          this._totalCount$.next(result.total);
        }),
        catchError((error) => {
          this._loading$.next(false);
          this._contracts$.next([]);
          this._totalCount$.next(0);
          return throwError(() => error);
        })
      );
  }

  findOne(id: string): Observable<Contract> {
    return this.http.get<Contract>(`${this.apiUrl}/${id}`);
  }

  createPeriod(
    contractId: string,
    dto: ContractPeriodDto
  ): Observable<ContractPeriod> {
    return this.http.post<ContractPeriod>(
      `${this.apiUrl}/${contractId}/periods`,
      dto
    );
  }

  updatePeriod(
    periodId: string,
    dto: Partial<ContractPeriodDto>,
    contractId: string
  ): Observable<ContractPeriod> {
    return this.http.patch<ContractPeriod>(
      `${this.apiUrl}/${contractId}/periods/${periodId}`,
      dto
    );
  }

  removePeriod(contractId: string, periodId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${contractId}/periods/${periodId}`
    );
  }

  createRoomPrice(
    contractId: string,
    periodId: string,
    dto: RoomPriceDto
  ): Observable<RoomPrice> {
    return this.http.post<RoomPrice>(
      `${this.apiUrl}/${contractId}/periods/${periodId}/room-prices`,
      dto
    );
  }

  updateRoomPrice(
    id: string,
    dto: Partial<RoomPriceDto>
  ): Observable<RoomPrice> {
    return this.http.patch<RoomPrice>(
      `${environment.apiUrl}/room-prices/${id}`,
      dto
    );
  }

  removeRoomPrice(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/room-prices/${id}`);
  }

  createMealPlanSupplement(
    contractId: string,
    periodId: string,
    dto: MealPlanSupplementDto
  ): Observable<MealPlanSupplement> {
    return this.http.post<MealPlanSupplement>(
      `${this.apiUrl}/${contractId}/periods/${periodId}/meal-supplements`,
      dto
    );
  }

  updateMealPlanSupplement(
    id: string,
    dto: Partial<MealPlanSupplementDto>
  ): Observable<MealPlanSupplement> {
    return this.http.patch<MealPlanSupplement>(
      `${environment.apiUrl}/meal-supplements/${id}`,
      dto
    );
  }

  removeMealPlanSupplement(id: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/meal-supplements/${id}`
    );
  }

  createStopSalesDate(
    contractId: string,
    periodId: string,
    date: string
  ): Observable<StopSalesDate> {
    return this.http.post<StopSalesDate>(
      `${this.apiUrl}/${contractId}/periods/${periodId}/stop-sales`,
      { date }
    );
  }

  removeStopSalesDate(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/stop-sales/${id}`);
  }
}
