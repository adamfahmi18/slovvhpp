-- ============================================================================
-- Slovv HPP — Optional sample data
-- Run this after schema.sql if you want the Dashboard, Reports and Analytics
-- pages to show something on first login instead of empty states.
-- Safe to skip entirely in production.
-- ============================================================================

-- Sample products -------------------------------------------------------
insert into public.products (
  name, category, sku, raw_material_cost, packaging_cost, labor_cost,
  utility_cost, operational_cost, additional_cost, quantity_produced,
  margin_percent, total_cost, cost_per_item, selling_price, profit_per_item,
  units_sold, status
) values
  ('Kopi Susu 250ml', 'Minuman', 'KS-250', 1200000, 300000, 500000, 150000, 200000, 50000, 200, 35,
   2400000, 12000, 18461, 6461, 640, 'active'),
  ('Roti Sobek Coklat', 'Roti', 'RS-CHO', 900000, 150000, 400000, 100000, 120000, 30000, 150, 30,
   1700000, 11333, 16190, 4857, 410, 'active'),
  ('Keripik Singkong 100g', 'Snack', 'KR-SNG', 500000, 200000, 250000, 80000, 90000, 20000, 300, 40,
   1140000, 3800, 6333, 2533, 980, 'active'),
  ('Sambal Botol 200ml', 'Bumbu', 'SB-200', 700000, 250000, 300000, 60000, 100000, 40000, 180, 32,
   1450000, 8056, 11847, 3791, 265, 'active'),
  ('Es Teh Kemasan 350ml', 'Minuman', 'ET-350', 400000, 180000, 220000, 70000, 80000, 15000, 250, 45,
   965000, 3860, 7018, 3158, 120, 'archived')
on conflict do nothing;

-- Sample analytics rollups: last 60 days ---------------------------------
insert into public.analytics (date, revenue, cost, profit, raw_material_cost, packaging_cost, labor_cost, utility_cost, operational_cost, overhead_cost)
select
  d::date as date,
  round((3500000 + random() * 2500000)::numeric, 0) as revenue,
  round((2000000 + random() * 1200000)::numeric, 0) as cost,
  0 as profit, -- filled in below
  round((800000 + random() * 400000)::numeric, 0) as raw_material_cost,
  round((250000 + random() * 150000)::numeric, 0) as packaging_cost,
  round((400000 + random() * 200000)::numeric, 0) as labor_cost,
  round((100000 + random() * 60000)::numeric, 0) as utility_cost,
  round((150000 + random() * 80000)::numeric, 0) as operational_cost,
  round((120000 + random() * 60000)::numeric, 0) as overhead_cost
from generate_series(current_date - interval '59 days', current_date, interval '1 day') as d
on conflict (date) do nothing;

update public.analytics set profit = revenue - cost where profit = 0;

-- Sample overhead costs (requires 03_overhead.sql to have been run) -----
insert into public.overhead_costs (name, amount) values
  ('Sewa Tempat', 3000000),
  ('Gaji Karyawan', 4500000),
  ('Listrik & Air', 800000),
  ('Internet & Langganan', 300000)
on conflict do nothing;

update public.app_settings set estimated_monthly_production = 2000 where id = true;

-- Sample raw materials + a recipe for "Kopi Susu 250ml" ------------------
insert into public.raw_materials (name, unit, price_per_unit, stock_quantity) values
  ('Kopi Bubuk', 'gram', 350, 5000),
  ('Susu Cair', 'ml', 18, 20000),
  ('Gula Cair', 'ml', 12, 10000),
  ('Cup Plastik 250ml', 'pcs', 800, 1000)
on conflict do nothing;

insert into public.product_recipe_items (product_id, raw_material_id, quantity)
select p.id, m.id, v.quantity
from (values
  ('Kopi Susu 250ml', 'Kopi Bubuk', 20),
  ('Kopi Susu 250ml', 'Susu Cair', 150),
  ('Kopi Susu 250ml', 'Gula Cair', 30),
  ('Kopi Susu 250ml', 'Cup Plastik 250ml', 1)
) as v(product_name, material_name, quantity)
join public.products p on p.name = v.product_name
join public.raw_materials m on m.name = v.material_name
on conflict do nothing;
