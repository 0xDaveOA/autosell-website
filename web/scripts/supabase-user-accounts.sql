-- ============================================================
-- User Accounts migration — run in Supabase SQL editor
-- ============================================================

-- 1. Profiles table (auto-created on signup via trigger below)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger: auto-insert a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. Link car_submissions to users (nullable — existing rows stay null)
ALTER TABLE public.car_submissions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Index for dashboard queries
CREATE INDEX IF NOT EXISTS car_submissions_user_id_idx ON public.car_submissions(user_id);

-- Sellers can see their own submissions (regardless of status)
CREATE POLICY "Sellers can view own submissions" ON public.car_submissions
  FOR SELECT USING (auth.uid() = user_id);

-- Sellers can update only their own submissions
CREATE POLICY "Sellers can update own submissions" ON public.car_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 3. Link rental_partners to users (nullable — existing rows stay null)
ALTER TABLE public.rental_partners
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS rental_partners_user_id_idx ON public.rental_partners(user_id);

CREATE POLICY "Partners can view own partner row" ON public.rental_partners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners can update own partner row" ON public.rental_partners
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 4. Saved listings (favourites)
CREATE TABLE IF NOT EXISTS public.saved_listings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('car', 'rental')),
  listing_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, listing_type, listing_id)
);
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved listings" ON public.saved_listings
  FOR ALL USING (auth.uid() = user_id);
