import { checkOfferCompatibility } from './offer-compatibility';

describe('checkOfferCompatibility', () => {
  it('returns compatible for an empty list', () => {
    expect(checkOfferCompatibility([])).toEqual({ compatible: true });
  });

  it('returns compatible for a single offer', () => {
    expect(checkOfferCompatibility([{ discountMode: 'SEQUENTIAL' }])).toEqual({
      compatible: true,
    });
  });

  it('returns compatible when all offers share the same discount mode', () => {
    expect(
      checkOfferCompatibility([
        { discountMode: 'SEQUENTIAL' },
        { discountMode: 'SEQUENTIAL' },
      ])
    ).toEqual({ compatible: true });
  });

  it('returns incompatible when SEQUENTIAL and ADDITIVE are mixed', () => {
    const result = checkOfferCompatibility([
      { discountMode: 'SEQUENTIAL' },
      { discountMode: 'ADDITIVE' },
    ]);
    expect(result.compatible).toBe(false);
    expect(result.reason).toBeDefined();
  });
});
