import businessGrowth from "@/assets/visuals/business-growth.svg";
import registration from "@/assets/visuals/registration.svg";
import taxCompliance from "@/assets/visuals/tax-compliance.svg";
import financeGrowth from "@/assets/visuals/finance-growth.svg";
import advisory from "@/assets/visuals/advisory.svg";
import teamSupport from "@/assets/visuals/team-support.svg";

export const visuals = {
  businessGrowth,
  registration,
  taxCompliance,
  financeGrowth,
  advisory,
  teamSupport,
} as const;

const categoryVisuals: Record<string, string> = {
  "start-a-business": registration,
  registrations: registration,
  tax: taxCompliance,
  compliance: taxCompliance,
  accounting: financeGrowth,
  finance: financeGrowth,
  insurance: advisory,
  advisory,
};

export function visualForCategory(categorySlug: string) {
  return categoryVisuals[categorySlug] ?? businessGrowth;
}
