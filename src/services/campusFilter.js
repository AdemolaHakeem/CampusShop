import { supabase } from './supabase';

/**
 * Middleware: scopes a Supabase listing query to the user's campus.
 *
 * Automatically adds a filter so the query returns:
 *   - Listings that belong to the user's campus (campus_id matches)
 *   - Listings with no campus (campus_id IS NULL) = global/general feed
 *
 * If no campusId is provided the query runs unfiltered (full global view).
 *
 * @param {import('@supabase/supabase-js').PostgrestFilterBuilder} query
 * @param {string|null|undefined} campusId
 * @returns {import('@supabase/supabase-js').PostgrestFilterBuilder}
 *
 * @example
 *   import { withCampusScope } from '../services/campusFilter';
 *
 *   const q = withCampusScope(
 *     supabase.from('listings').select('*'),
 *     currentUser.campusId
 *   ).order('created_at', { ascending: false });
 */
export const withCampusScope = (query, campusId) => {
  if (!campusId) return query;

  // Return items matching user's campus OR global items (campus_id IS NULL)
  return query.or(`campus_id.eq.${campusId},campus_id.is.null`);
};
