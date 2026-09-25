import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LifecyclePhase, PhaseKey } from "@/lib/types";

const PHASE_BAR: Record<PhaseKey, string> = {
  onboard: "bg-success",
  grow: "bg-warning",
  exit: "bg-neutral-phase",
};

// Mirrors the "PHASE PROGRESS" sidebar card: one bar per phase, filled
// by stages-done / stages-total.
export function PhaseProgress({ phases, currentPhaseKey }: { phases: LifecyclePhase[]; currentPhaseKey: PhaseKey }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[11px] uppercase tracking-wide text-ink-muted">
          Phase progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {phases.map((phase) => {
          const done = phase.stages.filter((s) => s.status === "done").length;
          const total = phase.stages.length;
          const pct = total === 0 ? 0 : Math.round((done / total) * 100);
          const isActive = phase.key === currentPhaseKey;
          return (
            <div key={phase.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-ink">
                  {phase.name}
                  {isActive && <span className="ml-1 text-ink-muted">· active</span>}
                </span>
                <span className="text-ink-muted">
                  {done}/{total}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-sm bg-surface-sunken">
                <div
                  className={cn("h-1.5 rounded-sm", PHASE_BAR[phase.key])}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
