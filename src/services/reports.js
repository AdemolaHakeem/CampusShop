import { supabase } from './supabase';

const REPORT_REASONS = [
  'Spam or scam',
  'Inappropriate content',
  'Wrong category',
  'Duplicate listing',
  'Item not available',
  'Suspicious pricing',
  'Other',
];

export { REPORT_REASONS };

/**
 * Submit a report for a listing.
 */
export const submitReport = async ({ listingId, reporterId, reason, description = '' }) => {
  if (!listingId || !reporterId || !reason) {
    throw new Error('Listing ID, reporter ID, and reason are required');
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      listing_id: listingId,
      reporter_id: reporterId,
      reason,
      description,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get all reports (admin only).
 */
export const getReports = async (statusFilter = 'all') => {
  try {
    let query = supabase
      .from('reports')
      .select('*, listing:listings!listing_id(title, seller_name, price, image_url), reporter:profiles!reporter_id(name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching reports:', err);
    throw err;
  }
};

/**
 * Update report status (admin only).
 */
export const updateReportStatus = async (reportId, status) => {
  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', reportId);

  if (error) throw error;
};
