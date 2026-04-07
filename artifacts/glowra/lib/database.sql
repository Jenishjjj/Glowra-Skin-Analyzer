-- ============================================================
-- Glowra — Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the database
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Stores extra user data beyond Supabase Auth
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null default 'Glowra User',
  age          int  not null default 25,
  plan         text not null default 'free'  check (plan in ('free','plus','pro')),
  scans_today  int  not null default 0,
  last_scan_date text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Row-level security
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Glowra User'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── scan_results ──────────────────────────────────────────────────────────────
create table if not exists public.scan_results (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  skin_score    int  not null,
  skin_age      int  not null,
  actual_age    int  not null,
  hydration     int  not null,
  pigmentation  int  not null,
  texture       int  not null,
  pores         int  not null,
  elasticity    int  not null default 70,
  image_uri     text,
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists scan_results_user_id_idx  on public.scan_results(user_id);
create index if not exists scan_results_created_at_idx on public.scan_results(created_at desc);

-- Row-level security
alter table public.scan_results enable row level security;

create policy "Users can view own scans"
  on public.scan_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own scans"
  on public.scan_results for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own scans"
  on public.scan_results for delete
  using (auth.uid() = user_id);
