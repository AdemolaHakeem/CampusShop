-- ============================================================
-- Performance & Feature Indexes
-- ============================================================
-- Run this in Supabase SQL Editor after create_listings_table.sql.
-- ============================================================

-- Composite index for the main marketplace query:
--   WHERE campus_id = ? ORDER BY created_at DESC
-- The existing separate indexes on campus_id and created_at
-- can't efficiently handle both conditions together.
CREATE INDEX IF NOT EXISTS idx_listings_campus_created
  ON public.listings(campus_id, created_at DESC);

-- Composite index for user's own listings sorted by date:
--   WHERE seller_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_listings_seller_created
  ON public.listings(seller_id, created_at DESC);

-- Partial index for active listings only (used by marketplace)
CREATE INDEX IF NOT EXISTS idx_listings_active
  ON public.listings(created_at DESC)
  WHERE status = 'active';
