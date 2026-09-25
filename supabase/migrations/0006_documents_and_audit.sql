-- Documents attached to an employee and/or a specific lifecycle stage
-- (a signed offer letter, an exit-interview form), pointing at Supabase
-- Storage object keys. `storage_path` is the path within the bucket,
-- not a signed URL — generate those on read.
create table documents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  stage_id uuid references lifecycle_stages(id) on delete set null,
  bucket text not null default 'employee-documents',
  storage_path text not null,
  file_name text not null,
  uploaded_by uuid references employees(id),
  created_at timestamptz not null default now()
);

create index documents_employee_id_idx on documents(employee_id);

-- Who changed what, when — required for GDPR accountability regardless
-- of which backend eventually writes it (Supabase now, Laravel later).
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action text not null check (action in ('insert', 'update', 'delete')),
  changed_by uuid references employees(id),
  changed_at timestamptz not null default now(),
  diff jsonb
);

create index audit_log_table_record_idx on audit_log(table_name, record_id);
