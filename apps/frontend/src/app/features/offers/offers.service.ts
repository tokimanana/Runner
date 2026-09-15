import { buildPaginationParams } from '@/app/shared/utils/http-params.util';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Offer,
  OfferDto,
  OfferPeriod,
  OfferPeriodDto,
  OfferSupplement,
  OfferSupplementDto,
  PaginatedResult,
  PaginationParams,
} from '@runner/shared/types';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OffersService {
  private readonly apiUrl = `${environment.apiUrl}/offers`;
  private readonly http = inject(HttpClient);

  private readonly _offers$ = new BehaviorSubject<Offer[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _totalCount$ = new BehaviorSubject<number>(0);

  readonly offers$ = this._offers$.asObservable();
  readonly loading$ = this._loading$.asObservable();
  readonly totalCount$ = this._totalCount$.asObservable();

  findAll(
    pagination: PaginationParams = {}
  ): Observable<PaginatedResult<Offer>> {
    this._loading$.next(true);

    const params = buildPaginationParams(pagination);

    return this.http.get<PaginatedResult<Offer>>(this.apiUrl, { params }).pipe(
      tap((result) => {
        this._loading$.next(false);
        this._offers$.next(result.data);
        this._totalCount$.next(result.total);
      }),
      catchError((error) => {
        this._loading$.next(false);
        this._offers$.next([]);
        this._totalCount$.next(0);
        return throwError(() => error);
      })
    );
  }

  findOne(id: string): Observable<Offer> {
    return this.http.get<Offer>(`${this.apiUrl}/${id}`);
  }

  create(dto: OfferDto): Observable<Offer> {
    return this.http.post<Offer>(this.apiUrl, dto).pipe(
      tap((offerFromApi) => {
        this._offers$.next([...this._offers$.getValue(), offerFromApi]);
      })
    );
  }

  update(id: string, dto: Partial<OfferDto>): Observable<Offer> {
    return this.http.patch<Offer>(`${this.apiUrl}/${id}`, dto).pipe(
      tap((updatedOffer) => {
        this._offers$.next(
          this._offers$
            .getValue()
            .map((offer) =>
              offer.id === updatedOffer.id ? updatedOffer : offer
            )
        );
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._offers$.next(
          this._offers$.getValue().filter((offer) => offer.id !== id)
        );
      })
    );
  }

  createPeriod(offerId: string, dto: OfferPeriodDto): Observable<OfferPeriod> {
    return this.http.post<OfferPeriod>(
      `${this.apiUrl}/${offerId}/periods`,
      dto
    );
  }

  updatePeriod(
    offerId: string,
    periodId: string,
    dto: Partial<OfferPeriodDto>
  ): Observable<OfferPeriod> {
    return this.http.patch<OfferPeriod>(
      `${this.apiUrl}/${offerId}/periods/${periodId}`,
      dto
    );
  }

  removePeriod(offerId: string, periodId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${offerId}/periods/${periodId}`
    );
  }

  linkSupplement(
    offerId: string,
    dto: OfferSupplementDto
  ): Observable<OfferSupplement> {
    return this.http.post<OfferSupplement>(
      `${this.apiUrl}/${offerId}/supplements`,
      dto
    );
  }

  unlinkSupplement(offerId: string, supplementId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${offerId}/supplements/${supplementId}`
    );
  }
}
