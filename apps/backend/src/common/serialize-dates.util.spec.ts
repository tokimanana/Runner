import { serializeDates } from './serialize-dates.util';

describe('serializeDates', () => {
  describe('Date conversion', () => {
    it('convertit une Date seule en string ISO', () => {
      const input = new Date('2024-03-15T10:30:00.000Z');

      const result = serializeDates(input);

      expect(result).toBe('2024-03-15T10:30:00.000Z');
    });
  });
});
