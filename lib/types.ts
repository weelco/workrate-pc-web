// Mirrors the v1 schema in supabase/migrations. Keep in sync with the
// "lifecycle-phase engine" section of the architecture roadmap doc.

export type StageStatus = "done" | "in_progress" | "upcoming";

export type PhaseKey = "onboard" | "grow" | "exit";
// "attract" exists in the product's long-term design (recruitment) but
// is explicitly out of scope for v1 — see the roadmap doc §8.

export interface LifecycleStage {
  id: string;
  phaseKey: PhaseKey;
  order: number;
  name: string;
  description: string | null;
  status: StageStatus;
  ownerName: string | null;
  ownerRole: string | null;
  date: string | null; // completed date, or target date for upcoming stages
  taskProgress: { done: number; total: number } | null;
}

export interface LifecyclePhase {
  key: PhaseKey;
  name: string;
  order: number;
  stages: LifecycleStage[];
}

export interface Site {
  id: string;
  name: string;
  businessUnit: string;
}

export type Gender = "female" | "male" | "non_binary" | "prefer_not_to_say";

export type EmploymentType = "full_time" | "part_time" | "contractor" | "temporary";

export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  initials: string;
  role: string;
  site: Site;
  status: "onboarding" | "active" | "on_leave" | "offboarding" | "terminated";
  currentPhaseKey: PhaseKey;
  currentStageId: string | null;
  startedAt: string;
  manager: string | null;
  gender: Gender | null;
  phone: string | null;
  department: string | null;
  employmentType: EmploymentType;
  workEmail: string | null;

  // Name detail (Dutch naming convention splits these out; `name` above
  // stays the single display string used everywhere else in the app —
  // list rows, the record header, avatar initials).
  preferredName: string | null;
  firstNames: string | null;
  lastName: string | null;
  namePrefix: string | null;
  legalInitials: string | null;

  // Address
  street: string | null;
  houseNumber: string | null;
  houseNumberAddition: string | null;
  postalCode: string | null;
  city: string | null;

  // Personal
  dateOfBirth: string | null;
  placeOfBirth: string | null;
  maritalStatus: string | null;
  landlinePhone: string | null;

  // Education / mobility
  inEducation: boolean;
  educationCompleted: boolean;
  hasDriversLicense: boolean;
  hasCar: boolean;

  // Work preference & studies
  workPreference: string | null;
  studies: string | null;

  // Medical — special-category GDPR data. Only ever rendered on this
  // one record's Overview tab, gated by the same RLS as the rest of
  // `employees` (self or HR admin); never included in a list, export,
  // or report.
  gpName: string | null;
  gpPhone: string | null;
  allergy: string | null;
  illness: string | null;
  medication: string | null;

  // Operational note: sites/clients this person should not be assigned
  // to. Not a criminal-record field.
  warningAddresses: string | null;
}

export interface EmployeeLifecycle {
  employee: Employee;
  phases: LifecyclePhase[];
}
