import { buildPaginationParams } from '@/app/shared/utils/http-params.util';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  PaginatedResult,
  PaginationParams,
  Season,
  SeasonDto,
} from '@runner/shared/types';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SeasonsService {
  private readonly apiUrl = `${environment.apiUrl}/seasons`;
  private readonly http = inject(HttpClient);

  private readonly seasonsSubject = new BehaviorSubject<Season[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(true);
  private loaded = false;

  readonly seasons$ = this.seasonsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();

  private loadSeasons(params?: PaginationParams): void {
    this.loadingSubject.next(true);
    this.http
      .get<PaginatedResult<Season>>(this.apiUrl, {
        params: buildPaginationParams(params),
      })
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.seasonsSubject.next(res.data);
          this.loaded = true;
          this.loadingSubject.next(false);
        },
        error: (err) => {
          console.error('Failed to load seasons', err);
          this.loadingSubject.next(false);
        },
      });
  }

  getSeasons(params?: PaginationParams): Observable<Season[]> {
    if (!this.loaded) {
      this.loadSeasons(params);
    }

    return this.seasons$;
  }

  getSeasonById(id: string): Observable<Season> {
    return this.http.get<Season>(`${this.apiUrl}/${id}`);
  }

  createSeason(dto: SeasonDto): Observable<Season> {
    return this.http
      .post<Season>(this.apiUrl, dto)
      .pipe(tap(() => this.reload()));
  }

  updateSeason(id: string, dto: Partial<SeasonDto>): Observable<Season> {
    return this.http
      .patch<Season>(`${this.apiUrl}/${id}`, dto)
      .pipe(tap(() => this.reload()));
  }

  deleteSeason(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.reload()));
  }

  reload(): void {
    this.loaded = false;
    this.loadSeasons();
  }
}
