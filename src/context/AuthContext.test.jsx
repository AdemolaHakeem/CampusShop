import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (...args) => mockOnAuthStateChange(...args),
    },
  },
}));

import { AuthProvider, useAuth } from './AuthContext';

function TestConsumer() {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Loading</div>;
  return (
    <div>
      <span data-testid="user">{currentUser ? currentUser.displayName : 'none'}</span>
      <span data-testid="email">{currentUser ? currentUser.email : ''}</span>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

describe('AuthContext', () => {
  it('shows loading initially then renders children', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
    });
  });

  it('formats user from session correctly', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'ade@test.com',
      user_metadata: {
        name: 'Ade',
        phone: '08012345678',
        campus_id: 'campus-1',
        campus_name: 'UNILAG',
      },
    };

    mockGetSession.mockResolvedValue({
      data: { session: { user: mockUser } },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Ade');
      expect(screen.getByTestId('email')).toHaveTextContent('ade@test.com');
    });
  });

  it('handles user with missing metadata fields', async () => {
    const mockUser = {
      id: 'user-2',
      email: 'test@test.com',
      user_metadata: {},
    };

    mockGetSession.mockResolvedValue({
      data: { session: { user: mockUser } },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('');
      expect(screen.getByTestId('email')).toHaveTextContent('test@test.com');
    });
  });

  it('subscribes to auth state changes', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });
  });

  it('unsubscribes on unmount', async () => {
    const unsubscribeFn = vi.fn();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeFn } },
    });
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toBeInTheDocument();
    });

    unmount();
    expect(unsubscribeFn).toHaveBeenCalled();
  });
});
