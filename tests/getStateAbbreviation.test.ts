import { getStateAbbreviation } from '../utils/getStateAbbreviation';

describe('getStateAbbreviation', () => {
  test('returns abbreviation for known state names', () => {
    expect(getStateAbbreviation('California')).toBe('CA');
    expect(getStateAbbreviation('ca')).toBe('CA');
    expect(getStateAbbreviation('Texas')).toBe('TX');
  });

  test('returns UNKNOWN for unknown states', () => {
    expect(getStateAbbreviation('unknown')).toBe('UNKNOWN');
  });
});
