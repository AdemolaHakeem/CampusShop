import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('RAW_ENV_VALUES:', { rawUrl, rawKey });

const supabaseUrl = (typeof rawUrl === 'string' && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) 
  ? rawUrl 
  : 'https://placeholder-prevent-crash.supabase.co';

const supabaseAnonKey = (typeof rawKey === 'string' && rawKey.length > 5) 
  ? rawKey 
  : 'placeholder-anon-key';

console.log('RESOLVED_ENV_VALUES:', { supabaseUrl, supabaseAnonKey });

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
