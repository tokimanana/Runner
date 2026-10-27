import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Offer, OfferPeriodDto } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { OffersService } from '../offers.service';
import { OfferFormComponent } from './offer-form.component';

describe('OfferFormComponent — period rows', () => {
  let component: OfferFormComponent;
  let fixture: ComponentFixture<OfferFormComponent>;

  const offersService = {
    create: jest.fn(),
    update: jest.fn(),
    createPeriod: jest.fn(),
    updatePeriod: jest.fn(),
    removePeriod: jest.fn(),
  };

  const june: OfferPeriodDto = {
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-06-10T00:00:00.000Z',
  };
  const july: OfferPeriodDto = {
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2026-07-10T00:00:00.000Z',
  };
  const aug: OfferPeriodDto = {
    startDate: '2026-08-01T00:00:00.000Z',
    endDate: '2026-08-10T00:00:00.000Z',
  };
  const sep: OfferPeriodDto = {
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2026-09-10T00:00:00.000Z',
  };

  // offre du serveur avec deux périodes (juin et juillet)
  const existingOffer = {
    id: 'offer-1',
    code: 'SUMMER10',
    name: 'Summer',
    type: 'PERCENTAGE',
    value: 10,
    discountMode: 'SEQUENTIAL',
    applyToRoomOnly: false,
    applyToMealSupplements: false,
    tourOperatorId: 'to-1',
    offerPeriods: [
      { id: 'p-june', ...june },
      { id: 'p-july', ...july },
    ],
    applicableSupplements: [],
  } as unknown as Offer;

  const rowStarting = (iso: string) =>
    component.visibleRows().find((r) => r.data.startDate === iso)!;

  const openExistingOffer = () => {
    fixture.componentRef.setInput('offer', existingOffer);
    fixture.detectChanges();
  };

  beforeEach(() => {
    jest.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [OfferFormComponent],
      providers: [
        { provide: OffersService, useValue: offersService },
        MessageService,
        ConfirmationService,
        provideNoopAnimations(),
      ],
    });
    fixture = TestBed.createComponent(OfferFormComponent);
    component = fixture.componentInstance;
  });

  it('adds a new period as CREATED', () => {
    component.addPeriod(june);

    expect(component.visibleRows()).toEqual([
      expect.objectContaining({ data: june, status: 'CREATED' }),
    ]);
  });

  it('keeps a CREATED period as CREATED when it is edited', () => {
    component.addPeriod(june);
    const { clientKey } = component.visibleRows()[0];

    component.editPeriod(clientKey, july);

    expect(component.visibleRows()).toEqual([
      expect.objectContaining({ clientKey, data: july, status: 'CREATED' }),
    ]);
  });

  it('sends nothing for a period added then removed before saving', () => {
    openExistingOffer();
    component.addPeriod(aug);
    component.removePeriod(rowStarting(aug.startDate).clientKey);
    offersService.update.mockReturnValue(of(existingOffer));

    component.submit();

    expect(offersService.createPeriod).not.toHaveBeenCalled();
    expect(offersService.removePeriod).not.toHaveBeenCalled();
  });

  it('does not resend rows that already succeeded when saving again after a failure', () => {
    openExistingOffer();
    const savedSpy = jest.fn();
    component.saved.subscribe(savedSpy);

    // juin modifiée, juillet supprimée, août et septembre ajoutées
    component.editPeriod(rowStarting(june.startDate).clientKey, {
      ...june,
      endDate: '2026-06-20T00:00:00.000Z',
    });
    component.removePeriod(rowStarting(july.startDate).clientKey);
    component.addPeriod(aug);
    component.addPeriod(sep);

    offersService.update.mockReturnValue(of(existingOffer));
    offersService.updatePeriod.mockReturnValue(of({}));
    offersService.removePeriod.mockReturnValue(of(undefined));
    offersService.createPeriod
      .mockReturnValueOnce(of({ id: 'srv-aug' })) // août : ok
      .mockReturnValueOnce(throwError(() => new Error('network'))) // septembre : échec
      .mockReturnValueOnce(of({ id: 'srv-sep' })); // septembre, au deuxième essai

    component.submit();

    expect(component.visibleRows()).toEqual([
      expect.objectContaining({ status: 'UNCHANGED' }), // juin
      expect.objectContaining({
        data: aug,
        serverId: 'srv-aug',
        status: 'UNCHANGED',
      }),
      expect.objectContaining({ data: sep, status: 'CREATED' }),
    ]);
    expect(savedSpy).not.toHaveBeenCalled();

    component.submit(); // deuxième clic

    expect(offersService.updatePeriod).toHaveBeenCalledTimes(1);
    expect(offersService.removePeriod).toHaveBeenCalledTimes(1);
    expect(offersService.removePeriod).toHaveBeenCalledWith(
      'offer-1',
      'p-july'
    );
    expect(
      offersService.createPeriod.mock.calls.filter(
        ([, dto]) => dto === aug || dto.startDate === aug.startDate
      )
    ).toHaveLength(1);
    expect(
      offersService.createPeriod.mock.calls.filter(
        ([, dto]) => dto.startDate === sep.startDate
      )
    ).toHaveLength(2);
    expect(savedSpy).toHaveBeenCalledTimes(1);
  });

  it('updates instead of creating again when saving is retried after a partial failure', () => {
    component.form.patchValue({ code: 'SUMMER10', name: 'Summer' });
    component.addPeriod(aug);

    offersService.create.mockReturnValue(of({ id: 'offer-1' }));
    offersService.update.mockReturnValue(of({ id: 'offer-1' }));
    offersService.createPeriod
      .mockReturnValueOnce(throwError(() => new Error('network')))
      .mockReturnValueOnce(of({ id: 'srv-aug' }));

    component.submit(); // l'offre est créée, la période échoue
    component.submit(); // doit mettre à jour, pas recréer

    expect(offersService.create).toHaveBeenCalledTimes(1);
    expect(offersService.update).toHaveBeenCalledTimes(1);
    expect(offersService.update).toHaveBeenCalledWith(
      'offer-1',
      expect.objectContaining({ code: 'SUMMER10' })
    );
  });
});
