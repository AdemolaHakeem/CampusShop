-- ============================================================
-- SECURITY FIX: Restrict profiles to user's own profile only
-- ============================================================
-- The old policy let ANY authenticated user see ALL profiles
-- (names, phone numbers, campus_id). This fixes that.
-- ============================================================

-- Remove the overly-permissive policy
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are readable by all authenticated users" ON public.profiles;

-- Users can only read their own profile
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Verify: run this query to see all current policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';


-- ============================================================
-- STORAGE RLS — run this in Supabase SQL Editor too
-- ============================================================
-- After creating the 'listings' bucket in Supabase Storage,
-- run these to set up proper access control.
-- ============================================================

-- Allow anyone to view listing images (needed for the marketplace)
CREATE POLICY "Public can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own uploads"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'listings' AND auth.uid() = owner);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own uploads"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'listings' AND auth.uid() = owner);
