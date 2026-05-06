import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  private readonly seasonsSubject = new BehaviorSubject<Season[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private loaded = false;

  readonly seasons$ = this.seasonsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();

  private loadSeasons(params?: PaginationParams): void {
    this.loadingSubject.next(true);
    this.http
      .get<PaginatedResult<Season>>(`${this.apiUrl}/seasons`, {
        params: this.buildParams(params),
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
    return this.http.get<Season>(`${this.apiUrl}/seasons/${id}`);
  }

  createSeason(dto: SeasonDto): Observable<Season> {
    return this.http
      .post<Season>(`${this.apiUrl}/seasons`, dto)
      .pipe(tap(() => this.refresh()));
  }

  updateSeason(id: string, dto: Partial<SeasonDto>): Observable<Season> {
    return this.http
      .patch<Season>(`${this.apiUrl}/seasons/${id}`, dto)
      .pipe(tap(() => this.refresh()));
  }

  deleteSeason(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/seasons/${id}`)
      .pipe(tap(() => this.refresh()));
  }

  private buildParams(params?: PaginationParams): HttpParams {
    let httpParams = new HttpParams();
    if (params?.limit !== undefined)
      httpParams = httpParams.set('limit', params.limit);
    if (params?.offset !== undefined)
      httpParams = httpParams.set('offset', params.offset);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return httpParams;
  }

  private refresh(): void {
    this.loaded = false;
    this.loadSeasons();
  }
}
