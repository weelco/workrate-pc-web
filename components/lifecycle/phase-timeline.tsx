import { cn } from "@/lib/utils";
import type { LifecyclePhase } from "@/lib/types";
import { StageStatusBadge } from "./stage-status-badge";

const PHASE_DOT: Record<string, string> = {
  onboard: "bg-success",
  grow: "bg-warning",
  exit: "bg-neutral-phase",
};

// Mirrors the "Lifecycle journey" panel from Workrate's Employee
// Lifecycle product screenshot: phases grouped as sections, each with
// an ordered list of stages, the current stage highlighted.
export function PhaseTimeline({
  phases,
  currentStageId,
}: {
  phases: LifecyclePhase[];
  currentStageId: string | null;
}) {
  return (
    <div className="space-y-6">
      {phases.map((phase) => {
        const doneCount = phase.stages.filter((s) => s.status === "done").length;
        return (
          <div key={phase.key}>
            <div className="mb-2 flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", PHASE_DOT[phase.key] ?? "bg-neutral-phase")} />
              <span className="text-eyebrow font-semibold uppercase tracking-wide text-ink-muted text-[11px]">
                {phase.name}
              </span>
              <span className="text-xs text-ink-muted">
                {doneCount}/{phase.stages.length}
              </span>
            </div>
            <ol className="ml-1 space-y-3 border-l border-border pl-4">
              {phase.stages.map((stage) => (
                <li
                  key={stage.id}
                  className={cn(
                    "rounded-md p-3",
                    stage.id === currentStageId && "bg-warning-surface"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{stage.name}</p>
                      {stage.description && (
                        <p className="text-xs text-ink-muted">{stage.description}</p>
                      )}
                      {(stage.ownerName || stage.date) && (
                        <p className="mt-1 text-xs text-ink-muted">
                          {stage.ownerName}
                          {stage.ownerName && stage.date ? " · " : ""}
                          {stage.date}
                        </p>
                      )}
                    </div>
                    <StageStatusBadge status={stage.status} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
