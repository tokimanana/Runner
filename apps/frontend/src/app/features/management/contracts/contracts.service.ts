import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Contract,
  ContractDto,
  ContractPeriod,
  ContractPeriodDto,
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
  private _loaded = false;

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

  createPeriod(
    contractId: string,
    dto: ContractPeriodDto
  ): Observable<ContractPeriod> {
    return this.http.post<ContractPeriod>(
      `${this.apiUrl}/${contractId}/periods`,
      dto
    );
  }
}
