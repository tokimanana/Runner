import { environment } from '@/environments/environment';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Offer, OfferDto, PaginatedResult } from '@runner/shared/types';
import { firstValueFrom } from 'rxjs';
import { OffersService } from './offers.service';

describe('OffersService', () => {
  let service: OffersService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/offers`;

  const buildOffer = (overrides: Partial<Offer> = {}): Offer => ({
    id: 'offer-1',
    code: 'SUMMER10',
    name: 'Summer discount',
    type: 'PERCENTAGE',
    value: 10,
    discountMode: 'SEQUENTIAL',
    applyToRoomOnly: false,
    applyToMealSupplements: false,
    tourOperatorId: 'to-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OffersService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(OffersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('findAll', () => {
    it('should publish offers and totalCount on success, and toggle loading', () => {
      const offer = buildOffer();
      const result: PaginatedResult<Offer> = {
        data: [offer],
        total: 1,
        limit: 20,
        offset: 0,
      };

      let loadingDuringRequest: boolean | undefined;
      service.loading$.subscribe((loading) => (loadingDuringRequest = loading));

      const request$ = service.findAll();
      expect(loadingDuringRequest).toBe(true);

      request$.subscribe();

      const req = httpMock.expectOne(
        (r) => r.method === 'GET' && r.url === apiUrl
      );
      req.flush(result);

      expect(loadingDuringRequest).toBe(false);

      let offers: Offer[] = [];
      service.offers$.subscribe((value) => (offers = value));
      expect(offers).toEqual([offer]);

      let totalCount = 0;
      service.totalCount$.subscribe((value) => (totalCount = value));
      expect(totalCount).toBe(1);
    });

    it('should reset offers/totalCount, stop loading, and rethrow on error', async () => {
      const request$ = service.findAll();
      const assertion = firstValueFrom(request$).catch((error) => error);

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      const error = await assertion;
      expect(error).toBeInstanceOf(HttpErrorResponse);

      let loading: boolean | undefined;
      service.loading$.subscribe((value) => (loading = value));
      expect(loading).toBe(false);

      let offers: Offer[] | undefined;
      service.offers$.subscribe((value) => (offers = value));
      expect(offers).toEqual([]);

      let totalCount: number | undefined;
      service.totalCount$.subscribe((value) => (totalCount = value));
      expect(totalCount).toBe(0);
    });
  });

  describe('create', () => {
    it('should append the created offer to the current offers list', () => {
      const existing = buildOffer({ id: 'offer-existing' });
      const created = buildOffer({ id: 'offer-new', code: 'WINTER15' });
      const dto: OfferDto = {
        code: 'WINTER15',
        name: 'Winter discount',
        type: 'PERCENTAGE',
        value: 15,
        discountMode: 'ADDITIVE',
        applyToRoomOnly: false,
        applyToMealSupplements: false,
      };

      // Seed the internal state via a prior findAll, matching how the app would
      // actually reach this state — avoids reaching into service internals.
      service.findAll().subscribe();
      httpMock.expectOne(apiUrl).flush({
        data: [existing],
        total: 1,
        limit: 20,
        offset: 0,
      } as PaginatedResult<Offer>);

      service.create(dto).subscribe();
      httpMock.expectOne({ method: 'POST', url: apiUrl }).flush(created);

      let offers: Offer[] = [];
      service.offers$.subscribe((value) => (offers = value));
      expect(offers).toEqual([existing, created]);
    });
  });

  describe('update', () => {
    it('should replace the matching offer in the current offers list', () => {
      const original = buildOffer({ id: 'offer-1', name: 'Old name' });
      const updated = buildOffer({ id: 'offer-1', name: 'New name' });

      service.findAll().subscribe();
      httpMock.expectOne(apiUrl).flush({
        data: [original],
        total: 1,
        limit: 20,
        offset: 0,
      } as PaginatedResult<Offer>);

      service.update('offer-1', { name: 'New name' }).subscribe();
      httpMock
        .expectOne({ method: 'PATCH', url: `${apiUrl}/offer-1` })
        .flush(updated);

      let offers: Offer[] = [];
      service.offers$.subscribe((value) => (offers = value));
      expect(offers).toEqual([updated]);
    });
  });

  describe('remove', () => {
    it('should remove the matching offer from the current offers list', () => {
      const toKeep = buildOffer({ id: 'offer-keep' });
      const toRemove = buildOffer({ id: 'offer-remove' });

      service.findAll().subscribe();
      httpMock.expectOne(apiUrl).flush({
        data: [toKeep, toRemove],
        total: 2,
        limit: 20,
        offset: 0,
      } as PaginatedResult<Offer>);

      service.remove('offer-remove').subscribe();
      httpMock
        .expectOne({ method: 'DELETE', url: `${apiUrl}/offer-remove` })
        .flush(null);

      let offers: Offer[] = [];
      service.offers$.subscribe((value) => (offers = value));
      expect(offers).toEqual([toKeep]);
    });
  });
});
