import { Offer } from '@runner/shared/types';
import { isOfferEligible } from './offer-eligibility.util';

function offerWith(
  periods: [string, string][],
  minStay?: number
): Pick<Offer, 'minStay' | 'offerPeriods'> {
  return {
    minStay,
    offerPeriods: periods.map(([start, end], i) => ({
      id: `p${i}`,
      offerId: 'o1',
      startDate: `${start}T00:00:00.000Z`,
      endDate: `${end}T00:00:00.000Z`,
      createdAt: '',
      updatedAt: '',
    })),
  };
}

const stay = { checkIn: '2026-12-10', checkOut: '2026-12-15' };

describe('isOfferEligible', () => {
  it('is eligible when a period covers only the start of the stay', () => {
    expect(
      isOfferEligible(offerWith([['2026-12-01', '2026-12-12']]), stay)
    ).toBe(true);
  });

  it('is not eligible when the period ends before check-in', () => {
    expect(
      isOfferEligible(offerWith([['2026-12-01', '2026-12-09']]), stay)
    ).toBe(false);
  });

  it('is eligible when the period ends on the check-in day', () => {
    expect(
      isOfferEligible(offerWith([['2026-12-01', '2026-12-10']]), stay)
    ).toBe(true);
  });

  it('is eligible when the period starts on the last night', () => {
    expect(
      isOfferEligible(offerWith([['2026-12-14', '2026-12-20']]), stay)
    ).toBe(true);
  });

  it('is not eligible when the period starts on the check-out day', () => {
    expect(
      isOfferEligible(offerWith([['2026-12-15', '2026-12-20']]), stay)
    ).toBe(false);
  });

  it('is not eligible without any period', () => {
    expect(isOfferEligible(offerWith([]), stay)).toBe(false);
  });

  it('is eligible when any one of several periods matches', () => {
    const offer = offerWith([
      ['2026-11-01', '2026-11-30'],
      ['2026-12-12', '2026-12-31'],
    ]);
    expect(isOfferEligible(offer, stay)).toBe(true);
  });

  it('is not eligible when the stay is shorter than minStay', () => {
    expect(
      isOfferEligible(offerWith([['2026-12-01', '2026-12-31']], 6), stay)
    ).toBe(false);
  });

  it('is eligible when the stay is exactly minStay nights', () => {
    expect(
      isOfferEligible(offerWith([['2026-12-01', '2026-12-31']], 5), stay)
    ).toBe(true);
  });

  it('is not eligible when check-out is not after check-in', () => {
    const sameDay = { checkIn: '2026-12-10', checkOut: '2026-12-10' };
    expect(
      isOfferEligible(offerWith([['2026-12-01', '2026-12-31']]), sameDay)
    ).toBe(false);
  });
});
