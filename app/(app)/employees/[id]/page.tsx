import { notFound } from "next/navigation";
import { getEmployeeLifecycle } from "@/lib/api/lifecycle";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demoLifecycle } from "@/lib/data/demo";
import { SignInPrompt } from "@/components/auth/sign-in-prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PhaseTimeline } from "@/components/lifecycle/phase-timeline";
import { PhaseProgress } from "@/components/lifecycle/phase-progress";

export default async function EmployeeLifecyclePage({ params }: { params: { id: string } }) {
  // Same auth gate as the employees list, except the demo record stays
  // reachable unauthenticated (it never touches Supabase either way).
  const supabase = createSupabaseServerClient();
  if (supabase && params.id !== demoLifecycle.employee.id) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return <SignInPrompt />;
  }

  const lifecycle = await getEmployeeLifecycle(params.id);
  if (!lifecycle) notFound();

  const { employee, phases } = lifecycle;
  const currentPhase = phases.find((p) => p.key === employee.currentPhaseKey);
  const currentStage = currentPhase?.stages.find((s) => s.id === employee.currentStageId);
  const daysInJourney = Math.max(
    0,
    Math.round((Date.now() - new Date(employee.startedAt).getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-info-surface text-base font-semibold text-brand">
            {employee.initials}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-record-name text-xl font-bold text-ink">{employee.name}</h1>
              <Badge variant="warning">In progress</Badge>
            </div>
            <p className="text-sm text-ink-muted">
              {employee.role} · {employee.site.name} · {employee.site.businessUnit} · {employee.employeeNumber}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="lifecycle" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="lifecycle">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Lifecycle journey</CardTitle>
                <p className="text-xs text-ink-muted">Every step and owner, grouped by phase</p>
              </CardHeader>
              <CardContent>
                <PhaseTimeline phases={phases} currentStageId={employee.currentStageId} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              {currentStage && (
                <Card className="border-warning bg-warning-surface">
                  <CardContent className="p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-warning">
                      You are here
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ink">{currentStage.name}</p>
                    <p className="text-xs text-ink-muted">
                      {currentPhase?.name} phase{currentStage.description ? ` · ${currentStage.description}` : ""}
                    </p>
                    {currentStage.taskProgress && (
                      <p className="mt-2 text-xs text-ink-muted">
                        Stage tasks: {currentStage.taskProgress.done} of {currentStage.taskProgress.total}
                      </p>
                    )}
                    {currentStage.ownerName && (
                      <p className="mt-1 text-xs font-medium text-ink">{currentStage.ownerName} · owner</p>
                    )}
                  </CardContent>
                </Card>
              )}

              <PhaseProgress phases={phases} currentPhaseKey={employee.currentPhaseKey} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-[11px] uppercase tracking-wide text-ink-muted">Record</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <Row label="Started" value={employee.startedAt} />
                  <Row label="Manager" value={employee.manager ?? "—"} />
                  <Row label="Site" value={employee.site.name} />
                  <Row label="Days in journey" value={String(daysInJourney)} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview">
          <p className="text-sm text-ink-muted">Overview tab — not built yet.</p>
        </TabsContent>
        <TabsContent value="documents">
          <p className="text-sm text-ink-muted">Documents tab — not built yet.</p>
        </TabsContent>
        <TabsContent value="activity">
          <p className="text-sm text-ink-muted">Activity tab — not built yet.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
