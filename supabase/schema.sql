-- ============================================================================
-- Slovv HPP — Database Schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- users
-- Admin accounts are created directly in this table (no self sign-up).
-- Password is stored as a bcrypt hash — hash it before inserting, e.g.:
--   select crypt('yourpassword', gen_salt('bf'));
-- ----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  full_name text not null default '',
  role text not null default 'admin' check (role in ('admin', 'staff')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  name text not null,
  category text not null default 'Umum',
  sku text,
  raw_material_cost numeric(14, 2) not null default 0,
  packaging_cost numeric(14, 2) not null default 0,
  labor_cost numeric(14, 2) not null default 0,
  utility_cost numeric(14, 2) not null default 0,
  operational_cost numeric(14, 2) not null default 0,
  additional_cost numeric(14, 2) not null default 0,
  quantity_produced integer not null default 1,
  total_cost numeric(14, 2) not null default 0,
  cost_per_item numeric(14, 2) not null default 0,
  margin_percent numeric(6, 2) not null default 30,
  selling_price numeric(14, 2) not null default 0,
  profit_per_item numeric(14, 2) not null default 0,
  units_sold integer not null default 0,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_name_idx on public.products using gin (to_tsvector('simple', name));
create index if not exists products_category_idx on public.products (category);
create index if not exists products_status_idx on public.products (status);

-- ----------------------------------------------------------------------------
-- calculations
-- History of every HPP calculation run from the calculator, linked to a
-- product once saved.
-- ----------------------------------------------------------------------------
create table if not exists public.calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  raw_material_cost numeric(14, 2) not null default 0,
  packaging_cost numeric(14, 2) not null default 0,
  labor_cost numeric(14, 2) not null default 0,
  utility_cost numeric(14, 2) not null default 0,
  operational_cost numeric(14, 2) not null default 0,
  additional_cost numeric(14, 2) not null default 0,
  quantity_produced integer not null default 1,
  margin_percent numeric(6, 2) not null default 30,
  total_cost numeric(14, 2) not null default 0,
  cost_per_item numeric(14, 2) not null default 0,
  selling_price numeric(14, 2) not null default 0,
  profit_per_item numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists calculations_created_at_idx on public.calculations (created_at desc);

-- ----------------------------------------------------------------------------
-- reports
-- Pre-aggregated period snapshots (daily/weekly/monthly/yearly) so the
-- Reports page can render quickly and be exported.
-- ----------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  period_type text not null check (period_type in ('daily', 'weekly', 'monthly', 'yearly')),
  period_start date not null,
  period_end date not null,
  total_revenue numeric(14, 2) not null default 0,
  total_cost numeric(14, 2) not null default 0,
  total_profit numeric(14, 2) not null default 0,
  average_margin numeric(6, 2) not null default 0,
  units_sold integer not null default 0,
  product_count integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists reports_period_unique on public.reports (period_type, period_start);

-- ----------------------------------------------------------------------------
-- analytics
-- Daily rollups used to power the Analytics charts (revenue trend, profit
-- trend, cost breakdown, product performance).
-- ----------------------------------------------------------------------------
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  revenue numeric(14, 2) not null default 0,
  cost numeric(14, 2) not null default 0,
  profit numeric(14, 2) not null default 0,
  raw_material_cost numeric(14, 2) not null default 0,
  packaging_cost numeric(14, 2) not null default 0,
  labor_cost numeric(14, 2) not null default 0,
  utility_cost numeric(14, 2) not null default 0,
  operational_cost numeric(14, 2) not null default 0,
  top_product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists analytics_date_idx on public.analytics (date desc);

-- ----------------------------------------------------------------------------
-- app_settings
-- Single-row table backing the "System Settings" section of the Settings
-- page. Not one of the 5 core tables in the brief, but included since the
-- System Settings feature needs somewhere durable to live.
-- ----------------------------------------------------------------------------
create table if not exists public.app_settings (
  id boolean primary key default true,
  company_name text not null default 'Bisnis Saya',
  default_margin_percent numeric(6, 2) not null default 30,
  currency text not null default 'IDR',
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id)
);

insert into public.app_settings (id) values (true) on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists set_app_settings_updated_at on public.app_settings;
create trigger set_app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- The app authenticates with its own username/password session (not
-- Supabase Auth) and talks to Supabase using the service role key on the
-- server only, so RLS stays locked down by default and the anon key is
-- never granted write access.
-- ----------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.calculations enable row level security;
alter table public.reports enable row level security;
alter table public.analytics enable row level security;
alter table public.app_settings enable row level security;

-- No policies are created for the anon/authenticated roles: every read and
-- write goes through Next.js server actions / route handlers using the
-- service role key, which bypasses RLS by design.

-- ----------------------------------------------------------------------------
-- Seed an initial admin user.
-- Replace 'change-this-password' before running, or update it right after.
-- ----------------------------------------------------------------------------
insert into public.users (username, password_hash, full_name, role)
values (
  'admin',
  crypt('change-this-password', gen_salt('bf')),
  'Admin Slovv',
  'admin'
)
on conflict (username) do nothing;
