import { buildPaginationParams } from '@/app/shared/utils/http-params.util';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  PaginatedResult,
  PaginationParams,
  Supplement,
  SupplementDto,
} from '@runner/shared/types';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupplementsService {
  private readonly apiUrl = `${environment.apiUrl}/supplements`;
  private readonly http = inject(HttpClient);

  private readonly _supplements$ = new BehaviorSubject<Supplement[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private loaded = false;

  readonly supplements$ = this._supplements$.asObservable();
  readonly loading$ = this._loading$.asObservable();

  private load(params?: PaginationParams): void {
    this._loading$.next(true);
    this.http
      .get<PaginatedResult<Supplement>>(this.apiUrl, {
        params: buildPaginationParams(params),
      })
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this._supplements$.next(result.data);
          this.loaded = true;
          this._loading$.next(false);
        },
        error: (err) => {
          console.error('Failed to load supplements', err);
          this._loading$.next(false);
        },
      });
  }

  getAll(params?: PaginationParams): Observable<Supplement[]> {
    if (!this.loaded) {
      this.load(params);
    }
    return this.supplements$;
  }

  create(dto: SupplementDto): Observable<Supplement> {
    return this.http
      .post<Supplement>(this.apiUrl, dto)
      .pipe(tap(() => this.reload()));
  }

  update(id: string, dto: Partial<SupplementDto>): Observable<Supplement> {
    return this.http
      .patch<Supplement>(`${this.apiUrl}/${id}`, dto)
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
