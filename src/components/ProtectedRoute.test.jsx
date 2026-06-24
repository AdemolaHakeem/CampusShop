import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'user-1' }, loading: false });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Secret Page</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    useAuth.mockReturnValue({ currentUser: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div data-testid="protected-content">Secret Page</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('shows loading spinner while auth is loading', () => {
    useAuth.mockReturnValue({ currentUser: null, loading: true });

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Secret Page</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    // Ant Design Spin component renders a span with the ant-spin class
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });
});
