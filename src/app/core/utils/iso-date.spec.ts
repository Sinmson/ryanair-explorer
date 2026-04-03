import { describe, it, expect } from 'vitest';
import { formatLocalIsoDateOnly, parseEasyJetApiDate, parseIsoDateOnlyToLocalDate } from './iso-date';

describe('parseIsoDateOnlyToLocalDate', () => {
  it('builds a local calendar date without shifting the day', () => {
    const date = parseIsoDateOnlyToLocalDate('2026-03-30');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(30);
  });

  it('rejects invalid format', () => {
    expect(() => parseIsoDateOnlyToLocalDate('30.03.2026')).toThrow();
  });
});

describe('parseEasyJetApiDate', () => {
  it('parses YYYY-MM-DD like parseIsoDateOnlyToLocalDate', () => {
    expect(parseEasyJetApiDate('2026-03-30')).toEqual(parseIsoDateOnlyToLocalDate('2026-03-30'));
  });

  it('parses full ISO datetimes', () => {
    expect(parseEasyJetApiDate('2026-05-25T12:00:00.000Z').toISOString()).toBe('2026-05-25T12:00:00.000Z');
  });

  it('rejects unparseable values', () => {
    expect(() => parseEasyJetApiDate('not-a-date')).toThrow();
  });
});

describe('formatLocalIsoDateOnly', () => {
  it('formats local calendar date as YYYY-MM-DD', () => {
    const d = parseIsoDateOnlyToLocalDate('2026-03-30');
    expect(formatLocalIsoDateOnly(d)).toBe('2026-03-30');
  });
});
