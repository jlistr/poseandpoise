-- ============================================================================
-- POSE & POISE - COMMUNITY FEATURE DATABASE SCHEMA
-- Run this migration in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. COMMUNITY POSTS TABLE
-- ============================================================================
create table if not exists community_posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references profiles(id) on delete cascade not null,
  
  -- Post type: 'safety_alert' or 'success_story'
  post_type text not null check (post_type in ('safety_alert', 'success_story')),
  
  -- Content
  title text not null,
  content text not null,
  
  -- Metadata
  location text,
  photographer_name text,
  rating integer check (rating >= 1 and rating <= 5),
  tags text[] default '{}',
  
  -- For success stories - optional images
  image_urls text[] default '{}',
  
  -- Privacy & Moderation
  is_anonymous boolean default false,
  is_verified boolean default false,
  is_published boolean default false, -- Requires moderation approval
  
  -- Counts (denormalized for performance)
  helpful_count integer default 0,
  comment_count integer default 0,
  
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for common queries
create index if not exists community_posts_post_type_idx on community_posts(post_type);
create index if not exists community_posts_author_id_idx on community_posts(author_id);
create index if not exists community_posts_created_at_idx on community_posts(created_at desc);
create index if not exists community_posts_is_published_idx on community_posts(is_published) where is_published = true;

-- ============================================================================
-- 2. POST COMMENTS TABLE
-- ============================================================================
create table if not exists post_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references community_posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  
  content text not null,
  is_anonymous boolean default false,
  
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes
create index if not exists post_comments_post_id_idx on post_comments(post_id);
create index if not exists post_comments_author_id_idx on post_comments(author_id);

-- ============================================================================
-- 3. POST INTERACTIONS TABLE (Helpful votes & Bookmarks)
-- ============================================================================
create table if not exists post_interactions (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references community_posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  
  -- Interaction type: 'helpful' or 'bookmark'
  interaction_type text not null check (interaction_type in ('helpful', 'bookmark')),
  
  created_at timestamp with time zone default now(),
  
  -- Each user can only have one interaction of each type per post
  unique(post_id, user_id, interaction_type)
);

-- Indexes
create index if not exists post_interactions_post_id_idx on post_interactions(post_id);
create index if not exists post_interactions_user_id_idx on post_interactions(user_id);

-- ============================================================================
-- 4. HELPER FUNCTION: Check if user has active paid subscription
-- ============================================================================
create or replace function is_paid_subscriber(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from subscriptions
    where profile_id = user_id
    and plan_id in ('pro', 'agency')
    and status = 'active'
  );
end;
$$ language plpgsql security definer;

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table community_posts enable row level security;
alter table post_comments enable row level security;
alter table post_interactions enable row level security;

-- -----------------------------------------------------------------------------
-- COMMUNITY POSTS POLICIES
-- -----------------------------------------------------------------------------

-- SELECT: All authenticated users can read published posts
create policy "Anyone can view published posts"
  on community_posts for select
  using (is_published = true);

-- SELECT: Authors can always view their own posts (even unpublished)
create policy "Authors can view own posts"
  on community_posts for select
  using (auth.uid() = author_id);

-- INSERT: Only paid subscribers can create posts
create policy "Paid subscribers can create posts"
  on community_posts for insert
  with check (
    auth.uid() = author_id
    and is_paid_subscriber(auth.uid())
  );

-- UPDATE: Authors can update their own posts (if paid subscriber)
create policy "Authors can update own posts"
  on community_posts for update
  using (
    auth.uid() = author_id
    and is_paid_subscriber(auth.uid())
  );

-- DELETE: Authors can delete their own posts
create policy "Authors can delete own posts"
  on community_posts for delete
  using (auth.uid() = author_id);

-- -----------------------------------------------------------------------------
-- POST COMMENTS POLICIES
-- -----------------------------------------------------------------------------

-- SELECT: All authenticated users can read comments on published posts
create policy "Anyone can view comments on published posts"
  on post_comments for select
  using (
    exists (
      select 1 from community_posts
      where community_posts.id = post_comments.post_id
      and community_posts.is_published = true
    )
  );

-- INSERT: Only paid subscribers can comment
create policy "Paid subscribers can comment"
  on post_comments for insert
  with check (
    auth.uid() = author_id
    and is_paid_subscriber(auth.uid())
  );

-- UPDATE: Authors can update their own comments
create policy "Authors can update own comments"
  on post_comments for update
  using (auth.uid() = author_id);

-- DELETE: Authors can delete their own comments
create policy "Authors can delete own comments"
  on post_comments for delete
  using (auth.uid() = author_id);

-- -----------------------------------------------------------------------------
-- POST INTERACTIONS POLICIES
-- -----------------------------------------------------------------------------

-- SELECT: Users can see their own interactions
create policy "Users can view own interactions"
  on post_interactions for select
  using (auth.uid() = user_id);

-- INSERT: All authenticated users can interact (read-only users can still "helpful" and bookmark)
create policy "Authenticated users can interact"
  on post_interactions for insert
  with check (auth.uid() = user_id);

-- DELETE: Users can remove their own interactions
create policy "Users can remove own interactions"
  on post_interactions for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 6. TRIGGERS FOR DENORMALIZED COUNTS
-- ============================================================================

-- Function to update helpful count
create or replace function update_helpful_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' and NEW.interaction_type = 'helpful' then
    update community_posts
    set helpful_count = helpful_count + 1
    where id = NEW.post_id;
  elsif TG_OP = 'DELETE' and OLD.interaction_type = 'helpful' then
    update community_posts
    set helpful_count = helpful_count - 1
    where id = OLD.post_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger on_helpful_change
  after insert or delete on post_interactions
  for each row execute function update_helpful_count();

-- Function to update comment count
create or replace function update_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update community_posts
    set comment_count = comment_count + 1
    where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update community_posts
    set comment_count = comment_count - 1
    where id = OLD.post_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger on_comment_change
  after insert or delete on post_comments
  for each row execute function update_comment_count();

-- Function to update timestamps
create or replace function update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on community_posts
  for each row execute function update_updated_at();

create trigger set_updated_at_comments
  before update on post_comments
  for each row execute function update_updated_at();

-- ============================================================================
-- 7. COMMUNITY STATS VIEW (for dashboard stats)
-- ============================================================================
create or replace view community_stats as
select
  (select count(*) from profiles) as total_members,
  (select count(*) from community_posts where post_type = 'safety_alert' and is_published = true) as safety_alerts_count,
  (select count(*) from community_posts where post_type = 'success_story' and is_published = true) as success_stories_count,
  (select count(distinct photographer_name) from community_posts where post_type = 'success_story' and is_published = true and rating >= 4) as verified_photographers_count;