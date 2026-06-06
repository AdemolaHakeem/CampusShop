-- ============================================================
-- CAMPUS SHOP - Multi-Tenant Campus Schema Migration
-- ============================================================
-- Run this entire script in your Supabase SQL Editor.
--
-- What it does:
--   1. Creates the `campuses` table (universities/institutions)
--   2. Creates the `profiles` table (extends auth.users with campus_id)
--   3. Adds a nullable `campus_id` column to `listings`
--   4. Enables Row Level Security on all new tables
--   5. Creates a trigger that auto-creates a profile row when
--      a new user signs up via Supabase Auth
--   6. Adds a UNIQUE constraint on campuses.name so the seed
--      script can upsert without creating duplicates
--   7. Adds a GIN trigram index on campuses.name for fast
--      fuzzy autocomplete searches
--
-- DATA: Run `npm run seed` AFTER this migration to import
--       ~120+ Nigerian universities from supabase/seed_campuses.json.
-- ============================================================

-- 1. Campuses table (universities / institutions)
CREATE TABLE IF NOT EXISTS public.campuses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,       -- institution name (unique for upsert)
  domain     TEXT UNIQUE,               -- optional e.g. "unilag.edu.ng"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigram index for fast ILIKE search on campus names
-- Requires the pg_trgm extension (enabled by default on Supabase)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_campuses_name_trgm
  ON public.campuses USING GIN (name gin_trgm_ops);

-- 2. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  campus_id  UUID NOT NULL REFERENCES public.campuses(id),
  name       TEXT,
  phone      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add campus_id to existing listings (nullable = global / general feed)
ALTER TABLE IF EXISTS public.listings
  ADD COLUMN IF NOT EXISTS campus_id UUID
  REFERENCES public.campuses(id)
  ON DELETE SET NULL;

-- -----------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;

-- Everyone (even unauthenticated visitors) can browse campuses
CREATE POLICY "Campuses are publicly readable"
  ON public.campuses FOR SELECT
  USING (true);

-- Only authenticated users can manage their own profile rows
CREATE POLICY "Profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- -----------------------------------------------------------
-- TRIGGER: Auto-create profile when a user signs up
-- -----------------------------------------------------------
-- Pulls campus_id, name, and phone from raw_user_meta_data
-- so the profile is created atomically with the auth user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, campus_id, name, phone)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'campus_id')::UUID,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- NO seed data here — run `npm run seed` instead to import
-- the full list from supabase/seed_campuses.json.
-- ============================================================
