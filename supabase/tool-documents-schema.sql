create table if not exists public.tool_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  tool_key text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (owner_id, tool_key)
);

create index if not exists tool_documents_owner_tool_idx
  on public.tool_documents(owner_id, tool_key);

alter table public.tool_documents enable row level security;

create policy "tool_documents_select_own"
  on public.tool_documents
  for select
  using (auth.uid() = owner_id);

create policy "tool_documents_insert_own"
  on public.tool_documents
  for insert
  with check (auth.uid() = owner_id);

create policy "tool_documents_update_own"
  on public.tool_documents
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "tool_documents_delete_own"
  on public.tool_documents
  for delete
  using (auth.uid() = owner_id);
