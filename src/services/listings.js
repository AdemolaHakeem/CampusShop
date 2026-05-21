import { supabase } from './supabase';

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
    createdAt: dbListing.created_at,
  };
};

export const uploadListingImage = async (file) => {
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

export const subscribeToAllListings = (callback) => {
  const fetchAndCallback = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });
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

export const subscribeToUserListings = (userId, callback) => {
  if (!userId) return () => {};

  const fetchAndCallback = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });
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
