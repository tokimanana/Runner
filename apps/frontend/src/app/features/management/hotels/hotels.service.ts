import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';

import { buildPaginationParams } from '@/app/shared/utils/http-params.util';
import {
  AgeCategory,
  AgeCategoryDto,
  Hotel,
  HotelDto,
  PaginatedResult,
  PaginationParams,
  RoomType,
  RoomTypeCapacity,
  RoomTypeCapacityDto,
  RoomTypeDto,
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
        params: buildPaginationParams(params),
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
      .pipe(tap(() => this.reload()));
  }

  updateHotel(id: string, dto: Partial<HotelDto>): Observable<Hotel> {
    return this.http
      .patch<Hotel>(`${this.apiUrl}/hotels/${id}`, dto)
      .pipe(tap(() => this.reload()));
  }

  deleteHotel(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/hotels/${id}`)
      .pipe(tap(() => this.reload()));
  }

  reload(): void {
    this.loaded = false;
    this.loadHotels();
  }

  getAgeCategories(hotelId: string): Observable<AgeCategory[]> {
    return this.http.get<AgeCategory[]>(
      `${this.apiUrl}/hotels/${hotelId}/age-categories`
    );
  }

  createAgeCategory(
    hotelId: string,
    dto: AgeCategoryDto
  ): Observable<AgeCategory> {
    return this.http.post<AgeCategory>(
      `${this.apiUrl}/hotels/${hotelId}/age-categories`,
      dto
    );
  }

  updateAgeCategory(
    hotelId: string,
    catId: string,
    dto: Partial<AgeCategoryDto>
  ): Observable<AgeCategory> {
    return this.http.patch<AgeCategory>(
      `${this.apiUrl}/hotels/${hotelId}/age-categories/${catId}`,
      dto
    );
  }

  deleteAgeCategory(hotelId: string, catId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/hotels/${hotelId}/age-categories/${catId}`
    );
  }

  getRoomTypes(hotelId: string): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(
      `${this.apiUrl}/hotels/${hotelId}/room-types`
    );
  }

  createRoomType(hotelId: string, dto: RoomTypeDto): Observable<RoomType> {
    return this.http.post<RoomType>(
      `${this.apiUrl}/hotels/${hotelId}/room-types`,
      dto
    );
  }

  updateRoomType(
    hotelId: string,
    typeId: string,
    dto: Partial<RoomTypeDto>
  ): Observable<RoomType> {
    return this.http.patch<RoomType>(
      `${this.apiUrl}/hotels/${hotelId}/room-types/${typeId}`,
      dto
    );
  }

  deleteRoomType(hotelId: string, typeId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/hotels/${hotelId}/room-types/${typeId}`
    );
  }

  createRoomTypeCapacity(
    hotelId: string,
    typeId: string,
    dto: RoomTypeCapacityDto
  ): Observable<RoomTypeCapacity> {
    return this.http.post<RoomTypeCapacity>(
      `${this.apiUrl}/hotels/${hotelId}/room-types/${typeId}/capacities`,
      dto
    );
  }

  updateRoomTypeCapacity(
    hotelId: string,
    typeId: string,
    capacityId: string,
    dto: Partial<RoomTypeCapacityDto>
  ): Observable<RoomTypeCapacity> {
    return this.http.patch<RoomTypeCapacity>(
      `${this.apiUrl}/hotels/${hotelId}/room-types/${typeId}/capacities/${capacityId}`,
      dto
    );
  }

  deleteRoomTypeCapacity(
    hotelId: string,
    typeId: string,
    capacityId: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/hotels/${hotelId}/room-types/${typeId}/capacities/${capacityId}`
    );
  }
}
