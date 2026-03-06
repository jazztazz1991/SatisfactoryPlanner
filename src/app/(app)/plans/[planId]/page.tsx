import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getPlanById } from "@/repositories/planRepository";
import { getCollaboratorByPlanAndUser } from "@/repositories/collaboratorRepository";
import { resolveAccessRole } from "@/domain/planAccess";
import { PlannerShell } from "@/components/planner/PlannerShell";

type Props = { params: Promise<{ planId: string }> };

export default async function PlannerPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const { planId } = await params;
  const plan = await getPlanById(planId);
  if (!plan) notFound();

  const userId = session.user!.id!;
  const collab = plan.userId !== userId
    ? await getCollaboratorByPlanAndUser(planId, userId)
    : null;
  const role = resolveAccessRole(plan, userId, collab?.role ?? null);
  if (!role) notFound();

  return (
    <div>
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-2">
        <h1 className="text-sm font-semibold text-gray-200">{plan.name}</h1>
      </div>
      <PlannerShell
        planId={planId}
        initialViewMode={plan.viewMode}
        maxTier={plan.maxTier}
        shareRole={role !== "owner" ? role : null}
      />
    </div>
  );
}
