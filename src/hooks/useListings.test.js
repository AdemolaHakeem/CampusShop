import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const mockSubscribeToAllListings = vi.fn();
const mockSubscribeToUserListings = vi.fn();

vi.mock('../services/listings', () => ({
  subscribeToAllListings: (...args) => mockSubscribeToAllListings(...args),
  subscribeToUserListings: (...args) => mockSubscribeToUserListings(...args),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ currentUser: { campusId: 'campus-1' } })),
}));

import { useListings, useUserListings } from './useListings';
import { useAuth } from '../context/AuthContext';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useListings', () => {
  it('starts with loading true and empty listings', () => {
    mockSubscribeToAllListings.mockReturnValue(vi.fn());

    const { result } = renderHook(() => useListings());
    expect(result.current.loading).toBe(true);
    expect(result.current.listings).toEqual([]);
  });

  it('subscribes with the user campusId', () => {
    mockSubscribeToAllListings.mockReturnValue(vi.fn());

    renderHook(() => useListings());
    expect(mockSubscribeToAllListings).toHaveBeenCalledWith('campus-1', expect.any(Function));
  });

  it('updates listings when callback is invoked', async () => {
    let capturedCallback;
    mockSubscribeToAllListings.mockImplementation((campusId, cb) => {
      capturedCallback = cb;
      return vi.fn();
    });

    const { result } = renderHook(() => useListings());

    const mockData = [{ id: '1', title: 'Laptop' }];
    capturedCallback(mockData);

    await waitFor(() => {
      expect(result.current.listings).toEqual(mockData);
      expect(result.current.loading).toBe(false);
    });
  });

  it('calls unsubscribe on unmount', () => {
    const unsubscribeFn = vi.fn();
    mockSubscribeToAllListings.mockReturnValue(unsubscribeFn);

    const { unmount } = renderHook(() => useListings());
    unmount();
    expect(unsubscribeFn).toHaveBeenCalled();
  });

  it('uses null campusId when user has no campus', () => {
    useAuth.mockReturnValue({ currentUser: { campusId: null } });
    mockSubscribeToAllListings.mockReturnValue(vi.fn());

    renderHook(() => useListings());
    expect(mockSubscribeToAllListings).toHaveBeenCalledWith(null, expect.any(Function));
  });
});

describe('useUserListings', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ currentUser: { campusId: 'campus-1' } });
  });

  it('starts with loading true and empty listings', () => {
    mockSubscribeToUserListings.mockReturnValue(vi.fn());

    const { result } = renderHook(() => useUserListings('user-1'));
    expect(result.current.loading).toBe(true);
    expect(result.current.listings).toEqual([]);
  });

  it('subscribes with userId and campusId', () => {
    mockSubscribeToUserListings.mockReturnValue(vi.fn());

    renderHook(() => useUserListings('user-1'));
    expect(mockSubscribeToUserListings).toHaveBeenCalledWith(
      'user-1',
      'campus-1',
      expect.any(Function)
    );
  });

  it('does not subscribe when userId is falsy', () => {
    const { result } = renderHook(() => useUserListings(null));
    expect(mockSubscribeToUserListings).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });

  it('updates listings when callback is invoked', async () => {
    let capturedCallback;
    mockSubscribeToUserListings.mockImplementation((userId, campusId, cb) => {
      capturedCallback = cb;
      return vi.fn();
    });

    const { result } = renderHook(() => useUserListings('user-1'));

    const mockData = [{ id: '1', title: 'My Listing' }];
    capturedCallback(mockData);

    await waitFor(() => {
      expect(result.current.listings).toEqual(mockData);
      expect(result.current.loading).toBe(false);
    });
  });

  it('calls unsubscribe on unmount', () => {
    const unsubscribeFn = vi.fn();
    mockSubscribeToUserListings.mockReturnValue(unsubscribeFn);

    const { unmount } = renderHook(() => useUserListings('user-1'));
    unmount();
    expect(unsubscribeFn).toHaveBeenCalled();
  });
});
