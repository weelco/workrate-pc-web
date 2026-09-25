-- The phase -> stage engine (architecture roadmap doc §3 "The
-- lifecycle-phase engine"): onboarding, mutations, and offboarding are
-- all instances of the same two tables, not separate schemas.

create type lifecycle_stage_status as enum ('done', 'in_progress', 'upcoming');

-- Reference catalog of phases (v1: Onboard, Grow, Exit). Not per-employee.
create table lifecycle_phases (
  key lifecycle_phase_key primary key,
  name text not null,
  phase_order smallint not null unique
);

insert into lifecycle_phases (key, name, phase_order) values
  ('onboard', 'Onboard', 1),
  ('grow', 'Grow', 2),
  ('exit', 'Exit', 3);

-- One row per employee per stage they move through. A "mutation"
-- (transfer, promotion, manager/salary change) is just a Grow-phase
-- stage; offboarding is the Exit phase's stages.
create table lifecycle_stages (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  phase_key lifecycle_phase_key not null references lifecycle_phases(key),
  stage_order smallint not null,
  name text not null,
  description text,
  status lifecycle_stage_status not null default 'upcoming',
  owner_name text,
  owner_role text,
  -- Completed date for done stages, target date for upcoming ones.
  date date,
  task_done smallint,
  task_total smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, phase_key, stage_order)
);

create index lifecycle_stages_employee_id_idx on lifecycle_stages(employee_id);

-- Sign-off trail for a stage that needs approval (e.g. a Grow-phase
-- "Transfer / Promotion" stage) — this is the approval workflow engine
-- from the original domain-model note, generalized to attach to any
-- stage rather than a separate `mutations` table.
create table lifecycle_stage_approvals (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references lifecycle_stages(id) on delete cascade,
  approver_employee_id uuid references employees(id),
  decision text check (decision in ('pending', 'approved', 'rejected')) not null default 'pending',
  decided_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index lifecycle_stage_approvals_stage_id_idx on lifecycle_stage_approvals(stage_id);
