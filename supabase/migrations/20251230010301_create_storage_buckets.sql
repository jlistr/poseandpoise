-- Create storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  (
    'avatars', 
    'avatars', 
    true,
    5242880, -- 5MB
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'portfolio-photos', 
    'portfolio-photos', 
    true,
    10485760, -- 10MB
    array['image/jpeg', 'image/png', 'image/webp']
  );

-- Storage policies: avatars
create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies: portfolio-photos
create policy "Anyone can view portfolio photos"
  on storage.objects for select
  using (bucket_id = 'portfolio-photos');

create policy "Users can upload own portfolio photos"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolio-photos' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own portfolio photos"
  on storage.objects for update
  using (
    bucket_id = 'portfolio-photos' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own portfolio photos"
  on storage.objects for delete
  using (
    bucket_id = 'portfolio-photos' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );