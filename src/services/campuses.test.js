import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('./supabase', () => ({
  supabase: mockSupabase,
}));

vi.mock('../data/campuses.js', () => ({
  default: [
    { name: 'University of Lagos', web: 'https://www.unilag.edu.ng/' },
    { name: 'University of Ibadan', web: 'https://www.ui.edu.ng/' },
    { name: 'Ahmadu Bello University', web: 'https://abu.edu.ng/' },
    { name: 'Obafemi Awolowo University', web: 'http://www.oauife.edu.ng/' },
    { name: 'University of Nigeria, Nsukka', web: null },
  ],
}));

import { searchCampuses, getCampusById, getUserProfile } from './campuses';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('searchCampuses', () => {
  it('returns empty array for empty query', async () => {
    const result = await searchCampuses('');
    expect(result).toEqual([]);
  });

  it('returns empty array for whitespace-only query', async () => {
    const result = await searchCampuses('   ');
    expect(result).toEqual([]);
  });

  it('returns supabase results when available', async () => {
    const supabaseData = [
      { id: '1', name: 'University of Lagos', domain: 'unilag.edu.ng' },
    ];
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: supabaseData, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await searchCampuses('Lagos');
    expect(result).toEqual(supabaseData);
  });

  it('falls back to local search when supabase returns no results', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await searchCampuses('Lagos');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toContain('Lagos');
  });

  it('falls back to local search on supabase error', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await searchCampuses('Ibadan');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toContain('Ibadan');
  });

  it('local search extracts domain from web URL', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: new Error('fail') }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await searchCampuses('Lagos');
    expect(result[0].domain).toBe('unilag.edu.ng');
  });

  it('local search returns null domain when no web', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: new Error('fail') }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await searchCampuses('Nsukka');
    expect(result[0].domain).toBeNull();
  });

  it('local search respects limit parameter', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: new Error('fail') }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await searchCampuses('University', 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });
});

describe('getCampusById', () => {
  it('returns null for null id', async () => {
    const result = await getCampusById(null);
    expect(result).toBeNull();
  });

  it('returns null for empty string id', async () => {
    const result = await getCampusById('');
    expect(result).toBeNull();
  });

  it('returns campus data from supabase', async () => {
    const campusData = { id: 'campus-1', name: 'UNILAG', domain: 'unilag.edu.ng' };
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: campusData, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getCampusById('campus-1');
    expect(result).toEqual(campusData);
  });

  it('falls back to local search when supabase fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getCampusById('University of Lagos');
    expect(result.name).toBe('University of Lagos');
    expect(result.domain).toBe('unilag.edu.ng');
  });

  it('returns null when not found locally either', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getCampusById('Nonexistent University');
    expect(result).toBeNull();
  });
});

describe('getUserProfile', () => {
  it('returns null for null userId', async () => {
    const result = await getUserProfile(null);
    expect(result).toBeNull();
  });

  it('returns null for empty userId', async () => {
    const result = await getUserProfile('');
    expect(result).toBeNull();
  });

  it('returns profile data from supabase', async () => {
    const profileData = {
      id: 'user-1',
      campus_id: 'campus-1',
      name: 'Ade',
      phone: '08012345678',
      campuses: { name: 'UNILAG', domain: 'unilag.edu.ng' },
    };
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: profileData, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getUserProfile('user-1');
    expect(result).toEqual(profileData);
  });

  it('returns null on error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getUserProfile('user-1');
    expect(result).toBeNull();
  });
});
