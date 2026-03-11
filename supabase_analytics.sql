-- RESUME_VIEWS Tablosu (Analytics için)
create table if not exists public.resume_views (
  id uuid default gen_random_uuid() primary key,
  slug text not null references public.resume_links(slug) on update cascade on delete cascade,
  viewer_ip text,
  user_agent text,
  view_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- resume_links tablosundaki views sayısını otomatik artıracak trigger tablosu fonksiyonu
create or replace function public.increment_resume_views()
returns trigger as $$
begin
  update public.resume_links
  set views = views + 1
  where slug = new.slug;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger'ı oluştur (Eğer daha önce varsa hata vermesin diye önce düşür)
drop trigger if exists on_resume_view on public.resume_views;
create trigger on_resume_view
  after insert on public.resume_views
  for each row execute function public.increment_resume_views();

-- RLS (Sadece Analytics amaçlı veri eklenebilir ama okuma için Resume sahibine yetki verilir)
alter table public.resume_views enable row level security;

drop policy if exists "Anyone can insert views" on public.resume_views;
drop policy if exists "Owner can view analytics" on public.resume_views;

create policy "Anyone can insert views" on public.resume_views for insert with check (true);
create policy "Owner can view analytics" on public.resume_views for select using (
  exists (
    select 1 from public.resume_links rl
    join public.resumes r on rl.resume_id = r.id
    where rl.slug = resume_views.slug and r.user_id = auth.uid()
  )
);
