import type { IPlan, PlanAccessRole } from "@/domain/types/plan";

export const ROLE_HIERARCHY: Record<PlanAccessRole, number> = {
  viewer: 0,
  editor: 1,
  owner: 2,
};

/**
 * Determines a user's access role for a plan (pure function).
 * Used by the Socket.IO auth middleware and planAuth helper.
 */
export function resolveAccessRole(
  plan: IPlan,
  userId: string,
  collaboratorRole: PlanAccessRole | null
): PlanAccessRole | null {
  if (plan.userId === userId) return "owner";
  if (collaboratorRole && ROLE_HIERARCHY[collaboratorRole] >= 0) return collaboratorRole;
  return null;
}

/**
 * Checks whether `effectiveRole` meets the `minRole` threshold.
 */
export function hasMinRole(effectiveRole: PlanAccessRole, minRole: PlanAccessRole): boolean {
  return ROLE_HIERARCHY[effectiveRole] >= ROLE_HIERARCHY[minRole];
}
