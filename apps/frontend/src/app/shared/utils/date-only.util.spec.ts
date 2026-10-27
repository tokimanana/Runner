import { fromDateOnlyIso, toDateOnlyIso } from './date-only.util';

describe('date-only util', () => {
  it('stores the picked calendar day as midnight UTC', () => {
    expect(toDateOnlyIso(new Date(2026, 6, 15))).toBe(
      '2026-07-15T00:00:00.000Z'
    );
  });

  it('round-trips to the same calendar day', () => {
    const picked = new Date(2026, 6, 15);
    const back = fromDateOnlyIso(toDateOnlyIso(picked));
    expect([back.getFullYear(), back.getMonth(), back.getDate()]).toEqual([
      2026, 6, 15,
    ]);
  });
});
