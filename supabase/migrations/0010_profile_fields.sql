-- Core contact & role fields for the employee Overview tab, matching
-- the "Profiel" screen of the legacy system (minus its Jobs section,
-- which is a site/role assignment concern that belongs elsewhere).
-- Fields from that legacy system's "Administratief" tab — BSN, bank
-- details, passport, contracts, clothing sizes, certifications — are
-- deliberately deferred to a later sub-page rather than added here.

create type employee_gender as enum ('female', 'male', 'non_binary', 'prefer_not_to_say');
create type employment_kind as enum ('full_time', 'part_time', 'contractor', 'temporary');

alter table employees
  add column gender employee_gender,
  add column phone text,
  add column department text,
  add column employment_type employment_kind not null default 'full_time',
  -- Name detail (Dutch naming convention splits these out; `name` stays
  -- the single display string used everywhere else in the app — list
  -- rows, the record header, avatar initials).
  add column preferred_name text,
  add column first_names text,
  add column last_name text,
  add column name_prefix text,
  add column legal_initials text,
  -- Address
  add column street text,
  add column house_number text,
  add column house_number_addition text,
  add column postal_code text,
  add column city text,
  -- Personal
  add column date_of_birth date,
  add column place_of_birth text,
  add column marital_status text,
  add column landline_phone text,
  -- Education / mobility flags
  add column in_education boolean not null default false,
  add column education_completed boolean not null default false,
  add column has_drivers_license boolean not null default false,
  add column has_car boolean not null default false,
  -- Work preference & studies
  add column work_preference text,
  add column studies text,
  -- Medical — special-category data under GDPR (health data). Reachable
  -- only through the same `employees` row, so the existing RLS policies
  -- from 0009 already restrict it to the employee themselves or an HR
  -- admin; never exported or included in any report.
  add column gp_name text,
  add column gp_phone text,
  add column allergy text,
  add column illness text,
  add column medication text,
  -- Free-text operational note: sites/clients this person should not be
  -- assigned to. Not a criminal-record field.
  add column warning_addresses text;

-- Fill in the seed record so the Overview tab has something real to
-- show immediately, matching how work_email was backfilled in 0009.
-- Medical fields are left null, same as most real records — the
-- legacy system's own example record shows them blank too.
update employees
set
  gender = 'male',
  phone = '+31 6 1234 5678',
  department = 'Security Operations',
  employment_type = 'full_time',
  preferred_name = 'Marcus',
  first_names = 'Marcus Johan',
  last_name = 'Reyes',
  name_prefix = null,
  legal_initials = 'M.J.',
  street = 'Prins Hendrikkade',
  house_number = '108',
  house_number_addition = null,
  postal_code = '1011 AJ',
  city = 'Amsterdam',
  date_of_birth = '1994-06-12',
  place_of_birth = 'Rotterdam',
  marital_status = 'Married',
  landline_phone = null,
  in_education = false,
  education_completed = true,
  has_drivers_license = true,
  has_car = true,
  work_preference = 'Security Officer',
  studies = null
where id = '00000000-0000-0000-0000-000000000003';
