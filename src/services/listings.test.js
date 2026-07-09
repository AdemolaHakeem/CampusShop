import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
  channel: vi.fn(),
  removeChannel: vi.fn(),
}));

vi.mock('./supabase', () => ({
  supabase: mockSupabase,
}));

vi.mock('./campusFilter', () => ({
  withCampusScope: vi.fn((query) => query),
}));

import { mapListing, uploadListingImage, addListing, deleteListing } from './listings';

describe('mapListing', () => {
  it('returns null for null input', () => {
    expect(mapListing(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(mapListing(undefined)).toBeNull();
  });

  it('maps database listing to frontend format', () => {
    const dbListing = {
      id: '1',
      title: 'Used Laptop',
      description: 'Good condition MacBook',
      price: 150000,
      category: 'Electronics',
      image_url: 'https://example.com/img.jpg',
      seller_id: 'user-1',
      seller_name: 'John',
      whatsapp_number: '+2348012345678',
      campus_id: 'campus-1',
      created_at: '2024-01-01T00:00:00Z',
    };

    const result = mapListing(dbListing);

    expect(result).toEqual({
      id: '1',
      title: 'Used Laptop',
      description: 'Good condition MacBook',
      price: 150000,
      category: 'Electronics',
      imageURL: 'https://example.com/img.jpg',
      sellerId: 'user-1',
      sellerName: 'John',
      sellerPhone: '+2348012345678',
      campusId: 'campus-1',
      createdAt: '2024-01-01T00:00:00Z',
    });
  });

  it('handles missing optional fields', () => {
    const dbListing = {
      id: '2',
      title: 'Book',
      description: '',
      price: 2000,
      category: 'Books & Notes',
      image_url: null,
      seller_id: 'user-2',
      seller_name: 'Jane',
      whatsapp_number: null,
      campus_id: null,
      created_at: null,
    };

    const result = mapListing(dbListing);
    expect(result.imageURL).toBeNull();
    expect(result.sellerPhone).toBeNull();
    expect(result.campusId).toBeNull();
  });
});

describe('uploadListingImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads a file and returns the public URL', async () => {
    const mockFile = { name: 'photo.jpg' };
    const mockUploadResult = { data: { path: 'listing-images/abc.jpg' }, error: null };
    const mockPublicUrl = 'https://storage.example.com/listing-images/abc.jpg';

    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue(mockUploadResult),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: mockPublicUrl } }),
    });

    const result = await uploadListingImage(mockFile);
    expect(result).toBe(mockPublicUrl);
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('listings');
  });

  it('throws descriptive error when bucket not found', async () => {
    const mockFile = { name: 'photo.png' };
    const mockError = { message: 'Bucket not found', status: 404 };

    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });

    await expect(uploadListingImage(mockFile)).rejects.toThrow(
      "Supabase Storage bucket 'listings' not found"
    );
  });

  it('throws generic error for other upload failures', async () => {
    const mockFile = { name: 'photo.png' };
    const mockError = new Error('Network error');

    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });

    await expect(uploadListingImage(mockFile)).rejects.toThrow('Network error');
  });
});

describe('addListing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts a listing and returns mapped result', async () => {
    const input = {
      title: 'Desk',
      description: 'Wooden desk',
      price: 20000,
      category: 'Furniture',
      imageURL: 'https://example.com/desk.jpg',
      sellerId: 'user-1',
      sellerName: 'Ade',
      sellerPhone: '08012345678',
      campusId: 'campus-1',
    };

    const dbResult = {
      id: 'new-1',
      title: 'Desk',
      description: 'Wooden desk',
      price: 20000,
      category: 'Furniture',
      image_url: 'https://example.com/desk.jpg',
      seller_id: 'user-1',
      seller_name: 'Ade',
      whatsapp_number: '08012345678',
      campus_id: 'campus-1',
      created_at: '2024-06-01T00:00:00Z',
    };

    const mockChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: dbResult, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await addListing(input);
    expect(result.id).toBe('new-1');
    expect(result.title).toBe('Desk');
    expect(mockSupabase.from).toHaveBeenCalledWith('listings');
  });

  it('throws on supabase error', async () => {
    const mockChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await expect(addListing({ title: 'Test' })).rejects.toThrow('Insert failed');
  });
});

describe('deleteListing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a listing by id', async () => {
    const mockChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await deleteListing('listing-1');
    expect(mockSupabase.from).toHaveBeenCalledWith('listings');
    expect(mockChain.eq).toHaveBeenCalledWith('id', 'listing-1');
  });

  it('throws on supabase error', async () => {
    const mockChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: new Error('Delete failed') }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await expect(deleteListing('listing-1')).rejects.toThrow('Delete failed');
  });
});
