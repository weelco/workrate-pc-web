import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demoLifecycle, demoEmployeeList } from "@/lib/data/demo";
import type { Employee, EmployeeLifecycle, LifecyclePhase } from "@/lib/types";

// Every Supabase call in the app goes through this file (per the
// architecture roadmap doc §6 "API surface"). When Phase 2 swaps in the
// Laravel API, only this file's implementation changes — pages and
// components never call Supabase directly.

export async function getEmployees(): Promise<Employee[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return demoEmployeeList;

  // Note: `manager` and `site.businessUnit` are resolved via PostgREST
  // embeds over real foreign keys (manager_id -> employees.id,
  // sites.business_unit_id -> business_units.id) — the schema stores
  // ids, not denormalized name columns, so this can't be a flat select.
  const { data, error } = await supabase
    .from("employees")
    .select(
      "id, employee_number, name, role, status, current_phase_key, current_stage_id, started_at, manager:employees!manager_id(name), sites(id, name, business_units(name))"
    )
    .order("name");

  if (error || !data) return demoEmployeeList;

  return data.map((row: any) => ({
    id: row.id,
    employeeNumber: row.employee_number,
    name: row.name,
    initials: initials(row.name),
    role: row.role,
    site: {
      id: row.sites?.id ?? "",
      name: row.sites?.name ?? "",
      businessUnit: row.sites?.business_units?.name ?? "",
    },
    status: row.status,
    currentPhaseKey: row.current_phase_key,
    currentStageId: row.current_stage_id,
    startedAt: row.started_at,
    manager: row.manager?.name ?? null,
  }));
}

export async function getEmployeeLifecycle(employeeId: string): Promise<EmployeeLifecycle | null> {
  // The demo ID always resolves to the demo fixture, regardless of
  // whether Supabase is configured. This keeps this function in sync
  // with getEmployees(), which falls back to demo data whenever the
  // real `employees` query fails (e.g. before migrations are pushed) —
  // without this check, a demo ID would leak into a real Supabase query
  // against a uuid column and error out as "not found".
  if (employeeId === demoLifecycle.employee.id) return demoLifecycle;

  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const employees = await getEmployees();
  const employee = employees.find((e) => e.id === employeeId);
  if (!employee) return null;

  // lifecycle_stages has no phase_order column of its own (that lives
  // on the separate lifecycle_phases catalog table) — but phase_key is
  // a Postgres enum declared as ('onboard','grow','exit'), so ordering
  // by it directly already sorts in that declared order.
  const { data: stages, error } = await supabase
    .from("lifecycle_stages")
    .select("*")
    .eq("employee_id", employeeId)
    .order("phase_key", { ascending: true })
    .order("stage_order", { ascending: true });

  if (error || !stages) return null;

  const phaseOrder: Record<string, number> = { onboard: 1, grow: 2, exit: 3 };
  const phaseName: Record<string, string> = { onboard: "Onboard", grow: "Grow", exit: "Exit" };
  const phases = new Map<string, LifecyclePhase>();

  for (const row of stages as any[]) {
    const key = row.phase_key;
    if (!phases.has(key)) {
      phases.set(key, { key, name: phaseName[key] ?? key, order: phaseOrder[key] ?? 99, stages: [] });
    }
    phases.get(key)!.stages.push({
      id: row.id,
      phaseKey: key,
      order: row.stage_order,
      name: row.name,
      description: row.description,
      status: row.status,
      ownerName: row.owner_name,
      ownerRole: row.owner_role,
      date: row.date,
      taskProgress:
        row.task_done != null && row.task_total != null
          ? { done: row.task_done, total: row.task_total }
          : null,
    });
  }

  return {
    employee,
    phases: Array.from(phases.values()).sort((a, b) => a.order - b.order),
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
