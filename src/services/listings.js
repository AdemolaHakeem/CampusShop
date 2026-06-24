import { supabase } from './supabase';
import { withCampusScope } from './campusFilter';

export const mapListing = (dbListing) => {
  if (!dbListing) return null;
  return {
    id: dbListing.id,
    title: dbListing.title,
    description: dbListing.description,
    price: dbListing.price,
    category: dbListing.category,
    imageURL: dbListing.image_url,
    sellerId: dbListing.seller_id,
    sellerName: dbListing.seller_name,
    sellerPhone: dbListing.whatsapp_number,
    campusId: dbListing.campus_id,
    createdAt: dbListing.created_at,
  };
};

export const uploadListingImage = async (file) => {
  // Generate a unique filename to prevent collisions
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `listing-images/${fileName}`;

  // Upload file to 'listings' bucket
  const { error } = await supabase.storage
    .from('listings')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    if (error.message?.toLowerCase().includes('bucket not found') || error.status === 404) {
      throw new Error("Supabase Storage bucket 'listings' not found. Please create a public bucket named 'listings' in your Supabase Dashboard under Storage.");
    }
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('listings')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const addListing = async (data) => {
  const { data: insertedData, error } = await supabase
    .from('listings')
    .insert([
      {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        image_url: data.imageURL || '',
        seller_id: data.sellerId,
        seller_name: data.sellerName,
        whatsapp_number: data.sellerPhone || '',
        campus_id: data.campusId || null,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return mapListing(insertedData);
};

export const deleteListing = async (id) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Creates a real-time subscription to listings from Supabase.
 *
 * @param {object} options
 * @param {string|null} options.campusId - scope listings to this campus
 * @param {string|null} [options.userId] - if provided, filter by seller_id
 * @param {string} options.channelName - unique channel identifier
 * @param {function} options.callback - receives the mapped listings array
 * @returns {function} unsubscribe
 */
const createListingSubscription = ({ campusId, userId, channelName, callback }) => {
  const fetchAndCallback = async () => {
    try {
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('seller_id', userId);
      }

      query = withCampusScope(query, campusId);

      const { data, error } = await query;
      if (error) throw error;
      callback(data.map(mapListing));
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  fetchAndCallback();

  const subscriptionFilter = userId
    ? { event: '*', schema: 'public', table: 'listings', filter: `seller_id=eq.${userId}` }
    : { event: '*', schema: 'public', table: 'listings' };

  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', subscriptionFilter, () => {
      fetchAndCallback();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to listings scoped to the user's campus (or global).
 * Listings where campus_id IS NULL (global feed) are always included.
 *
 * @param {string|null} campusId - the user's campus_id
 * @param {function} callback - receives the mapped listings array
 * @returns {function} unsubscribe
 */
export const subscribeToAllListings = (campusId, callback) => {
  return createListingSubscription({
    campusId,
    userId: null,
    channelName: 'public:listings:all',
    callback,
  });
};

/**
 * Subscribe to a specific user's listings (scoped to campus for consistency).
 *
 * @param {string} userId
 * @param {string|null} campusId
 * @param {function} callback
 * @returns {function} unsubscribe
 */
export const subscribeToUserListings = (userId, campusId, callback) => {
  if (!userId) return () => {};

  return createListingSubscription({
    campusId,
    userId,
    channelName: `public:listings:user:${userId}`,
    callback,
  });
};
