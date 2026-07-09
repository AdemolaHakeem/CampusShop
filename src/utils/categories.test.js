import { describe, it, expect } from 'vitest';
import { CATEGORIES, CATEGORY_COLORS } from './categories';

describe('CATEGORIES', () => {
  it('is an array of category strings', () => {
    expect(Array.isArray(CATEGORIES)).toBe(true);
    expect(CATEGORIES.length).toBeGreaterThan(0);
  });

  it('contains expected categories', () => {
    expect(CATEGORIES).toContain('Electronics');
    expect(CATEGORIES).toContain('Books & Notes');
    expect(CATEGORIES).toContain('Clothing');
    expect(CATEGORIES).toContain('Other');
  });

  it('has exactly 10 categories', () => {
    expect(CATEGORIES).toHaveLength(10);
  });

  it('has no duplicates', () => {
    const unique = new Set(CATEGORIES);
    expect(unique.size).toBe(CATEGORIES.length);
  });
});

describe('CATEGORY_COLORS', () => {
  it('has a color for every category', () => {
    for (const category of CATEGORIES) {
      expect(CATEGORY_COLORS[category]).toBeDefined();
      expect(typeof CATEGORY_COLORS[category]).toBe('string');
    }
  });

  it('colors are valid hex strings', () => {
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    for (const color of Object.values(CATEGORY_COLORS)) {
      expect(color).toMatch(hexRegex);
    }
  });

  it('has no extra keys beyond defined categories', () => {
    const colorKeys = Object.keys(CATEGORY_COLORS);
    expect(colorKeys.sort()).toEqual([...CATEGORIES].sort());
  });
});
