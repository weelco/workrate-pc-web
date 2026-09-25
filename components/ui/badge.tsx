import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Maps directly onto the Workrate Design System's semantic status
// tokens (success/warning/danger/neutral-phase). Reuse this component
// for both leave-request statuses (Approved/Pending/Rejected) and
// lifecycle-stage statuses (Done/In progress/Upcoming) — same colors,
// different words, per the design system README.
const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        success: "bg-success-surface text-success",
        warning: "bg-warning-surface text-warning",
        danger: "bg-danger-surface text-danger",
        info: "bg-info-surface text-info",
        neutral: "bg-surface-sunken text-neutral-phase",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
