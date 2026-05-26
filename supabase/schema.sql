-- NEXORA HUB V1 Supabase schema
-- Early development note:
-- Row Level Security is intentionally disabled for now while cloud storage is
-- being prepared. Auth policies should be added before production multi-user use.

create extension if not exists pgcrypto;

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  color text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.workspace_systems (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  url text not null,
  description text,
  icon text,
  color text,
  tags text[] default '{}',
  favorite boolean default false,
  pinned boolean default false,
  collection_id uuid null references public.collections(id) on delete set null,
  notes text,
  launch_count integer default 0,
  last_opened_at timestamptz null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  content text not null,
  source_url text,
  tags text[] default '{}',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  system_id uuid null references public.workspace_systems(id) on delete set null,
  action text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_workspace_systems_updated_at on public.workspace_systems;
create trigger update_workspace_systems_updated_at
before update on public.workspace_systems
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_collections_updated_at on public.collections;
create trigger update_collections_updated_at
before update on public.collections
for each row
execute function public.update_updated_at_column();

alter table public.workspace_systems disable row level security;
alter table public.collections disable row level security;
alter table public.insights disable row level security;
alter table public.activity_logs disable row level security;

