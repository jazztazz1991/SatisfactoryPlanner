import { getPlanById } from "@/repositories/planRepository";
import { getCollaboratorByPlanAndUser } from "@/repositories/collaboratorRepository";
import { notFound, forbidden } from "@/lib/apiResponse";
import { hasMinRole } from "@/domain/planAccess";
import type { IPlan, PlanAccessRole } from "@/domain/types/plan";

/**
 * Checks if a user has at least `minRole` access to a plan.
 * Returns the plan if access is granted, or a NextResponse error.
 */
export async function requirePlanAccess(
  planId: string,
  userId: string,
  minRole: PlanAccessRole
): Promise<{ plan: IPlan; role: PlanAccessRole; error: null } | { plan: null; role: null; error: Response }> {
  const plan = await getPlanById(planId);
  if (!plan) return { plan: null, role: null, error: notFound() };

  // Owner always has full access
  if (plan.userId === userId) {
    return { plan, role: "owner", error: null };
  }

  // Check collaborator record
  const collab = await getCollaboratorByPlanAndUser(planId, userId);
  if (!collab || !collab.acceptedAt) {
    return { plan: null, role: null, error: forbidden() };
  }

  const effectiveRole: PlanAccessRole = collab.role;
  if (!hasMinRole(effectiveRole, minRole)) {
    return { plan: null, role: null, error: forbidden() };
  }

  return { plan, role: effectiveRole, error: null };
}
