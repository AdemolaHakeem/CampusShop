-- ============================================================
-- Feature Migration: status, condition, reviews, full-text search
-- ============================================================
-- Run this in Supabase SQL Editor AFTER create_listings_table.sql.
-- ============================================================

-- 1. Add status column (active / sold)
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'sold'));

-- 2. Add condition column (new / like-new / used / null)
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT NULL
  CHECK (condition IS NULL OR condition IN ('new', 'like-new', 'used'));

-- 3. Add full-text search support
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_listings_search
  ON public.listings USING GIN (search_vector);

-- 4. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(listing_id, reviewer_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
DROP POLICY IF EXISTS "Reviews are publicly readable" ON public.reviews;
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT
  USING (true);

-- Authenticated users can insert their own reviews
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
CREATE POLICY "Users can insert their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Users can update their own reviews
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- Users can delete their own reviews
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

-- Index for fast listing-specific review lookups
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id
  ON public.reviews(listing_id);

-- Index for fast user-specific review lookups
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id
  ON public.reviews(reviewer_id);
