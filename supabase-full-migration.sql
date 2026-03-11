-- ================================================================
-- ResumeAI — Full Supabase Migration Script (Production Ready)
-- Çalıştırma sırası: Bu dosyayı Supabase SQL Editor'de bir kez çalıştırın.
-- ================================================================

-- ================================================================
-- 1. USERS Tablosu (public profil bilgileri için)
-- Supabase Auth (auth.users) ile senkronize edilir.
-- ================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  email text UNIQUE,
  avatar_url text,
  bio text,
  subscription_status text DEFAULT 'free',   -- 'free' | 'trialing' | 'pro' | 'cancelled'
  trial_ends_at timestamp with time zone,
  paddle_customer_id text,
  paddle_subscription_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- 2. RESUMES Tablosu
-- ================================================================
CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text,
  skills text,
  experience text,
  education text,
  achievements text,
  summary text,
  contact jsonb,          -- { email, phone, location, website, linkedin }
  ats_score numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- 3. RESUME_LINKS Tablosu (Public Share Links)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.resume_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id uuid REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  slug text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  views integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- 4. JOB_TRACKER Tablosu
-- ================================================================
CREATE TABLE IF NOT EXISTS public.job_tracker (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company text NOT NULL,
  title text NOT NULL,
  url text,
  status text NOT NULL DEFAULT 'Saved',  -- 'Saved' | 'Applied' | 'Interviewing' | 'Offered' | 'Rejected'
  notes text,
  applied_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- 5. RESUME_VIEWS Tablosu (Analytics)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.resume_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL REFERENCES public.resume_links(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  viewer_ip text,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- 6. AUTO-INCREMENT VIEWS TRIGGER
-- resume_views tablosuna yeni kayıt eklenince resume_links.views artar
-- ================================================================
CREATE OR REPLACE FUNCTION public.increment_resume_views()
RETURNS trigger AS $$
BEGIN
  UPDATE public.resume_links
  SET views = views + 1
  WHERE slug = NEW.slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_resume_view ON public.resume_views;
CREATE TRIGGER on_resume_view
  AFTER INSERT ON public.resume_views
  FOR EACH ROW EXECUTE FUNCTION public.increment_resume_views();

-- ================================================================
-- 7. AUTO-CREATE USER PROFILE (Auth Trigger)
-- Yeni kullanıcı kaydolunca public.users tablosuna otomatik eklenir
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW() + INTERVAL '7 days'   -- 7 günlük ücretsiz deneme
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 8. ROW LEVEL SECURITY (RLS) Ayarları
-- ================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_views ENABLE ROW LEVEL SECURITY;

-- Eski policy varsa temizle
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Public can view resumes tied to active links" ON public.resumes;

DROP POLICY IF EXISTS "Anyone can read active links" ON public.resume_links;
DROP POLICY IF EXISTS "Users can insert own links" ON public.resume_links;
DROP POLICY IF EXISTS "Users can update own links" ON public.resume_links;
DROP POLICY IF EXISTS "Users can delete own links" ON public.resume_links;

DROP POLICY IF EXISTS "Users can view own jobs" ON public.job_tracker;
DROP POLICY IF EXISTS "Users can insert own jobs" ON public.job_tracker;
DROP POLICY IF EXISTS "Users can update own jobs" ON public.job_tracker;
DROP POLICY IF EXISTS "Users can delete own jobs" ON public.job_tracker;

DROP POLICY IF EXISTS "Anyone can insert views" ON public.resume_views;
DROP POLICY IF EXISTS "Owner can view analytics" ON public.resume_views;

-- USERS Policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RESUMES Policies
CREATE POLICY "Users can view own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view resumes tied to active links" ON public.resumes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.resume_links WHERE resume_links.resume_id = resumes.id AND resume_links.is_active = true));
CREATE POLICY "Users can insert own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- RESUME_LINKS Policies
CREATE POLICY "Anyone can read active links" ON public.resume_links FOR SELECT USING (is_active = true);
CREATE POLICY "Users can insert own links" ON public.resume_links FOR INSERT
  WITH CHECK (resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own links" ON public.resume_links FOR UPDATE
  USING (resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own links" ON public.resume_links FOR DELETE
  USING (resume_id IN (SELECT id FROM public.resumes WHERE user_id = auth.uid()));

-- JOB_TRACKER Policies
CREATE POLICY "Users can view own jobs" ON public.job_tracker FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.job_tracker FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.job_tracker FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON public.job_tracker FOR DELETE USING (auth.uid() = user_id);

-- RESUME_VIEWS Policies
CREATE POLICY "Anyone can insert views" ON public.resume_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner can view analytics" ON public.resume_views FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.resume_links rl
    JOIN public.resumes r ON rl.resume_id = r.id
    WHERE rl.slug = resume_views.slug AND r.user_id = auth.uid()
  ));

-- ================================================================
-- Migration Tamamlandı!
-- ================================================================
