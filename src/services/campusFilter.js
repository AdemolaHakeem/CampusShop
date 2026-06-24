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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const withCampusScope = (query, campusId) => {
  if (!campusId) return query;

  if (!UUID_RE.test(campusId)) return query;

  return query.or(`campus_id.eq.${campusId},campus_id.is.null`);
};
