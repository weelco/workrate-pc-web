import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GENDER_LABEL, EMPLOYMENT_TYPE_LABEL, yesNo, formatAddress } from "@/lib/format";
import type { Employee } from "@/lib/types";

// Overview tab: the "basics" the org asked for, modelled after the
// legacy system's Profiel screen (its Jobs section is a site/role
// assignment concern and lives elsewhere in this app, not here).
// Administratief-tab fields from that same legacy system — BSN, bank
// details, passport, contracts, clothing sizes, certifications — are
// deliberately out of scope for this tab; they're planned for a later
// sub-page, per how the field list was scoped.
export function EmployeeOverview({ employee }: { employee: Employee }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[11px] uppercase tracking-wide text-ink-muted">
              Personal details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Row label="Preferred name" value={employee.preferredName ?? "—"} />
            <Row label="First names" value={employee.firstNames ?? employee.name} />
            <Row label="Last name" value={employee.lastName ?? "—"} />
            {employee.namePrefix && <Row label="Name prefix" value={employee.namePrefix} />}
            <Row label="Initials" value={employee.legalInitials ?? "—"} />
            <Row label="Employee number" value={employee.employeeNumber} />
            <Row label="Job title" value={employee.role} />
            <Row label="Status" value={employee.status.replace("_", " ")} />
            <Row label="Gender" value={employee.gender ? GENDER_LABEL[employee.gender] : "—"} />
            <Row label="Date of birth" value={employee.dateOfBirth ?? "—"} />
            <Row label="Place of birth" value={employee.placeOfBirth ?? "—"} />
            <Row label="Marital status" value={employee.maritalStatus ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[11px] uppercase tracking-wide text-ink-muted">Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Row
              label="Street & no."
              value={[employee.street, [employee.houseNumber, employee.houseNumberAddition].filter(Boolean).join("")]
                .filter(Boolean)
                .join(" ") || "—"}
            />
            <Row label="Postal code" value={employee.postalCode ?? "—"} />
            <Row label="City" value={employee.city ?? "—"} />
            <p className="sr-only">{formatAddress(employee)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[11px] uppercase tracking-wide text-ink-muted">
              Warning addresses
            </CardTitle>
            <p className="text-xs text-ink-muted">Sites or clients this person should not be assigned to</p>
          </CardHeader>
          <CardContent className="text-xs">
            {employee.warningAddresses ? (
              <p className="text-ink">{employee.warningAddresses}</p>
            ) : (
              <p className="italic text-ink-muted">Not filled in</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[11px] uppercase tracking-wide text-ink-muted">
              Contact &amp; org
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Row label="Work email" value={employee.workEmail ?? "—"} />
            <Row label="Mobile number" value={employee.phone ?? "—"} />
            <Row label="Phone" value={employee.landlinePhone ?? "—"} />
            <Row label="Department" value={employee.department ?? "—"} />
            <Row label="Employment type" value={EMPLOYMENT_TYPE_LABEL[employee.employmentType]} />
            <Row label="Site" value={employee.site.name || "—"} />
            <Row label="Business unit" value={employee.site.businessUnit || "—"} />
            <Row label="Manager" value={employee.manager ?? "—"} />
            <Row label="Started" value={employee.startedAt} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[11px] uppercase tracking-wide text-ink-muted">
              Education &amp; mobility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Row label="In education" value={yesNo(employee.inEducation)} />
            <Row label="Education completed" value={yesNo(employee.educationCompleted)} />
            <Row label="Driver's license" value={yesNo(employee.hasDriversLicense)} />
            <Row label="Car" value={yesNo(employee.hasCar)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[11px] uppercase tracking-wide text-ink-muted">
              Work preference &amp; studies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Row label="Work preference" value={employee.workPreference ?? "—"} />
            <Row label="Studies" value={employee.studies ?? "Not filled in"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[11px] uppercase tracking-wide text-ink-muted">Medical</CardTitle>
            <p className="text-xs text-ink-muted">Visible only to this person and HR admins</p>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Row label="GP name" value={employee.gpName ?? "—"} />
            <Row label="GP phone" value={employee.gpPhone ?? "—"} />
            <Row label="Allergy" value={employee.allergy ?? "—"} />
            <Row label="Illness" value={employee.illness ?? "—"} />
            <Row label="Medication" value={employee.medication ?? "—"} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}
