-- ============================================================
-- CAMPUS SHOP — Admin Role Migration
-- ============================================================
-- Run this in your Supabase SQL Editor after the other migrations.
--
-- What it does:
--   1. Adds a `role` column to `profiles` (default: 'user')
--   2. Creates a helper function to check if a user is admin
--   3. Creates a helper function to promote a user to admin
-- ============================================================

-- Add email column to profiles (populated by trigger, avoids client-side auth.admin calls)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Add role column to profiles (default: 'user', valid: 'user', 'admin', 'super_admin')
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'super_admin'));

-- Track when a user was last active
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ;

-- Index for quickly finding admin users
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- -----------------------------------------------------------
-- Helper: Check if a user has admin privileges
-- Usage: SELECT public.is_admin(auth.uid());
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;

  RETURN user_role IN ('admin', 'super_admin');
END;
$$;

-- -----------------------------------------------------------
-- Helper: Get all admin users (for super_admin only)
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  campus_id UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Only super_admin can view all admins
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super_admin can view admin users';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    au.email,
    p.role,
    p.campus_id,
    p.created_at
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.role IN ('admin', 'super_admin')
  ORDER BY p.created_at DESC;
END;
$$;

-- -----------------------------------------------------------
-- Update the trigger function to also store email
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, campus_id, name, phone, email)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'campus_id')::UUID,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------
-- RLS: Admins can read all profiles
-- -----------------------------------------------------------
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- -----------------------------------------------------------
-- RLS: Admins can manage all listings
-- -----------------------------------------------------------
DROP POLICY IF EXISTS "Admins can update any listing" ON public.listings;
CREATE POLICY "Admins can update any listing"
  ON public.listings FOR UPDATE
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete any listing" ON public.listings;
CREATE POLICY "Admins can delete any listing"
  ON public.listings FOR DELETE
  USING (public.is_admin(auth.uid()));
