import { buildPaginationParams } from '@/app/shared/utils/http-params.util';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Market,
  MarketDto,
  PaginatedResult,
  PaginationParams,
} from '@runner/shared/types';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarketsService {
  private readonly apiUrl = `${environment.apiUrl}/markets`;
  private readonly http = inject(HttpClient);

  private readonly _markets$ = new BehaviorSubject<Market[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private loaded = false;

  readonly markets$ = this._markets$.asObservable();
  readonly loading$ = this._loading$.asObservable();

  private load(params?: PaginationParams): void {
    this._loading$.next(true);
    this.http
      .get<PaginatedResult<Market>>(this.apiUrl, {
        params: buildPaginationParams(params),
      })
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this._markets$.next(result.data);
          this.loaded = true;
          this._loading$.next(false);
        },
        error: (err) => {
          console.error('Failed to load markets', err);
          this._loading$.next(false);
        },
      });
  }

  getAll(params?: PaginationParams): Observable<Market[]> {
    if (!this.loaded) {
      this.load(params);
    }
    return this.markets$;
  }

  create(dto: MarketDto): Observable<Market> {
    return this.http
      .post<Market>(this.apiUrl, dto)
      .pipe(tap(() => this.reload()));
  }

  update(id: string, dto: Partial<MarketDto>): Observable<Market> {
    return this.http
      .patch<Market>(`${this.apiUrl}/${id}`, dto)
      .pipe(tap(() => this.reload()));
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.reload()));
  }

  reload(): void {
    this.loaded = false;
    this.load();
  }
}
