-- Seeds one realistic record (mirrors lib/data/demo.ts, based on the
-- "Marcus Reyes" example in Workrate's Employee Lifecycle deck) so the
-- app shows the same thing whether it's reading demo data or a real
-- Supabase project. Safe to delete once real data exists — remove this
-- file's effects with a follow-up migration rather than editing it.

insert into business_units (id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Workrate Amsterdam');

insert into sites (id, business_unit_id, name) values
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'AMS3 Enterprise');

insert into employees (
  id, employee_number, name, role, site_id, status, current_phase_key, started_at
) values (
  '00000000-0000-0000-0000-000000000003',
  'WRK-4821',
  'Marcus Reyes',
  'Security Officer',
  '00000000-0000-0000-0000-000000000002',
  'onboarding',
  'onboard',
  '2026-02-10'
);

insert into lifecycle_stages (
  employee_id, phase_key, stage_order, name, description, status, owner_name, owner_role, date, task_done, task_total
) values
  ('00000000-0000-0000-0000-000000000003', 'onboard', 1, 'Pre-boarding', 'Accounts, kit, badge provisioned', 'done', 'People Ops', null, '2026-02-03', null, null),
  ('00000000-0000-0000-0000-000000000003', 'onboard', 2, 'Day 1', 'Inducted, site orientation done', 'done', 'Mark de Groot', 'Manager', '2026-02-10', null, null),
  ('00000000-0000-0000-0000-000000000003', 'onboard', 3, 'Break-in training', 'Post & SOP sign-off underway', 'in_progress', 'Sarah Johnson', 'Owner', null, 3, 5),
  ('00000000-0000-0000-0000-000000000003', 'grow', 1, 'Active', 'Full duty roster', 'upcoming', 'Mark de Groot', null, '2026-03-02', null, null),
  ('00000000-0000-0000-0000-000000000003', 'grow', 2, 'Transfer / Promotion', 'Role & access changes', 'upcoming', 'Line manager', null, null, null, null),
  ('00000000-0000-0000-0000-000000000003', 'exit', 1, 'Notice', 'Resignation / end of contract', 'upcoming', null, null, null, null, null),
  ('00000000-0000-0000-0000-000000000003', 'exit', 2, 'Offboarding checklist', 'Access revoked, kit/badge returned, final pay closed', 'upcoming', 'People Ops', null, null, null, null);

update employees
set current_stage_id = (
  select id from lifecycle_stages
  where employee_id = '00000000-0000-0000-0000-000000000003' and phase_key = 'onboard' and stage_order = 3
)
where id = '00000000-0000-0000-0000-000000000003';
