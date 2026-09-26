-- Diagnostics surface for the new System Check page. Two RPCs, both
-- admin-gated inside the function body (not just by the caller's
-- session) so a non-admin caller gets a clear "not authorized" error
-- rather than an empty or misleading result:
--
--   am_i_admin()          — lets the app decide whether to show the
--                            System Check nav link / page at all.
--   system_check_report() — the actual schema/data sanity checks that
--                            can't be answered through a normal
--                            PostgREST select (RLS status lives in
--                            pg_catalog, which isn't exposed as a
--                            table).
--
-- Also closes a real gap found while building this: admin_users had no
-- Row Level Security, so — depending on the project's default table
-- grants — it could have been directly readable/writable by anyone
-- through the REST API. It's now locked down the same way employees
-- and the other tables already are; the security-definer functions
-- above (and is_hr_admin()/current_employee_id() from 0009) still work
-- because they execute as the function owner, same pattern already in
-- use since 0007.
alter table admin_users enable row level security;

create or replace function am_i_admin()
returns boolean
language sql
security definer
stable
as $$
  select is_hr_admin();
$$;

create or replace function system_check_report()
returns jsonb
language plpgsql
security definer
stable
as $$
declare
  rls_status jsonb;
  admin_count integer;
  employees_missing_email integer;
  self_managed_employees integer;
begin
  if not is_hr_admin() then
    raise exception 'not authorized';
  end if;

  select coalesce(jsonb_object_agg(c.relname, c.relrowsecurity), '{}'::jsonb)
    into rls_status
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (
      'employees', 'employment_history', 'lifecycle_stages',
      'lifecycle_stage_approvals', 'documents', 'audit_log', 'admin_users'
    );

  select count(*) into admin_count from admin_users;
  select count(*) into employees_missing_email from employees where work_email is null;
  select count(*) into self_managed_employees from employees where id = manager_id;

  return jsonb_build_object(
    'rlsStatus', rls_status,
    'adminCount', admin_count,
    'employeesMissingWorkEmail', employees_missing_email,
    'selfManagedEmployees', self_managed_employees
  );
end;
$$;
