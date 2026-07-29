create extension if not exists pgcrypto;

create table if not exists public.policy_articles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  category text not null default '重大会议',
  article_date date,
  source text not null default '',
  tags text[] not null default '{}',
  markdown text not null default '',
  pinned boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.policy_codices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  summary text not null default '',
  publish_date date,
  source text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.policy_codex_entries (
  id uuid primary key default gen_random_uuid(),
  codex_id uuid not null references public.policy_codices(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  entry_number text not null default '',
  title text not null default '',
  body text not null default '',
  notes text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists policy_articles_owner_updated_idx
  on public.policy_articles(owner_id, updated_at desc);

create index if not exists policy_codices_owner_updated_idx
  on public.policy_codices(owner_id, updated_at desc);

create index if not exists policy_codex_entries_owner_codex_sort_idx
  on public.policy_codex_entries(owner_id, codex_id, sort_order asc);

alter table public.policy_articles enable row level security;
alter table public.policy_codices enable row level security;
alter table public.policy_codex_entries enable row level security;

create policy "policy_articles_select_own"
  on public.policy_articles
  for select
  using (auth.uid() = owner_id);

create policy "policy_articles_insert_own"
  on public.policy_articles
  for insert
  with check (auth.uid() = owner_id);

create policy "policy_articles_update_own"
  on public.policy_articles
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "policy_articles_delete_own"
  on public.policy_articles
  for delete
  using (auth.uid() = owner_id);

create policy "policy_codices_select_own"
  on public.policy_codices
  for select
  using (auth.uid() = owner_id);

create policy "policy_codices_insert_own"
  on public.policy_codices
  for insert
  with check (auth.uid() = owner_id);

create policy "policy_codices_update_own"
  on public.policy_codices
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "policy_codices_delete_own"
  on public.policy_codices
  for delete
  using (auth.uid() = owner_id);

create policy "policy_codex_entries_select_own"
  on public.policy_codex_entries
  for select
  using (auth.uid() = owner_id);

create policy "policy_codex_entries_insert_own"
  on public.policy_codex_entries
  for insert
  with check (auth.uid() = owner_id);

create policy "policy_codex_entries_update_own"
  on public.policy_codex_entries
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "policy_codex_entries_delete_own"
  on public.policy_codex_entries
  for delete
  using (auth.uid() = owner_id);
