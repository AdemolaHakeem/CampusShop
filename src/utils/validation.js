const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidUUID = (value) => UUID_RE.test(value);

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_PHONE_LENGTH = 20;
const PHONE_RE = /^\+?[\d\s\-()]+$/;

export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.replace(/[<>]/g, '').trim();
};

export const validateListingInput = (data) => {
  const errors = [];

  if (!data.title || sanitizeText(data.title).length === 0) {
    errors.push('Title is required');
  } else if (data.title.length > MAX_TITLE_LENGTH) {
    errors.push(`Title must be at most ${MAX_TITLE_LENGTH} characters`);
  }

  if (!data.description || sanitizeText(data.description).length === 0) {
    errors.push('Description is required');
  } else if (data.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (data.price == null || isNaN(data.price) || data.price < 0) {
    errors.push('Price must be a positive number');
  } else if (data.price > 10000000) {
    errors.push('Price exceeds maximum allowed value');
  }

  if (data.sellerPhone && !PHONE_RE.test(data.sellerPhone)) {
    errors.push('Phone number format is invalid');
  } else if (data.sellerPhone && data.sellerPhone.length > MAX_PHONE_LENGTH) {
    errors.push('Phone number is too long');
  }

  if (data.imageURL && !isValidImageUrl(data.imageURL)) {
    errors.push('Image URL must be a valid HTTPS URL pointing to an image');
  }

  return errors;
};

export const isValidImageUrl = (url) => {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const ext = parsed.pathname.split('.').pop().toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const hasImageExtension = allowedExtensions.includes(ext);
    const isSupabaseStorage = parsed.hostname.includes('supabase');
    return hasImageExtension || isSupabaseStorage;
  } catch {
    return false;
  }
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const validateImageFile = (file) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, GIF, and WebP images are allowed';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Image must be smaller than 5 MB';
  }
  return null;
};
