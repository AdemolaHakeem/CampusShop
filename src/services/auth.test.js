import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = vi.hoisted(() => ({
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resend: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  },
  from: vi.fn(),
}));

vi.mock('./supabase', () => ({
  supabase: mockSupabase,
}));

import {
  registerUser,
  loginUser,
  logoutUser,
  resendVerification,
  resetPassword,
  updatePassword,
} from './auth';

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'location', {
    value: { origin: 'http://localhost:3000' },
    writable: true,
  });
});

describe('registerUser', () => {
  it('calls supabase.auth.signUp with correct params', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });

    await registerUser({
      name: 'Ade',
      email: 'ade@test.com',
      password: 'pass123',
      phone: '08012345678',
      campusId: 'campus-1',
      campusName: 'University of Lagos',
    });

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'ade@test.com',
      password: 'pass123',
      options: {
        data: {
          name: 'Ade',
          phone: '08012345678',
          campus_id: 'campus-1',
          campus_name: 'University of Lagos',
        },
      },
    });
  });

  it('creates profile when session is returned immediately', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({ upsert: mockUpsert });
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: { access_token: 'token' } },
      error: null,
    });

    await registerUser({
      name: 'Ade',
      email: 'ade@test.com',
      password: 'pass123',
      phone: '',
      campusId: 'campus-1',
      campusName: '',
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(mockUpsert).toHaveBeenCalledWith(
      {
        id: 'user-1',
        campus_id: 'campus-1',
        name: 'Ade',
        phone: '',
      },
      { onConflict: 'id' }
    );
  });

  it('throws error from supabase signUp', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: null,
      error: new Error('Email already taken'),
    });

    await expect(
      registerUser({
        name: 'Ade',
        email: 'ade@test.com',
        password: 'pass123',
        campusId: 'campus-1',
      })
    ).rejects.toThrow('Email already taken');
  });

  it('does not throw on non-fatal profile upsert error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: { access_token: 'token' } },
      error: null,
    });
    mockSupabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: new Error('Profile fail') }),
    });

    const result = await registerUser({
      name: 'Ade',
      email: 'ade@test.com',
      password: 'pass123',
      campusId: 'campus-1',
    });

    expect(result).toBeDefined();
    consoleSpy.mockRestore();
  });
});

describe('loginUser', () => {
  it('signs in and returns the user', async () => {
    const mockUser = { id: 'user-1', email: 'ade@test.com' };
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const result = await loginUser({ email: 'ade@test.com', password: 'pass123' });
    expect(result).toEqual(mockUser);
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'ade@test.com',
      password: 'pass123',
    });
  });

  it('throws on invalid credentials', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: new Error('Invalid login credentials'),
    });

    await expect(
      loginUser({ email: 'wrong@test.com', password: 'bad' })
    ).rejects.toThrow('Invalid login credentials');
  });
});

describe('logoutUser', () => {
  it('signs out successfully', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    await expect(logoutUser()).resolves.toBeUndefined();
  });

  it('throws on signOut error', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: new Error('Network error') });
    await expect(logoutUser()).rejects.toThrow('Network error');
  });
});

describe('resendVerification', () => {
  it('sends verification email with redirect', async () => {
    mockSupabase.auth.resend.mockResolvedValue({ data: {}, error: null });

    await resendVerification('ade@test.com');
    expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'ade@test.com',
      options: {
        emailRedirectTo: 'http://localhost:3000/login',
      },
    });
  });

  it('throws on error', async () => {
    mockSupabase.auth.resend.mockResolvedValue({
      data: null,
      error: new Error('Rate limited'),
    });

    await expect(resendVerification('ade@test.com')).rejects.toThrow('Rate limited');
  });
});

describe('resetPassword', () => {
  it('sends password reset email', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    await resetPassword('ade@test.com');
    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('ade@test.com', {
      redirectTo: 'http://localhost:3000/reset-password',
    });
  });

  it('throws on error', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
      data: null,
      error: new Error('User not found'),
    });

    await expect(resetPassword('nobody@test.com')).rejects.toThrow('User not found');
  });
});

describe('updatePassword', () => {
  it('updates the user password', async () => {
    const mockData = { user: { id: 'user-1' } };
    mockSupabase.auth.updateUser.mockResolvedValue({ data: mockData, error: null });

    const result = await updatePassword('newPass123');
    expect(result).toEqual(mockData);
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newPass123' });
  });

  it('throws on error', async () => {
    mockSupabase.auth.updateUser.mockResolvedValue({
      data: null,
      error: new Error('Weak password'),
    });

    await expect(updatePassword('123')).rejects.toThrow('Weak password');
  });
});
