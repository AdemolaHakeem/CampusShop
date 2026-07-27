import { supabase } from './supabase';
import { withCampusScope } from './campusFilter';

// Columns to select for listing queries (avoids SELECT *)
const LISTING_COLUMNS = `
  id, title, description, price, category,
  image_url, seller_id, seller_name, whatsapp_number,
  campus_id, created_at, status, condition, images
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
    images: dbListing.images || [],
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
        image_url: data.imageURL || (data.images?.[0] || ''),
        images: data.images || [],
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
 * Incremental approach for subscribeToAllListings:
 * - Initial fetch: gets the full listing set (cached locally per subscription).
 * - On INSERT/UPDATE/DELETE: patch the local cache instead of full re-fetch.
 * - Falls back to full re-fetch for safety.
 */
export const subscribeToAllListings = (campusId, callback) => {
  const campusIdVal = campusId;
  let cache = []; // local per-subscription, not module-level

  const isInScope = (item) => {
    if (!campusIdVal) return true;
    return !item.campus_id || item.campus_id === campusIdVal;
  };

  const fetchAndCallback = async () => {
    try {
      let query = supabase
        .from('listings')
        .select(LISTING_COLUMNS)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      query = withCampusScope(query, campusIdVal);

      const { data, error } = await query;
      if (error) throw error;
      cache = data.map(mapListing);
      callback([...cache]);
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  const handleChange = async (payload) => {
    try {
      if (payload.eventType === 'INSERT') {
        const { data } = await supabase
          .from('listings')
          .select(LISTING_COLUMNS)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          const mapped = mapListing(data);
          if (isInScope(mapped)) {
            cache = [mapped, ...cache];
            callback([...cache]);
            return;
          }
        }
      }

      if (payload.eventType === 'UPDATE') {
        const idx = cache.findIndex((l) => l.id === payload.new.id);
        if (idx !== -1) {
          const { data } = await supabase
            .from('listings')
            .select(LISTING_COLUMNS)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            cache[idx] = mapListing(data);
            callback([...cache]);
            return;
          }
        }
      }

      if (payload.eventType === 'DELETE') {
        const removed = cache.filter((l) => l.id !== payload.old.id);
        if (removed.length !== cache.length) {
          cache = removed;
          callback([...cache]);
          return;
        }
      }

      // Fallback: full re-fetch
      fetchAndCallback();
    } catch (err) {
      console.error('Incremental update error, falling back to full fetch:', err);
      fetchAndCallback();
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
      handleChange
    )
    .subscribe();

  return () => {
    cache = [];
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to a specific user's listings (with incremental updates).
 */
export const subscribeToUserListings = (userId, campusId, callback) => {
  if (!userId) return () => {};

  let userCache = [];
  const campusIdVal = campusId;

  const fetchAndCallback = async () => {
    try {
      let query = supabase
        .from('listings')
        .select(LISTING_COLUMNS)
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      query = withCampusScope(query, campusIdVal);

      const { data, error } = await query;
      if (error) throw error;
      userCache = data.map(mapListing);
      callback([...userCache]);
    } catch (err) {
      console.error('Error fetching user listings:', err);
    }
  };

  const handleChange = async (payload) => {
    try {
      if (payload.eventType === 'INSERT' && payload.new.seller_id === userId) {
        const { data } = await supabase
          .from('listings')
          .select(LISTING_COLUMNS)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          userCache = [mapListing(data), ...userCache];
          callback([...userCache]);
          return;
        }
      }

      if (payload.eventType === 'UPDATE' && payload.new.seller_id === userId) {
        const idx = userCache.findIndex((l) => l.id === payload.new.id);
        if (idx !== -1) {
          const { data } = await supabase
            .from('listings')
            .select(LISTING_COLUMNS)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            userCache[idx] = mapListing(data);
            callback([...userCache]);
            return;
          }
        }
      }

      if (payload.eventType === 'DELETE') {
        const removed = userCache.filter((l) => l.id !== payload.old.id);
        if (removed.length !== userCache.length) {
          userCache = removed;
          callback([...userCache]);
          return;
        }
      }

      fetchAndCallback();
    } catch (err) {
      fetchAndCallback();
    }
  };

  fetchAndCallback();

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
      handleChange
    )
    .subscribe();

  return () => {
    userCache = [];
    supabase.removeChannel(channel);
  };
};
