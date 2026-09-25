import type { EmployeeLifecycle } from "@/lib/types";

// Sample data shaped after the "Marcus Reyes" example in Workrate's
// Employee Lifecycle product deck, used as a fallback so the app is
// browsable before a Supabase project is wired up. Real data always
// wins once NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are set — see
// lib/api/lifecycle.ts.
export const demoLifecycle: EmployeeLifecycle = {
  employee: {
    id: "demo-marcus-reyes",
    employeeNumber: "WRK-4821",
    name: "Marcus Reyes",
    initials: "MR",
    role: "Security Officer",
    site: { id: "ams3", name: "AMS3 Enterprise", businessUnit: "Workrate Amsterdam" },
    status: "onboarding",
    currentPhaseKey: "onboard",
    currentStageId: "onboard-3",
    startedAt: "2026-02-10",
    manager: "Mark de Groot",
  },
  phases: [
    {
      key: "onboard",
      name: "Onboard",
      order: 1,
      stages: [
        {
          id: "onboard-1",
          phaseKey: "onboard",
          order: 1,
          name: "Pre-boarding",
          description: "Accounts, kit, badge provisioned",
          status: "done",
          ownerName: "People Ops",
          ownerRole: null,
          date: "2026-02-03",
          taskProgress: null,
        },
        {
          id: "onboard-2",
          phaseKey: "onboard",
          order: 2,
          name: "Day 1",
          description: "Inducted, site orientation done",
          status: "done",
          ownerName: "Mark de Groot",
          ownerRole: "Manager",
          date: "2026-02-10",
          taskProgress: null,
        },
        {
          id: "onboard-3",
          phaseKey: "onboard",
          order: 3,
          name: "Break-in training",
          description: "Post & SOP sign-off underway",
          status: "in_progress",
          ownerName: "Sarah Johnson",
          ownerRole: "Owner",
          date: null,
          taskProgress: { done: 3, total: 5 },
        },
      ],
    },
    {
      key: "grow",
      name: "Grow",
      order: 2,
      stages: [
        {
          id: "grow-1",
          phaseKey: "grow",
          order: 1,
          name: "Active",
          description: "Full duty roster",
          status: "upcoming",
          ownerName: "Mark de Groot",
          ownerRole: null,
          date: "2026-03-02",
          taskProgress: null,
        },
        {
          id: "grow-2",
          phaseKey: "grow",
          order: 2,
          name: "Transfer / Promotion",
          description: "Role & access changes",
          status: "upcoming",
          ownerName: "Line manager",
          ownerRole: null,
          date: null,
          taskProgress: null,
        },
      ],
    },
    {
      key: "exit",
      name: "Exit",
      order: 3,
      stages: [
        {
          id: "exit-1",
          phaseKey: "exit",
          order: 1,
          name: "Notice",
          description: "Resignation / end of contract",
          status: "upcoming",
          ownerName: null,
          ownerRole: null,
          date: null,
          taskProgress: null,
        },
        {
          id: "exit-2",
          phaseKey: "exit",
          order: 2,
          name: "Offboarding checklist",
          description: "Access revoked, kit/badge returned, final pay closed",
          status: "upcoming",
          ownerName: "People Ops",
          ownerRole: null,
          date: null,
          taskProgress: null,
        },
      ],
    },
  ],
};

export const demoEmployeeList = [demoLifecycle.employee];
