import { createSupabaseServerClient } from "@/lib/supabase/server";

// One page, run right after a deploy, that checks the same classes of
// bug that cost real debugging time getting this app to production: a
// mistyped project ref, a service-role key accidentally made public,
// a migration that didn't apply, RLS silently disabled, nobody left
// as HR admin. Every check here maps to something that actually broke
// at some point while building this app.

export type CheckSeverity = "error" | "warning" | "ok";

export interface CheckResult {
  id: string;
  label: string;
  severity: CheckSeverity;
  detail: string;
}

export interface SystemCheckReport {
  generatedAt: string;
  configured: boolean;
  results: CheckResult[];
}

const RLS_TABLES = [
  "employees",
  "employment_history",
  "lifecycle_stages",
  "lifecycle_stage_approvals",
  "documents",
  "audit_log",
  "admin_users",
] as const;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function projectRefFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

export async function runSystemCheck(): Promise<SystemCheckReport> {
  const results: CheckResult[] = [];
  const generatedAt = new Date().toISOString();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. The env vars have to be there at all.
  if (!url || !anonKey) {
    results.push({
      id: "env-vars",
      label: "Supabase environment variables",
      severity: "error",
      detail:
        !url && !anonKey
          ? "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are both unset — the app is running on demo data only."
          : !url
          ? "NEXT_PUBLIC_SUPABASE_URL is unset."
          : "NEXT_PUBLIC_SUPABASE_ANON_KEY is unset.",
    });
    return { generatedAt, configured: false, results };
  }
  results.push({
    id: "env-vars",
    label: "Supabase environment variables",
    severity: "ok",
    detail: "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are both set.",
  });

  // 2. The anon key has to actually decode, be role "anon", and point
  // at the same project as the URL — this exact mismatch (a one-
  // character typo in the project ref) previously took a full
  // debugging session to track down.
  const anonPayload = decodeJwtPayload(anonKey);
  const urlRef = projectRefFromUrl(url);

  if (!anonPayload) {
    results.push({
      id: "anon-key-format",
      label: "Anon key format",
      severity: "error",
      detail: "NEXT_PUBLIC_SUPABASE_ANON_KEY doesn't decode as a JWT — it may be truncated or pasted incorrectly.",
    });
  } else {
    const role = anonPayload.role as string | undefined;
    if (role !== "anon") {
      results.push({
        id: "anon-key-role",
        label: "Anon key role",
        severity: "error",
        detail: `NEXT_PUBLIC_SUPABASE_ANON_KEY decodes to role "${role ?? "unknown"}", not "anon" — a service-role or other secret key may have been pasted into this public env var by mistake.`,
      });
    } else {
      results.push({
        id: "anon-key-role",
        label: "Anon key role",
        severity: "ok",
        detail: "Anon key decodes to role \"anon\", as expected.",
      });
    }

    const keyRef = anonPayload.ref as string | undefined;
    if (urlRef && keyRef && keyRef !== urlRef) {
      results.push({
        id: "anon-key-ref-match",
        label: "Project ref match",
        severity: "error",
        detail: `The anon key's project ref ("${keyRef}") doesn't match NEXT_PUBLIC_SUPABASE_URL's ref ("${urlRef}") — this pair will fail to connect, or connect to the wrong project.`,
      });
    } else if (urlRef && keyRef) {
      results.push({
        id: "anon-key-ref-match",
        label: "Project ref match",
        severity: "ok",
        detail: `Anon key and URL both reference project "${urlRef}".`,
      });
    }
  }

  // 3. No public env var should ever decode to a service-role key —
  // that key bypasses RLS entirely and NEXT_PUBLIC_ ships it straight
  // to every visitor's browser.
  const leakedServiceRoleVars = Object.entries(process.env)
    .filter(([key]) => key.startsWith("NEXT_PUBLIC_") && typeof process.env[key] === "string")
    .map(([key, value]) => ({ key, payload: decodeJwtPayload(value as string) }))
    .filter(({ payload }) => payload?.role === "service_role");

  if (leakedServiceRoleVars.length > 0) {
    results.push({
      id: "no-leaked-service-role",
      label: "No service-role key in a public env var",
      severity: "error",
      detail: `${leakedServiceRoleVars.map((v) => v.key).join(", ")} decode(s) to role "service_role" — move this to a server-only env var immediately and rotate the key.`,
    });
  } else {
    results.push({
      id: "no-leaked-service-role",
      label: "No service-role key in a public env var",
      severity: "ok",
      detail: "No NEXT_PUBLIC_ variable decodes to a service-role key.",
    });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    results.push({
      id: "client-init",
      label: "Supabase client",
      severity: "error",
      detail: "The Supabase client failed to initialize despite the env vars being set.",
    });
    return { generatedAt, configured: false, results };
  }

  // 4. Everything past this point runs as a privileged RPC (schema
  // internals like RLS status aren't visible through a normal
  // PostgREST select), so the caller has to actually be signed in as
  // an HR admin.
  const { data: isAdmin, error: adminCheckError } = await supabase.rpc("am_i_admin");

  if (adminCheckError) {
    results.push({
      id: "admin-rpc",
      label: "Diagnostics RPC reachable",
      severity: "error",
      detail: `Calling am_i_admin() failed: ${adminCheckError.message}. Migration 0011_system_check.sql may not be applied to this project yet.`,
    });
    return { generatedAt, configured: true, results };
  }

  if (!isAdmin) {
    results.push({
      id: "admin-session",
      label: "Signed in as HR admin",
      severity: "error",
      detail: "You're not signed in as an HR admin, so the schema and data checks below can't run for you. Sign in with an admin account to see the full report.",
    });
    return { generatedAt, configured: true, results };
  }

  const { data: report, error: reportError } = await supabase.rpc("system_check_report");
  if (reportError || !report) {
    results.push({
      id: "system-check-report",
      label: "Schema & data checks",
      severity: "error",
      detail: `system_check_report() failed: ${reportError?.message ?? "no data returned"}.`,
    });
    return { generatedAt, configured: true, results };
  }

  const rlsStatus = (report as { rlsStatus?: Record<string, boolean> }).rlsStatus ?? {};
  for (const table of RLS_TABLES) {
    const enabled = rlsStatus[table];
    if (enabled === undefined) {
      results.push({
        id: `rls-${table}`,
        label: `Row Level Security — ${table}`,
        severity: "error",
        detail: `Table "${table}" wasn't found — a migration may be missing on this project.`,
      });
    } else if (!enabled) {
      results.push({
        id: `rls-${table}`,
        label: `Row Level Security — ${table}`,
        severity: "error",
        detail: `RLS is NOT enabled on "${table}" — depending on this project's default grants, it may be directly readable or writable by anyone.`,
      });
    } else {
      results.push({
        id: `rls-${table}`,
        label: `Row Level Security — ${table}`,
        severity: "ok",
        detail: "Enabled.",
      });
    }
  }

  const adminCount = (report as { adminCount?: number }).adminCount ?? 0;
  if (adminCount === 0) {
    results.push({
      id: "admin-count",
      label: "HR admin configured",
      severity: "error",
      detail: "admin_users is empty — nobody can manage this app. Add at least one admin via a migration or the Supabase table editor.",
    });
  } else {
    results.push({
      id: "admin-count",
      label: "HR admin configured",
      severity: "ok",
      detail: `${adminCount} admin${adminCount === 1 ? "" : "s"} configured.`,
    });
  }

  const missingEmail = (report as { employeesMissingWorkEmail?: number }).employeesMissingWorkEmail ?? 0;
  if (missingEmail > 0) {
    results.push({
      id: "employees-missing-email",
      label: "Employees can sign in",
      severity: "warning",
      detail: `${missingEmail} employee record(s) have no work_email set, so they can't sign in — access is matched by email.`,
    });
  } else {
    results.push({
      id: "employees-missing-email",
      label: "Employees can sign in",
      severity: "ok",
      detail: "Every employee record has a work_email set.",
    });
  }

  const selfManaged = (report as { selfManagedEmployees?: number }).selfManagedEmployees ?? 0;
  if (selfManaged > 0) {
    results.push({
      id: "self-managed-employees",
      label: "No employee is their own manager",
      severity: "warning",
      detail: `${selfManaged} employee record(s) have manager_id pointing at themselves — likely a data-entry mistake.`,
    });
  } else {
    results.push({
      id: "self-managed-employees",
      label: "No employee is their own manager",
      severity: "ok",
      detail: "No self-referencing manager records found.",
    });
  }

  return { generatedAt, configured: true, results };
}
