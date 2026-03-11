-- RESUMES Tablosu
create table if not exists public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  skills text,
  experience text,
  education text,
  achievements text,
  ats_score numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RESUME_LINKS Tablosu
create table if not exists public.resume_links (
  id uuid default gen_random_uuid() primary key,
  resume_id uuid references public.resumes(id) on delete cascade not null,
  slug text unique not null,
  is_active boolean default true,
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- JOB_TRACKER Tablosu
create table if not exists public.job_tracker (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company text not null,
  title text not null,
  url text,
  status text not null, -- 'Applied', 'Interview', 'Offer', 'Rejected'
  applied_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICY (Row Level Security) Ayarları
alter table public.resumes enable row level security;
alter table public.resume_links enable row level security;
alter table public.job_tracker enable row level security;

-- Güvenlik kurallarını çakışma olmaması adına önce silip sonra oluşturuyoruz
drop policy if exists "Users can view own resumes" on public.resumes;
drop policy if exists "Users can insert own resumes" on public.resumes;
drop policy if exists "Users can update own resumes" on public.resumes;
drop policy if exists "Users can delete own resumes" on public.resumes;

create policy "Users can view own resumes" on public.resumes for select using (auth.uid() = user_id);
create policy "Users can insert own resumes" on public.resumes for insert with check (auth.uid() = user_id);
create policy "Users can update own resumes" on public.resumes for update using (auth.uid() = user_id);
create policy "Users can delete own resumes" on public.resumes for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own jobs" on public.job_tracker;
drop policy if exists "Users can insert own jobs" on public.job_tracker;
drop policy if exists "Users can update own jobs" on public.job_tracker;
drop policy if exists "Users can delete own jobs" on public.job_tracker;

create policy "Users can view own jobs" on public.job_tracker for select using (auth.uid() = user_id);
create policy "Users can insert own jobs" on public.job_tracker for insert with check (auth.uid() = user_id);
create policy "Users can update own jobs" on public.job_tracker for update using (auth.uid() = user_id);
create policy "Users can delete own jobs" on public.job_tracker for delete using (auth.uid() = user_id);

drop policy if exists "Anyone can read active links" on public.resume_links;
drop policy if exists "Users can insert own links" on public.resume_links;
drop policy if exists "Users can update own links" on public.resume_links;

create policy "Anyone can read active links" on public.resume_links for select using (is_active = true);
create policy "Users can insert own links" on public.resume_links for insert with check (
  resume_id in (select id from public.resumes where user_id = auth.uid())
);
create policy "Users can update own links" on public.resume_links for update using (
  resume_id in (select id from public.resumes where user_id = auth.uid())
);
