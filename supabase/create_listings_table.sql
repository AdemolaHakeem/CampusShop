-- ============================================================
-- LISTINGS TABLE — run this in Supabase SQL Editor
-- ============================================================
-- This creates the `listings` table that the app needs.
-- The campus_id column was already added by the migration.
-- Run this AFTER migration_campus_schema.sql.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  price         NUMERIC NOT NULL,
  category      TEXT NOT NULL,
  image_url     TEXT DEFAULT '',
  seller_id     UUID NOT NULL,
  seller_name   TEXT NOT NULL DEFAULT 'Anonymous',
  whatsapp_number TEXT DEFAULT '',
  campus_id     UUID REFERENCES public.campuses(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (already enabled if migration ran, but safe to repeat)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Anyone can browse listings
CREATE POLICY "Listings are publicly readable"
  ON public.listings FOR SELECT
  USING (true);

-- Authenticated users can insert their own listings
CREATE POLICY "Users can insert their own listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Users can update their own listings
CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = seller_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete their own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = seller_id);

-- Index for fast campus-scoped queries
CREATE INDEX IF NOT EXISTS idx_listings_campus_id
  ON public.listings(campus_id);

-- Index for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_listings_seller_id
  ON public.listings(seller_id);

-- Index for sorting by newest first
CREATE INDEX IF NOT EXISTS idx_listings_created_at
  ON public.listings(created_at DESC);
