-- Create members table for user profiles with member numbers
create table if not exists public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  member_number serial unique,
  created_at timestamp with time zone default now()
);

-- Create high_scores table for the leaderboard
create table if not exists public.high_scores (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  score integer not null,
  bonk_collected integer default 0,
  wif_collected integer default 0,
  pepe_collected integer default 0,
  sol_collected integer default 0,
  created_at timestamp with time zone default now()
);

-- Create index for faster leaderboard queries
create index if not exists idx_high_scores_score on public.high_scores(score desc);
create index if not exists idx_high_scores_member on public.high_scores(member_id);

-- Enable Row Level Security
alter table public.members enable row level security;
alter table public.high_scores enable row level security;

-- Members policies
create policy "members_select_all" on public.members for select using (true);
create policy "members_insert_own" on public.members for insert with check (auth.uid() = id);
create policy "members_update_own" on public.members for update using (auth.uid() = id);

-- High scores policies - everyone can view, users can insert their own
create policy "scores_select_all" on public.high_scores for select using (true);
create policy "scores_insert_own" on public.high_scores for insert with check (auth.uid() = member_id);
