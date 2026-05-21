import { useEffect, useState } from 'react';
import { subscribeToAllListings, subscribeToUserListings } from '../services/listings';

export const useListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAllListings((data) => {
      setListings(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { listings, loading };
};

export const useUserListings = (userId) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToUserListings(userId, (data) => {
      setListings(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  return { listings, loading };
};
