-- Row Level Security. Written from one access matrix so it stays in
-- sync with the equivalent Laravel Policies in Phase 2 (roadmap §7):
-- an employee sees their own record; a manager sees their direct
-- reports; an HR admin sees everyone.

alter table employees add column app_role text not null default 'employee'
  check (app_role in ('employee', 'hr_admin'));

-- Employees who can log in have id = auth.uid(); rows without a login
-- yet (e.g. pre-boarding, before an account exists) simply have no
-- matching auth.uid() and are only visible to hr_admin/manager.

create or replace function is_hr_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from employees
    where id = auth.uid() and app_role = 'hr_admin'
  );
$$;

alter table employees enable row level security;
alter table employment_history enable row level security;
alter table lifecycle_stages enable row level security;
alter table lifecycle_stage_approvals enable row level security;
alter table documents enable row level security;
alter table audit_log enable row level security;

create policy employees_select on employees for select
  using (
    id = auth.uid()
    or manager_id = auth.uid()
    or is_hr_admin()
  );

create policy employees_update_self on employees for update
  using (id = auth.uid() or is_hr_admin())
  with check (id = auth.uid() or is_hr_admin());

create policy employment_history_select on employment_history for select
  using (
    exists (
      select 1 from employees e
      where e.id = employment_history.employee_id
        and (e.id = auth.uid() or e.manager_id = auth.uid() or is_hr_admin())
    )
  );

create policy lifecycle_stages_select on lifecycle_stages for select
  using (
    exists (
      select 1 from employees e
      where e.id = lifecycle_stages.employee_id
        and (e.id = auth.uid() or e.manager_id = auth.uid() or is_hr_admin())
    )
  );

create policy lifecycle_stage_approvals_select on lifecycle_stage_approvals for select
  using (
    approver_employee_id = auth.uid() or is_hr_admin()
  );

create policy lifecycle_stage_approvals_update on lifecycle_stage_approvals for update
  using (approver_employee_id = auth.uid() or is_hr_admin())
  with check (approver_employee_id = auth.uid() or is_hr_admin());

create policy documents_select on documents for select
  using (
    exists (
      select 1 from employees e
      where e.id = documents.employee_id
        and (e.id = auth.uid() or e.manager_id = auth.uid() or is_hr_admin())
    )
  );

create policy audit_log_select on audit_log for select
  using (is_hr_admin());
