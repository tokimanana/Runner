import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';

import {
  Hotel,
  HotelDto,
  PaginatedResult,
  PaginationParams,
} from '@runner/shared/types';

@Injectable({
  providedIn: 'root',
})
export class HotelsService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  private readonly hotelsSubject = new BehaviorSubject<Hotel[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private loaded = false;

  readonly hotels$ = this.hotelsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();

  private loadHotels(params?: PaginationParams): void {
    this.loadingSubject.next(true);
    this.http
      .get<PaginatedResult<Hotel>>(`${this.apiUrl}/hotels`, {
        params: this.buildParams(params),
      })
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.hotelsSubject.next(res.data);
          this.loaded = true;
          this.loadingSubject.next(false);
        },
        error: (err) => {
          console.error('Failed to load hotels', err);
          this.loadingSubject.next(false);
        },
      });
  }

  getHotels(params?: PaginationParams): Observable<Hotel[]> {
    if (!this.loaded) {
      this.loadHotels(params);
    }

    return this.hotels$;
  }

  getHotelById(id: string): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.apiUrl}/hotels/${id}`);
  }

  createHotel(dto: HotelDto): Observable<Hotel> {
    return this.http
      .post<Hotel>(`${this.apiUrl}/hotels`, dto)
      .pipe(tap(() => this.refresh()));
  }

  updateHotel(id: string, dto: Partial<HotelDto>): Observable<Hotel> {
    return this.http
      .patch<Hotel>(`${this.apiUrl}/hotels/${id}`, dto)
      .pipe(tap(() => this.refresh()));
  }

  deleteHotel(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/hotels/${id}`)
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
    this.loadHotels();
  }
}
