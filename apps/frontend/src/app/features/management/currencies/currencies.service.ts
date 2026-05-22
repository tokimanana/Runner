import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Currency, CurrencyDto } from '@runner/shared/types';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CurrenciesService {
  private readonly apiUrl = `${environment.apiUrl}/currencies`;
  private readonly http = inject(HttpClient);

  private readonly _currencies$ = new BehaviorSubject<Currency[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private loaded = false;

  readonly currencies$ = this._currencies$.asObservable();
  readonly loading$ = this._loading$.asObservable();

  private load(): void {
    this._loading$.next(true);
    this.http
      .get<Currency[]>(this.apiUrl)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this._currencies$.next(result);
          this.loaded = true;
          this._loading$.next(false);
        },
        error: (err) => {
          console.error('Failed to load currencies', err);
          this._loading$.next(false);
        },
      });
  }

  getAll(): Observable<Currency[]> {
    if (!this.loaded) {
      this.load();
    }
    return this.currencies$;
  }

  create(dto: CurrencyDto): Observable<Currency> {
    return this.http
      .post<Currency>(this.apiUrl, dto)
      .pipe(tap(() => this.refresh()));
  }

  update(id: string, dto: Partial<CurrencyDto>): Observable<Currency> {
    return this.http
      .patch<Currency>(`${this.apiUrl}/${id}`, dto)
      .pipe(tap(() => this.refresh()));
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.refresh()));
  }

  private refresh(): void {
    this.loaded = false;
    this.load();
  }
}
