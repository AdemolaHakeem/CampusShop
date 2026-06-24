import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatUser = (user) => {
    if (!user) return null;
    return {
      uid: user.id,
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.name || '',
      phone: user.user_metadata?.phone || '',
      campusId: user.user_metadata?.campus_id || null,
      campusName: user.user_metadata?.campus_name || null,
    };
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(formatUser(session?.user || null));
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to get auth session:', err);
      setCurrentUser(null);
      setLoading(false);
    });

    // 2. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(formatUser(session?.user || null));
      setLoading(false);
    });

    return () => {
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
