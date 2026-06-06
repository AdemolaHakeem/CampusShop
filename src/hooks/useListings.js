import { useEffect, useState } from 'react';
import { subscribeToAllListings, subscribeToUserListings } from '../services/listings';
import { useAuth } from '../context/AuthContext';

export const useListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const campusId = currentUser?.campusId || null;
    const unsubscribe = subscribeToAllListings(campusId, (data) => {
      setListings(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser?.campusId]);

  return { listings, loading };
};

export const useUserListings = (userId) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!userId) return;
    const campusId = currentUser?.campusId || null;
    const unsubscribe = subscribeToUserListings(userId, campusId, (data) => {
      setListings(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId, currentUser?.campusId]);

  return { listings, loading };
};
