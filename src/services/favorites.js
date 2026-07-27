import { supabase } from './supabase';

/**
 * Toggle a listing as favorite for the current user.
 * Returns the new favorited state (true = added, false = removed).
 */
export const toggleFavorite = async (userId, listingId) => {
  if (!userId || !listingId) throw new Error('User ID and Listing ID are required');

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .maybeSingle();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);

    if (error) throw error;
    return false;
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, listing_id: listingId });

    if (error) throw error;
    return true;
  }
};

/**
 * Check if a listing is favorited by the current user.
 */
export const isListingFavorited = async (userId, listingId) => {
  if (!userId || !listingId) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

/**
 * Get all favorites for a user with full listing data.
 */
export const getUserFavorites = async (userId) => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      listing:listings(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).filter(f => f.listing).map((fav) => ({
    favoriteId: fav.id,
    favoritedAt: fav.created_at,
    listing: {
      id: fav.listing.id,
      title: fav.listing.title,
      description: fav.listing.description,
      price: fav.listing.price,
      category: fav.listing.category,
      condition: fav.listing.condition || null,
      imageURL: fav.listing.image_url || '',
      images: fav.listing.images || [],
      sellerId: fav.listing.seller_id,
      sellerName: fav.listing.seller_name,
      sellerPhone: fav.listing.whatsapp_number,
      campusId: fav.listing.campus_id,
      createdAt: fav.listing.created_at,
      status: fav.listing.status || 'active',
    },
  }));
};

/**
 * Get count of favorites for a listing.
 */
export const getFavoriteCount = async (listingId) => {
  if (!listingId) return 0;

  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId);

  if (error) throw error;
  return count || 0;
};

/**
 * Subscribe to favorites changes for real-time heart toggle updates.
 */
export const subscribeToFavorites = (userId, callback) => {
  if (!userId) return () => {};

  const channel = supabase
    .channel('public:favorites:user')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'favorites',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
