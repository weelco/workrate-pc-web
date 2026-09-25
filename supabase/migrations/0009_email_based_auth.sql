-- Move access control from matching a hand-seeded employees.id against
-- Supabase Auth's randomly-generated auth.uid() (which can never
-- coincide for anyone signing in via a real IdP) to matching by email —
-- the claim both Entra ID and Supabase Auth actually hand us on login,
-- and the natural key HR already uses to identify people.

-- Admins are looked up by email rather than requiring an employees row:
-- whoever is administering this app isn't necessarily a site-assigned
-- employee record yet, especially this early on.
create table admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

-- Seed the person setting this up as the first admin. Add teammates via
-- the Supabase dashboard's table editor, or a follow-up migration.
insert into admin_users (email) values ('ewiertsema@workrate.eu');

create or replace function current_employee_id()
returns uuid
language sql
security definer
stable
as $$
  select id from employees where work_email = auth.jwt() ->> 'email';
$$;

create or replace function is_hr_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admin_users where email = auth.jwt() ->> 'email'
  );
$$;

-- Replace every auth.uid()-based policy from 0007 with the email-based
-- equivalent. is_hr_admin() itself was redefined above in place, so
-- audit_log_select (which only calls is_hr_admin()) needs no change.
drop policy employees_select on employees;
create policy employees_select on employees for select
  using (
    id = current_employee_id()
    or manager_id = current_employee_id()
    or is_hr_admin()
  );

drop policy employees_update_self on employees;
create policy employees_update_self on employees for update
  using (id = current_employee_id() or is_hr_admin())
  with check (id = current_employee_id() or is_hr_admin());

drop policy employment_history_select on employment_history;
create policy employment_history_select on employment_history for select
  using (
    exists (
      select 1 from employees e
      where e.id = employment_history.employee_id
        and (e.id = current_employee_id() or e.manager_id = current_employee_id() or is_hr_admin())
    )
  );

drop policy lifecycle_stages_select on lifecycle_stages;
create policy lifecycle_stages_select on lifecycle_stages for select
  using (
    exists (
      select 1 from employees e
      where e.id = lifecycle_stages.employee_id
        and (e.id = current_employee_id() or e.manager_id = current_employee_id() or is_hr_admin())
    )
  );

drop policy lifecycle_stage_approvals_select on lifecycle_stage_approvals;
create policy lifecycle_stage_approvals_select on lifecycle_stage_approvals for select
  using (
    approver_employee_id = current_employee_id() or is_hr_admin()
  );

drop policy lifecycle_stage_approvals_update on lifecycle_stage_approvals;
create policy lifecycle_stage_approvals_update on lifecycle_stage_approvals for update
  using (approver_employee_id = current_employee_id() or is_hr_admin())
  with check (approver_employee_id = current_employee_id() or is_hr_admin());

drop policy documents_select on documents;
create policy documents_select on documents for select
  using (
    exists (
      select 1 from employees e
      where e.id = documents.employee_id
        and (e.id = current_employee_id() or e.manager_id = current_employee_id() or is_hr_admin())
    )
  );

-- Give the seed record a work email so self/manager visibility is
-- testable too, once someone signs in as marcus.reyes@workrate.eu.
update employees
set work_email = 'marcus.reyes@workrate.eu'
where id = '00000000-0000-0000-0000-000000000003';
