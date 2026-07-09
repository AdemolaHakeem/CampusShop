import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatPrice, getWhatsAppLink, timeAgo } from './helpers';

describe('formatPrice', () => {
  it('formats a number as Nigerian Naira currency', () => {
    const result = formatPrice(5000);
    expect(result).toContain('5,000');
  });

  it('formats zero', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
  });

  it('formats large numbers with commas', () => {
    const result = formatPrice(1500000);
    expect(result).toContain('1,500,000');
  });

  it('strips fractional digits', () => {
    const result = formatPrice(1999.99);
    expect(result).toContain('2,000');
  });
});

describe('getWhatsAppLink', () => {
  it('generates a WhatsApp link with cleaned phone number', () => {
    const link = getWhatsAppLink('+234-801-234-5678', 'Used Laptop');
    expect(link).toContain('https://wa.me/2348012345678');
  });

  it('encodes the item title in the message', () => {
    const link = getWhatsAppLink('08012345678', 'Blue Backpack');
    expect(link).toContain('text=');
    expect(link).toContain('Blue%20Backpack');
  });

  it('strips non-digit characters from phone', () => {
    const link = getWhatsAppLink('(080) 123-4567', 'Item');
    expect(link).toContain('https://wa.me/0801234567');
  });
});

describe('timeAgo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string for null/undefined timestamp', () => {
    expect(timeAgo(null)).toBe('');
    expect(timeAgo(undefined)).toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(timeAgo('not-a-date')).toBe('');
  });

  it('returns "Just now" for recent timestamps', () => {
    const now = new Date();
    expect(timeAgo(now)).toBe('Just now');
  });

  it('returns minutes ago', () => {
    vi.useFakeTimers();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinutesAgo)).toBe('5 minutes ago');
    vi.useRealTimers();
  });

  it('returns singular form for 1 unit', () => {
    vi.useFakeTimers();
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    expect(timeAgo(oneHourAgo)).toBe('1 hour ago');
    vi.useRealTimers();
  });

  it('returns days ago', () => {
    vi.useFakeTimers();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(timeAgo(threeDaysAgo)).toBe('3 days ago');
    vi.useRealTimers();
  });

  it('returns weeks ago', () => {
    vi.useFakeTimers();
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    expect(timeAgo(twoWeeksAgo)).toBe('2 weeks ago');
    vi.useRealTimers();
  });

  it('returns months ago', () => {
    vi.useFakeTimers();
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(timeAgo(twoMonthsAgo)).toBe('2 months ago');
    vi.useRealTimers();
  });

  it('returns years ago', () => {
    vi.useFakeTimers();
    const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
    expect(timeAgo(twoYearsAgo)).toBe('2 years ago');
    vi.useRealTimers();
  });

  it('handles Firestore-like timestamp with toDate()', () => {
    vi.useFakeTimers();
    const mockTimestamp = {
      toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000),
    };
    expect(timeAgo(mockTimestamp)).toBe('2 hours ago');
    vi.useRealTimers();
  });

  it('handles ISO date strings', () => {
    vi.useFakeTimers();
    const isoString = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(isoString)).toBe('1 day ago');
    vi.useRealTimers();
  });
});
