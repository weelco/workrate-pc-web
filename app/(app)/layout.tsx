import Link from "next/link";
import { Users2, CalendarClock, Boxes, FileSignature } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";

// Shared shell for every authenticated screen: sidebar nav + top bar.
// Layout mirrors the Workrate Employee Lifecycle screenshot; modules
// out of v1 scope (ESS, Asset Management, Contract Management) are
// shown but disabled, so the nav doesn't need reshaping when they land.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface-card">
        <div className="px-4 py-5">
          <span className="text-sm font-bold tracking-widest text-navy">WORKRATE</span>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          <Link
            href="/employees"
            className="flex items-center gap-2 rounded-md bg-info-surface px-3 py-2 text-sm font-medium text-brand"
          >
            <Users2 className="h-4 w-4" />
            Employee Lifecycle
          </Link>

          <div className="pt-4 text-[11px] font-semibold uppercase tracking-wide text-ink-muted px-3">
            Coming later
          </div>
          <DisabledNavItem icon={<CalendarClock className="h-4 w-4" />} label="ESS (Scheduling, Leave, Payroll)" />
          <DisabledNavItem icon={<Boxes className="h-4 w-4" />} label="Asset Management" />
          <DisabledNavItem icon={<FileSignature className="h-4 w-4" />} label="Contract Management" />
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface-card px-6">
          <span className="text-sm text-ink-muted">Workrate &gt; Employee Lifecycle</span>
          {!supabase ? (
            <span className="text-xs text-ink-muted">Phase 1 preview — demo data</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-muted">{user.email}</span>
              <SignOutButton />
            </div>
          ) : (
            <Link href="/login" className="text-xs font-medium text-brand">
              Sign in
            </Link>
          )}
        </header>
        <main className="flex-1 bg-surface-page p-6">{children}</main>
      </div>
    </div>
  );
}

function DisabledNavItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-muted opacity-60">
      {icon}
      {label}
    </div>
  );
}
