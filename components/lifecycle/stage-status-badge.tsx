import { Badge } from "@/components/ui/badge";
import type { StageStatus } from "@/lib/types";

const STATUS_LABEL: Record<StageStatus, string> = {
  done: "Done",
  in_progress: "In progress",
  upcoming: "Upcoming",
};

const STATUS_VARIANT: Record<StageStatus, "success" | "warning" | "neutral"> = {
  done: "success",
  in_progress: "warning",
  upcoming: "neutral",
};

export function StageStatusBadge({ status }: { status: StageStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
