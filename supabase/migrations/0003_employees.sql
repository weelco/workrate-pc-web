-- Core employee record. `id` matches auth.users.id for employees who can
-- log in to their own self-service view (Sanctum/Supabase Auth subject);
-- not every row needs a matching auth user on day one.
create type employee_status as enum (
  'onboarding',
  'active',
  'on_leave',
  'offboarding',
  'terminated'
);

-- v1 phases only: Attract (recruitment) is a later module, not built here.
create type lifecycle_phase_key as enum ('onboard', 'grow', 'exit');

create table employees (
  id uuid primary key default gen_random_uuid(),
  employee_number text not null unique,
  name text not null,
  work_email text unique,
  role text not null,
  site_id uuid not null references sites(id) on delete restrict,
  manager_id uuid references employees(id) on delete set null,
  status employee_status not null default 'onboarding',
  current_phase_key lifecycle_phase_key not null default 'onboard',
  -- FK to lifecycle_stages added in 0005, once that table exists.
  current_stage_id uuid,
  started_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index employees_site_id_idx on employees(site_id);
create index employees_manager_id_idx on employees(manager_id);

-- Append-only history of role/department/manager/salary changes, so a
-- Grow-phase mutation is auditable rather than an overwritten column.
create table employment_history (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  role text,
  site_id uuid references sites(id),
  manager_id uuid references employees(id),
  effective_from date not null,
  effective_to date,
  reason text,
  created_at timestamptz not null default now()
);

create index employment_history_employee_id_idx on employment_history(employee_id);
