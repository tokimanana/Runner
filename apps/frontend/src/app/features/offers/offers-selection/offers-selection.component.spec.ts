import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountMode, Offer } from '@runner/shared/types';
import { OffersSelectionComponent } from './offers-selection.component';

function buildOffer(
  id: string,
  discountMode: DiscountMode,
  period: [string, string]
): Offer {
  return {
    id,
    code: id.toUpperCase(),
    name: `Offer ${id}`,
    type: 'PERCENTAGE',
    value: 10,
    discountMode,
    applyToRoomOnly: false,
    applyToMealSupplements: false,
    tourOperatorId: 't1',
    createdAt: '',
    updatedAt: '',
    offerPeriods: [
      {
        id: `p-${id}`,
        offerId: id,
        startDate: `${period[0]}T00:00:00.000Z`,
        endDate: `${period[1]}T00:00:00.000Z`,
        createdAt: '',
        updatedAt: '',
      },
    ],
    applicableSupplements: [],
  };
}

describe('OffersSelectionComponent', () => {
  let fixture: ComponentFixture<OffersSelectionComponent>;

  const wideOffer = buildOffer('a', 'SEQUENTIAL', ['2026-12-01', '2026-12-31']);
  const shortOffer = buildOffer('b', 'SEQUENTIAL', [
    '2026-12-01',
    '2026-12-12',
  ]);

  function setup(inputs: {
    stay: { checkIn: string; checkOut: string };
    selectedIds: string[];
  }): void {
    fixture = TestBed.createComponent(OffersSelectionComponent);
    fixture.componentRef.setInput('offers', [wideOffer, shortOffer]);
    fixture.componentRef.setInput('stay', inputs.stay);
    fixture.componentRef.setInput('selectedIds', inputs.selectedIds);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OffersSelectionComponent] });
  });

  it('keeps the selection while every selected offer stays eligible', () => {
    setup({
      stay: { checkIn: '2026-12-10', checkOut: '2026-12-15' },
      selectedIds: ['a', 'b'],
    });

    expect(fixture.componentInstance.selectedIds()).toEqual(['a', 'b']);
  });

  it('drops a selected offer when a stay change makes it ineligible', () => {
    setup({
      stay: { checkIn: '2026-12-10', checkOut: '2026-12-15' },
      selectedIds: ['a', 'b'],
    });

    fixture.componentRef.setInput('stay', {
      checkIn: '2026-12-20',
      checkOut: '2026-12-25',
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedIds()).toEqual(['a']);
  });

  it('drops an ineligible id injected by the parent', () => {
    setup({
      stay: { checkIn: '2026-12-20', checkOut: '2026-12-25' },
      selectedIds: ['a', 'b'],
    });

    expect(fixture.componentInstance.selectedIds()).toEqual(['a']);
  });
});
