import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

/**
 * Merge user_metadata with the live profiles table so that
 * changes made in the profiles table (e.g. updated campus/phone)
 * are reflected immediately instead of waiting for re-login.
 */
const enrichWithProfile = async (user) => {
  if (!user) return null;

  // Start from user_metadata (fast, always available)
  const enriched = {
    uid: user.id,
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.name || '',
    phone: user.user_metadata?.phone || '',
    campusId: user.user_metadata?.campus_id || null,
    campusName: user.user_metadata?.campus_name || null,
  };

  // Overlay the live profile from the database (fresh data)
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, phone, campus_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      enriched.displayName = profile.name || enriched.displayName;
      enriched.phone = profile.phone || enriched.phone;
      enriched.campusId = profile.campus_id || enriched.campusId;
    }
  } catch {
    // Profile fetch is non-critical — fall back to metadata
  }

  return enriched;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // 1. Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      const user = await enrichWithProfile(session?.user || null);
      if (!cancelled) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    // 2. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      const user = await enrichWithProfile(session?.user || null);
      if (!cancelled) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
