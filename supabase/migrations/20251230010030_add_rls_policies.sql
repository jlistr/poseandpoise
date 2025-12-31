-- supabase/migrations/[timestamp]_add_rls_policies.sql

alter table waitlist enable row level security;
alter table profiles enable row level security;

create policy "Anyone can join waitlist"
  on waitlist for insert
  with check (true);

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);