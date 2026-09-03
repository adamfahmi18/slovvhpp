-- ============================================================================
-- Slovv HPP — Migration: Bahan Baku & Resep
-- Run this in the Supabase SQL editor AFTER schema.sql has already been run.
-- Adds real ingredient-level costing: raw materials with a price per unit,
-- and a recipe (bill of materials) per product. A product's raw material
-- cost is now computed from `sum(recipe quantity * material price)` instead
-- of being typed in by hand.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- raw_materials
-- The ingredient/material catalog (e.g. "Tepung Terigu", unit "kg", price
-- per kg). Priced per unit so recipes can multiply quantity × price.
-- ----------------------------------------------------------------------------
create table if not exists public.raw_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  name text not null,
  unit text not null default 'pcs',
  price_per_unit numeric(14, 2) not null default 0,
  stock_quantity numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists raw_materials_name_idx on public.raw_materials using gin (to_tsvector('simple', name));

-- ----------------------------------------------------------------------------
-- product_recipe_items
-- The recipe (bill of materials) for a product: which raw materials go into
-- one production batch, and how much of each. Deleting a product cascades
-- and removes its recipe; a raw material still referenced by a recipe can't
-- be deleted (restrict) so costs never silently go stale.
-- ----------------------------------------------------------------------------
create table if not exists public.product_recipe_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  raw_material_id uuid not null references public.raw_materials(id) on delete restrict,
  quantity numeric(14, 4) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_recipe_items_product_idx on public.product_recipe_items (product_id);
create index if not exists product_recipe_items_material_idx on public.product_recipe_items (raw_material_id);

-- ----------------------------------------------------------------------------
-- updated_at trigger (reuses public.set_updated_at() from schema.sql)
-- ----------------------------------------------------------------------------
drop trigger if exists set_raw_materials_updated_at on public.raw_materials;
create trigger set_raw_materials_updated_at
  before update on public.raw_materials
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- Same model as the rest of the app: all access goes through server actions
-- using the service role key, so RLS stays locked down with no policies.
-- ----------------------------------------------------------------------------
alter table public.raw_materials enable row level security;
alter table public.product_recipe_items enable row level security;
