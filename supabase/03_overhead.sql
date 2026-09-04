-- ============================================================================
-- Slovv HPP — Migration: Biaya Overhead
-- Run this in the Supabase SQL editor AFTER schema.sql and 02_bahan_baku.sql
-- have already been run.
--
-- Adds fixed monthly overhead costs (sewa, gaji, listrik, dll) and an
-- estimated monthly production volume. Overhead per unit is computed as
-- `sum(overhead_costs.amount) / app_settings.estimated_monthly_production`
-- and is allocated automatically into every HPP calculation (Kalkulator &
-- Produk), the same way a product's raw material cost is derived from its
-- recipe instead of being typed in by hand.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- overhead_costs
-- One row per fixed monthly cost item (e.g. "Sewa Tempat", "Gaji Karyawan",
-- "Listrik & Air"). Summed together this is the business's total monthly
-- overhead.
-- ----------------------------------------------------------------------------
create table if not exists public.overhead_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  name text not null,
  amount numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists overhead_costs_created_at_idx on public.overhead_costs (created_at desc);

drop trigger if exists set_overhead_costs_updated_at on public.overhead_costs;
create trigger set_overhead_costs_updated_at
  before update on public.overhead_costs
  for each row execute function public.set_updated_at();

alter table public.overhead_costs enable row level security;

-- ----------------------------------------------------------------------------
-- app_settings.estimated_monthly_production
-- The estimated number of units produced per month across the business,
-- used as the divisor when allocating total overhead into a per-unit cost.
-- ----------------------------------------------------------------------------
alter table public.app_settings
  add column if not exists estimated_monthly_production numeric(14, 2) not null default 100;

-- ----------------------------------------------------------------------------
-- overhead_cost columns
-- Every place a product's cost is computed/persisted also stores the
-- overhead allocation that was applied at the time, so history stays
-- accurate even if overhead costs or the production estimate change later.
-- ----------------------------------------------------------------------------
alter table public.products
  add column if not exists overhead_cost numeric(14, 2) not null default 0;

alter table public.calculations
  add column if not exists overhead_cost numeric(14, 2) not null default 0;

alter table public.analytics
  add column if not exists overhead_cost numeric(14, 2) not null default 0;
