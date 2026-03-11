-- =======================================================
-- ResumeAI Production Setup & Row Level Security (RLS)
-- =======================================================

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_views ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any (to allow re-running this script cleanly)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

DROP POLICY IF EXISTS "Users can view their own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert their own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON resumes;
DROP POLICY IF EXISTS "Anyone can view public resumes" ON resumes;

DROP POLICY IF EXISTS "Users can manage their links" ON resume_links;
DROP POLICY IF EXISTS "Anyone can view active public links" ON resume_links;

DROP POLICY IF EXISTS "Users can manage their own job tracker" ON job_tracker;

DROP POLICY IF EXISTS "Anyone can insert resume views" ON resume_views;
DROP POLICY IF EXISTS "Users can view stats for their own links" ON resume_views;

-- 3. Create strong, production-ready POLICIES

-- ====================================
-- USERS Table
-- ====================================
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ====================================
-- RESUMES Table
-- ====================================
-- User can read all their own resumes
CREATE POLICY "Users can view their own resumes"
ON resumes FOR SELECT
USING (auth.uid() = user_id);

-- Wait, public viewers need to read the resume IF they have a valid link!
-- They do so by passing through the resume_links table, which joins to resumes.
-- In Supabase, standard practice for public pages is either using the service_role key server-side,
-- or allowing public read if a related link exists.
-- Since our Next.js backend uses service_role or server-client, we will allow read access 
-- if the resume is tied to an active public link.
CREATE POLICY "Public can view resumes tied to active links"
ON resumes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM resume_links
    WHERE resume_links.resume_id = resumes.id
    AND resume_links.is_active = true
  )
);

CREATE POLICY "Users can insert their own resumes"
ON resumes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
ON resumes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
ON resumes FOR DELETE
USING (auth.uid() = user_id);

-- ====================================
-- RESUME_LINKS Table
-- ====================================
-- Users can manage their own links 
-- Note: resume_links itself doesn't have a user_id, it is tied through resume_id
CREATE POLICY "Users can manage their links"
ON resume_links
USING (
  EXISTS (
    SELECT 1 FROM resumes
    WHERE resumes.id = resume_links.resume_id
    AND resumes.user_id = auth.uid()
  )
);

-- Anyone can read active links (so recruiters can see the resume page)
CREATE POLICY "Anyone can view active public links"
ON resume_links FOR SELECT
USING (is_active = true);

-- ====================================
-- JOB_TRACKER Table
-- ====================================
CREATE POLICY "Users can view their own job tracker"
ON job_tracker FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job tracker"
ON job_tracker FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job tracker"
ON job_tracker FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job tracker"
ON job_tracker FOR DELETE USING (auth.uid() = user_id);

-- ====================================
-- RESUME_VIEWS Table (Analytics)
-- ====================================
-- Anyone/Anonymous can INSERT a view (we track public visits without auth)
CREATE POLICY "Anyone can insert resume views"
ON resume_views FOR INSERT
WITH CHECK (true);

-- Only the owner of the resume can view the analytics
CREATE POLICY "Users can view stats for their own links"
ON resume_views FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM resume_links
    JOIN resumes ON resumes.id = resume_links.resume_id
    WHERE resume_links.slug = resume_views.slug
    AND resumes.user_id = auth.uid()
  )
);

-- =======================================================
-- End of Policies
-- =======================================================
