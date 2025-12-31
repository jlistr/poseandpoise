create table reviews (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references profiles(id) on delete cascade,
  subject_type text not null, -- 'photographer', 'studio', 'agency'
  subject_name text not null,
  rating integer check (rating >= 1 and rating <= 5),
  is_warning boolean default false, -- "bad vibe" flag
  is_recommendation boolean default false,
  title text,
  content text not null,
  is_public boolean default true,
  created_at timestamp with time zone default now()
);
