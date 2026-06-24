import { describe, it, expect, vi } from 'vitest';

vi.mock('./supabase', () => ({
  supabase: {},
}));

import { withCampusScope } from './campusFilter';

describe('withCampusScope', () => {
  it('returns the query unchanged when campusId is null', () => {
    const mockQuery = { or: vi.fn() };
    const result = withCampusScope(mockQuery, null);
    expect(result).toBe(mockQuery);
    expect(mockQuery.or).not.toHaveBeenCalled();
  });

  it('returns the query unchanged when campusId is undefined', () => {
    const mockQuery = { or: vi.fn() };
    const result = withCampusScope(mockQuery, undefined);
    expect(result).toBe(mockQuery);
    expect(mockQuery.or).not.toHaveBeenCalled();
  });

  it('returns the query unchanged when campusId is empty string', () => {
    const mockQuery = { or: vi.fn() };
    const result = withCampusScope(mockQuery, '');
    expect(result).toBe(mockQuery);
    expect(mockQuery.or).not.toHaveBeenCalled();
  });

  it('adds campus scope filter when campusId is provided', () => {
    const filteredQuery = { data: 'filtered' };
    const mockQuery = { or: vi.fn().mockReturnValue(filteredQuery) };
    const result = withCampusScope(mockQuery, 'campus-123');
    expect(mockQuery.or).toHaveBeenCalledWith(
      'campus_id.eq.campus-123,campus_id.is.null'
    );
    expect(result).toBe(filteredQuery);
  });

  it('correctly formats OR clause for campus scoping', () => {
    const mockQuery = { or: vi.fn().mockReturnValue({}) };
    withCampusScope(mockQuery, 'abc-def-456');
    expect(mockQuery.or).toHaveBeenCalledWith(
      'campus_id.eq.abc-def-456,campus_id.is.null'
    );
  });
});
