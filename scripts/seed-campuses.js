/**
 * Seed script — imports Nigerian universities from
 * supabase/seed_campuses.json into the `campuses` table.
 *
 * Usage:
 *   npm run seed
 *
 * Requirements:
 *   - .env file with VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   - The campuses table must already exist (run migration first)
 *
 * Why SERVICE_ROLE_KEY?
 *   The anon key can't INSERT into tables (RLS blocks it).
 *   The service_role key bypasses RLS and is only used server-side.
 *   Find yours: Supabase Dashboard > Project Settings > API > service_role key
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// ---------------------------------------------------------------
// 1. Load environment variables from .env
// ---------------------------------------------------------------
const envPath = resolve(rootDir, '.env');

if (!existsSync(envPath)) {
  console.error('\n  ❌  No .env file found at', envPath);
  console.error('     Create one with:\n');
  console.error('     VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n');
  process.exit(1);
}

const envRaw = readFileSync(envPath, 'utf-8');
const envVars = {};

for (const line of envRaw.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  envVars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
}

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('\n  ❌  VITE_SUPABASE_URL must be set in .env\n');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('\n  ❌  SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  console.error('     Find it: Supabase Dashboard > Project Settings > API\n');
  process.exit(1);
}

// ---------------------------------------------------------------
// 2. Read seed data
// ---------------------------------------------------------------
const seedPath = resolve(rootDir, 'supabase', 'seed_campuses.json');

if (!existsSync(seedPath)) {
  console.error('\n  ❌  seed_campuses.json not found at', seedPath, '\n');
  process.exit(1);
}

const universities = JSON.parse(readFileSync(seedPath, 'utf-8'));

if (!Array.isArray(universities) || universities.length === 0) {
  console.error('\n  ❌  seed_campuses.json is empty or not an array\n');
  process.exit(1);
}

// ---------------------------------------------------------------
// 3. Transform data
// ---------------------------------------------------------------
const rows = universities.map((u) => {
  let domain = null;
  if (u.web) {
    try {
      domain = new URL(u.web).hostname.replace(/^www\./, '');
    } catch {
      domain = null;
    }
  }
  return { name: u.name.trim(), domain };
});

console.log(`\n  📚  Found ${rows.length} universities in seed_campuses.json\n`);
console.log('  ⏳  Upserting into Supabase...\n');

// ---------------------------------------------------------------
// 4. Connect with service_role key (bypasses RLS) & upsert
// ---------------------------------------------------------------
const supabase = createClient(supabaseUrl, serviceRoleKey);

const { error } = await supabase
  .from('campuses')
  .upsert(rows, { onConflict: 'name', ignoreDuplicates: false });

if (error) {
  console.error('  ❌  Upsert failed:', error.message, '\n');
  process.exit(1);
}

console.log(`  ✅  Successfully upserted ${rows.length} universities into the campuses table.\n`);
console.log('  🎓  Your CampusShop app is now ready for student signups!\n');

// ---------------------------------------------------------------
// 5. Quick verification
// ---------------------------------------------------------------
const { count, error: countError } = await supabase
  .from('campuses')
  .select('id', { count: 'exact', head: true });

if (!countError) {
  console.log(`  📊  Total rows in campuses table: ${count}\n`);
}

process.exit(0);
