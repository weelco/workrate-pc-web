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
}

export interface EmployeeLifecycle {
  employee: Employee;
  phases: LifecyclePhase[];
}
