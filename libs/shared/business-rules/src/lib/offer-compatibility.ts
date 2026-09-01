import { DiscountMode, Offer } from '@runner/shared/types';

export interface CompatibilityResult {
  compatible: boolean;
  reason?: string;
}

export function checkOfferCompatibility(
  offers: Pick<Offer, 'discountMode'>[]
): CompatibilityResult {
  if (offers.length <= 1) {
    return { compatible: true };
  }

  const modes = new Set<DiscountMode>(
    offers.map((offer) => offer.discountMode)
  );

  if (modes.size > 1) {
    return {
      compatible: false,
      reason:
        'Offers with SEQUENTIAL and ADDITIVE discount modes cannot be combined',
    };
  }

  return { compatible: true };
}
