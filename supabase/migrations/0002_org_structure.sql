-- Multi-site org structure, confirmed in scope for v1 (Workrate operates
-- multiple sites under a business unit, e.g. "Workrate Amsterdam" ->
-- "AMS3 Enterprise") even though there's no UI to manage this yet.

create table business_units (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table sites (
  id uuid primary key default gen_random_uuid(),
  business_unit_id uuid not null references business_units(id) on delete restrict,
  name text not null,
  created_at timestamptz not null default now(),
  unique (business_unit_id, name)
);
