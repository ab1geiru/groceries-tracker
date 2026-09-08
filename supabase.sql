-- This schema is intended for a fresh Grocery Tracker project.

create extension if not exists pgcrypto;

create table if not exists public.grocery_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_date date not null,
  store_name text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grocery_transactions_items_is_array check (jsonb_typeof(items) = 'array')
);

create index if not exists grocery_transactions_user_date_idx
  on public.grocery_transactions (user_id, transaction_date desc);

alter table public.grocery_transactions enable row level security;

drop policy if exists "Users can read own grocery transactions" on public.grocery_transactions;
create policy "Users can read own grocery transactions"
  on public.grocery_transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create own grocery transactions" on public.grocery_transactions;
create policy "Users can create own grocery transactions"
  on public.grocery_transactions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own grocery transactions" on public.grocery_transactions;
create policy "Users can update own grocery transactions"
  on public.grocery_transactions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own grocery transactions" on public.grocery_transactions;
create policy "Users can delete own grocery transactions"
  on public.grocery_transactions
  for delete
  to authenticated
  using (auth.uid() = user_id);
