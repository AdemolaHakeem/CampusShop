import { supabase } from './supabase';

export const registerUser = async ({ name, email, password, phone, campusId, campusName }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone: phone || '',
        campus_id: campusId,
        campus_name: campusName || '',
      },
    },
  });
  if (error) throw error;

  // If email confirmation is DISABLED in Supabase settings, the user
  // session is returned immediately and we need to create the profile row.
  // (If confirmation IS enabled, the DB trigger handles it after confirm.)
  if (data?.user && data?.session) {
    // Profile row is created by the DB trigger, but we verify here.
    // This call is safe even if the trigger already ran.
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        campus_id: campusId,
        name,
        phone: phone || '',
      },
      { onConflict: 'id' }
    );
    if (profileError) {
      console.error('Profile upsert warning (non-fatal):', profileError);
    }
  }

  return data;
};

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Simple in-memory throttle to prevent spam on auth endpoints
const throttleMap = new Map();

const isThrottled = (key, minIntervalMs = 60000) => {
  const last = throttleMap.get(key);
  const now = Date.now();
  if (last && now - last < minIntervalMs) {
    return Math.ceil((minIntervalMs - (now - last)) / 1000);
  }
  throttleMap.set(key, now);
  return 0;
};

export const resendVerification = async (email) => {
  const wait = isThrottled(`resend:${email}`, 60000);
  if (wait > 0) {
    throw new Error(`Please wait ${wait} second${wait > 1 ? 's' : ''} before requesting another verification email.`);
  }

  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
  if (error) throw error;
  return data;
};

export const resetPassword = async (email) => {
  const wait = isThrottled(`reset:${email}`, 60000);
  if (wait > 0) {
    throw new Error(`Please wait ${wait} second${wait > 1 ? 's' : ''} before requesting another password reset.`);
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return data;
};

export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
};
