-- Now that lifecycle_stages exists, constrain employees.current_stage_id.
alter table employees
  add constraint employees_current_stage_id_fkey
  foreign key (current_stage_id) references lifecycle_stages(id) on delete set null;
