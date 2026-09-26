import type { Gender, EmploymentType } from "./types";

// Display labels for the Overview tab's enum-backed fields — kept
// separate from lib/types.ts so it's obvious this is presentation, not
// schema.
export const GENDER_LABEL: Record<Gender, string> = {
  female: "Female",
  male: "Male",
  non_binary: "Non-binary",
  prefer_not_to_say: "Prefer not to say",
};

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contractor: "Contractor",
  temporary: "Temporary",
};

export function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

export function formatAddress(employee: {
  street: string | null;
  houseNumber: string | null;
  houseNumberAddition: string | null;
  postalCode: string | null;
  city: string | null;
}): string {
  const line1 = [employee.street, [employee.houseNumber, employee.houseNumberAddition].filter(Boolean).join("")]
    .filter(Boolean)
    .join(" ");
  const line2 = [employee.postalCode, employee.city].filter(Boolean).join(" ");
  const combined = [line1, line2].filter(Boolean).join(", ");
  return combined || "—";
}
