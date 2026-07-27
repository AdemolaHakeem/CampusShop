import { supabase } from './supabase';
import { withCampusScope } from './campusFilter';

// Columns to select for listing queries (avoids SELECT *)
const LISTING_COLUMNS = `
  id, title, description, price, category,
  image_url, seller_id, seller_name, whatsapp_number,
  campus_id, created_at, status, condition
`;

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
    status: dbListing.status || 'active',
    condition: dbListing.condition || null,
  };
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export const uploadListingImage = async (file) => {
  // --- Client-side validation ---
  if (!file) {
    throw new Error('No file provided');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, GIF.`
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`
    );
  }

  // Generate a unique filename to prevent collisions
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `listing-images/${fileName}`;

  // Upload file to 'listings' bucket
  const { data, error } = await supabase.storage
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

/**
 * Full-text search across listings using PostgreSQL tsvector.
 * Returns only active listings scoped to the user's campus.
 */
export const searchListings = async ({ query, campusId, limit = 20 }) => {
  if (!query || query.trim().length < 2) {
    // Return all active listings when query is too short
    let dbQuery = supabase
      .from('listings')
      .select(LISTING_COLUMNS)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    dbQuery = withCampusScope(dbQuery, campusId);

    const { data, error } = await dbQuery;
    if (error) throw error;
    return (data || []).map(mapListing);
  }

  try {
    let dbQuery = supabase
      .from('listings')
      .select(LISTING_COLUMNS)
      .eq('status', 'active')
      .textSearch('search_vector', query.trim(), {
        type: 'websearch',
        config: 'english',
      })
      .order('created_at', { ascending: false })
      .limit(limit);

    dbQuery = withCampusScope(dbQuery, campusId);

    const { data, error } = await dbQuery;
    if (error) throw error;
    return (data || []).map(mapListing);
  } catch (err) {
    console.error('Full-text search error, falling back to client-side:', err);
    // Fallback: fetch all and filter client-side
    return new Promise((resolve) => {
      const unsub = subscribeToAllListings(campusId, (listings) => {
        unsub();
        const q = query.toLowerCase();
        resolve(listings.filter(
          (l) => l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q)
        ));
      });
    });
  }
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
        condition: data.condition || null,
        image_url: data.imageURL || '',
        seller_id: data.sellerId,
        seller_name: data.sellerName,
        whatsapp_number: data.sellerPhone || '',
        campus_id: data.campusId || null,
        status: 'active',
      }
    ])
    .select(LISTING_COLUMNS)
    .single();

  if (error) throw error;
  return mapListing(insertedData);
};

export const markListingAsSold = async (id) => {
  const { error } = await supabase
    .from('listings')
    .update({ status: 'sold' })
    .eq('id', id);

  if (error) throw error;
};

export const markListingAsActive = async (id) => {
  const { error } = await supabase
    .from('listings')
    .update({ status: 'active' })
    .eq('id', id);

  if (error) throw error;
};

export const deleteListing = async (id) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) throw error;
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
  const fetchAndCallback = async () => {
    try {
      let query = supabase
        .from('listings')
        .select(LISTING_COLUMNS)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      query = withCampusScope(query, campusId);

      const { data, error } = await query;
      if (error) throw error;
      callback(data.map(mapListing));
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  // Fetch initial data
  fetchAndCallback();

  // Subscribe to changes
  const channel = supabase
    .channel('public:listings:all')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'listings' },
      () => {
        fetchAndCallback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
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

  const fetchAndCallback = async () => {
    try {
      let query = supabase
        .from('listings')
        .select(LISTING_COLUMNS)
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      query = withCampusScope(query, campusId);

      const { data, error } = await query;
      if (error) throw error;
      callback(data.map(mapListing));
    } catch (err) {
      console.error('Error fetching user listings:', err);
    }
  };

  // Fetch initial data
  fetchAndCallback();

  // Subscribe to changes
  const channel = supabase
    .channel(`public:listings:user:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'listings',
        filter: `seller_id=eq.${userId}`,
      },
      () => {
        fetchAndCallback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
