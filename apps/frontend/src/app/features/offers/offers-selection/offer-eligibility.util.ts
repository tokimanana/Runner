import { Offer } from '@runner/shared/types';

export interface Stay {
  readonly checkIn: string;
  readonly checkOut: string;
}

const MS_PER_DAY = 86_400_000;

function toDayNumber(isoDate: string): number {
  return Math.floor(Date.parse(isoDate.slice(0, 10)) / MS_PER_DAY);
}

export function isOfferEligible(
  offer: Pick<Offer, 'minStay' | 'offerPeriods'>,
  stay: Stay
): boolean {
  const firstNight = toDayNumber(stay.checkIn);
  const lastNight = toDayNumber(stay.checkOut) - 1;
  const nights = lastNight - firstNight + 1;

  if (nights < 1) return false;
  if (nights < (offer.minStay ?? 0)) return false;

  return offer.offerPeriods.some(
    (period) =>
      toDayNumber(period.startDate) < lastNight &&
      toDayNumber(period.endDate) >= firstNight
  );
}
