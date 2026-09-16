import { getDiscountModeSeverity } from './offers-list.component';

describe('getDiscountModeSeverity', () => {
  it('returns "info" for SEQUENTIAL', () => {
    expect(getDiscountModeSeverity('SEQUENTIAL')).toBe('info');
  });

  it('returns "success" for ADDITIVE', () => {
    expect(getDiscountModeSeverity('ADDITIVE')).toBe('success');
  });
});
