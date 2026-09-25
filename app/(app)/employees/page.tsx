import Link from "next/link";
import { getEmployees } from "@/lib/api/lifecycle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT = {
  onboarding: "warning",
  active: "success",
  on_leave: "info",
  offboarding: "neutral",
  terminated: "neutral",
} as const;

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-page-title text-2xl font-semibold text-ink">Employees</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Every joiner to every leaver — click through to see one person&rsquo;s lifecycle journey.
      </p>

      <div className="mt-6 space-y-2">
        {employees.map((employee) => (
          <Link key={employee.id} href={`/employees/${employee.id}`}>
            <Card className="transition-colors hover:border-brand">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-info-surface text-sm font-semibold text-brand">
                    {employee.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{employee.name}</p>
                    <p className="text-xs text-ink-muted">
                      {employee.role} · {employee.site.name} · {employee.employeeNumber}
                    </p>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[employee.status]}>{employee.status.replace("_", " ")}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
