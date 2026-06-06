import { supabase } from './supabase';
import CAMPUSES from '../data/campuses.js';

/**
 * Local fallback: search the bundled campus data directly.
 * Used when Supabase isn't connected yet, so the autocomplete
 * always works even before the database is set up.
 */
const localSearch = (query, limit = 15) => {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  return CAMPUSES
    .filter((u) => u.name.toLowerCase().includes(q))
    .slice(0, limit)
    .map((u) => {
      let domain = null;
      if (u.web) {
        try {
          domain = new URL(u.web).hostname.replace(/^www\./, '');
        } catch {
          domain = null;
        }
      }
      return {
        id: u.name,
        name: u.name,
        domain,
      };
    });
};

/**
 * Search campuses by name.
 * Tries Supabase first; falls back to local JSON search.
 *
 * @param {string} query  Partial institution name to search for
 * @param {number} [limit=15]  Max results to return
 * @returns {Promise<Array<{id: string, name: string, domain: string|null}>>}
 */
export const searchCampuses = async (query, limit = 15) => {
  if (!query || query.trim().length < 1) return [];

  try {
    const { data, error } = await supabase
      .from('campuses')
      .select('id, name, domain')
      .ilike('name', `%${query.trim()}%`)
      .order('name', { ascending: true })
      .limit(limit);

    if (error) throw error;
    if (data && data.length > 0) return data;

    // No results or error — fall back to local data
    console.warn('Supabase campuses query returned no results, using local fallback');
    return localSearch(query, limit);
  } catch (err) {
    console.warn('Supabase campuses query failed, using local fallback:', err.message);
    return localSearch(query, limit);
  }
};

/**
 * Fetch a single campus by id.
 * Falls back to local search if Supabase is unavailable.
 *
 * @param {string} id
 * @returns {Promise<{id: string, name: string, domain: string|null}|null>}
 */
export const getCampusById = async (id) => {
  if (!id) return null;

  try {
    const { data, error } = await supabase
      .from('campuses')
      .select('id, name, domain')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase getCampusById failed, using local fallback:', err.message);
    const found = CAMPUSES.find((u) => u.name === id);
    if (!found) return null;
    let domain = null;
    if (found.web) {
      try {
        domain = new URL(found.web).hostname.replace(/^www\./, '');
      } catch {
        domain = null;
      }
    }
    return {
      id: found.name,
      name: found.name,
      domain,
    };
  }
};

/**
 * Fetch the user's campus profile row.
 * Returns campus_id, name, phone etc. from the profiles table.
 *
 * @param {string} userId
 * @returns {Promise<{campus_id: string, name: string|null, phone: string|null}|null>}
 */
export const getUserProfile = async (userId) => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*, campuses!inner(name, domain)')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};
