"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// The sidebar layout is a server component (it needs the Supabase
// session), but active-route highlighting needs the client-side
// pathname — so just this bit is its own small client component.
export function NavLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium " +
        (isActive ? "bg-info-surface text-brand" : "text-ink-muted hover:bg-surface-sunken")
      }
    >
      {icon}
      {children}
    </Link>
  );
}
