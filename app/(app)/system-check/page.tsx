import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runSystemCheck } from "@/lib/api/system-check";
import { SignInPrompt } from "@/components/auth/sign-in-prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CheckResult, CheckSeverity } from "@/lib/api/system-check";

export default async function SystemCheckPage() {
  // Same auth gate as the rest of the app. Once signed in, even a
  // non-admin can open this page — runSystemCheck() itself explains
  // that the deeper checks need an HR admin account, rather than the
  // page hiding that there's anything here at all.
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return <SignInPrompt />;
  }

  const report = await runSystemCheck();
  const errors = report.results.filter((r) => r.severity === "error");
  const warnings = report.results.filter((r) => r.severity === "warning");
  const passing = report.results.filter((r) => r.severity === "ok");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-page-title text-2xl font-semibold text-ink">System check</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Mandatory checks to run after a deploy, before pointing real users at it.
      </p>

      <Card className="mt-6">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Badge variant={errors.length > 0 ? "danger" : warnings.length > 0 ? "warning" : "success"}>
              {errors.length > 0
                ? "Not ready to deploy"
                : warnings.length > 0
                ? "Ready, with warnings"
                : "All checks passed"}
            </Badge>
            <span className="text-xs text-ink-muted">
              {errors.length} error{errors.length === 1 ? "" : "s"} · {warnings.length} warning
              {warnings.length === 1 ? "" : "s"} · {passing.length} passing
            </span>
          </div>
          <span className="text-xs text-ink-muted">
            {new Date(report.generatedAt).toLocaleString()}
          </span>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <ResultGroup title="Errors — must fix before this deploy is used" results={errors} />
      )}
      {warnings.length > 0 && <ResultGroup title="Warnings — worth reviewing" results={warnings} />}
      {passing.length > 0 && <ResultGroup title="Passing" results={passing} collapsible />}
    </div>
  );
}

function ResultGroup({
  title,
  results,
  collapsible,
}: {
  title: string;
  results: CheckResult[];
  collapsible?: boolean;
}) {
  const list = (
    <div className="space-y-3">
      {results.map((result) => (
        <div key={result.id} className="flex items-start gap-3 text-xs">
          <Badge variant={severityVariant(result.severity)} className="mt-0.5 shrink-0">
            {result.severity}
          </Badge>
          <div>
            <p className="font-medium text-ink">{result.label}</p>
            <p className="text-ink-muted">{result.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );

  if (collapsible) {
    return (
      <Card className="mt-6">
        <CardContent className="p-4">
          <details>
            <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              {title} ({results.length})
            </summary>
            <div className="mt-3">{list}</div>
          </details>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-[11px] uppercase tracking-wide text-ink-muted">{title}</CardTitle>
      </CardHeader>
      <CardContent>{list}</CardContent>
    </Card>
  );
}

function severityVariant(severity: CheckSeverity): "danger" | "warning" | "success" {
  if (severity === "error") return "danger";
  if (severity === "warning") return "warning";
  return "success";
}
