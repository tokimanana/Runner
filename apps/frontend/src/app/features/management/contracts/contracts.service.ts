import { buildPaginationParams } from '@/app/shared/utils/http-params.util';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Contract,
  ContractDto,
  ContractFilters,
  PaginatedResult,
  PaginationParams,
} from '@runner/shared/types';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContractsService {
  private readonly apiUrl = `${environment.apiUrl}/contracts`;
  private readonly http = inject(HttpClient);

  private readonly _contracts$ = new BehaviorSubject<Contract[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  readonly contracts$ = this._contracts$.asObservable();
  readonly loading$ = this._loading$.asObservable();

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
          this._contracts$.next(result.data);
          this._loading$.next(false);
        })
      );
  }

  findOne(id: string): Observable<Contract> {
    return this.http.get<Contract>(`${this.apiUrl}/${id}`);
  }
}
