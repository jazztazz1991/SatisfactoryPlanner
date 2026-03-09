import "@/models";
import { Plan } from "@/models/Plan";
import { PlanCollaborator } from "@/models/PlanCollaborator";
import { User } from "@/models/User";
import type { IPlan, IPlanWithRole } from "@/domain/types/plan";
import type { CreatePlanInput, UpdatePlanInput } from "@/domain/validation/planSchemas";

export async function getPlansByUser(userId: string): Promise<IPlan[]> {
  const rows = await Plan.findAll({
    where: { userId },
    order: [["updatedAt", "DESC"]],
  });
  return rows.map(planToDTO);
}

export async function getPlanById(id: string): Promise<IPlan | null> {
  const row = await Plan.findByPk(id);
  return row ? planToDTO(row) : null;
}

export async function createPlan(
  userId: string,
  input: CreatePlanInput
): Promise<IPlan> {
  const row = await Plan.create({
    userId,
    name: input.name,
    description: input.description ?? null,
    viewMode: input.viewMode ?? "graph",
    templateKey: input.templateKey ?? null,
    maxTier: input.maxTier ?? 9,
  });
  return planToDTO(row);
}

export async function updatePlan(
  id: string,
  input: UpdatePlanInput
): Promise<IPlan | null> {
  const row = await Plan.findByPk(id);
  if (!row) return null;
  await row.update({
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.viewMode !== undefined && { viewMode: input.viewMode }),
    ...(input.canvasViewport !== undefined && {
      canvasViewport: input.canvasViewport,
    }),
    ...(input.maxTier !== undefined && { maxTier: input.maxTier }),
    ...(input.factoryNodePositions !== undefined && {
      factoryNodePositions: input.factoryNodePositions,
    }),
    ...(input.floorConfig !== undefined && {
      floorConfig: input.floorConfig,
    }),
  });
  return planToDTO(row);
}

export async function deletePlan(id: string): Promise<boolean> {
  const count = await Plan.destroy({ where: { id } });
  return count > 0;
}

export async function getPlanByShareToken(token: string): Promise<IPlan | null> {
  const row = await Plan.findOne({ where: { shareToken: token } });
  return row ? planToDTO(row) : null;
}

export async function updatePlanShareSettings(
  id: string,
  shareToken: string | null,
  shareRole: "editor" | "viewer" | null
): Promise<IPlan | null> {
  const row = await Plan.findByPk(id);
  if (!row) return null;
  await row.update({ shareToken, shareRole });
  return planToDTO(row);
}

export async function getAllPlansForUser(userId: string): Promise<IPlanWithRole[]> {
  // Owned plans
  const ownedRows = await Plan.findAll({
    where: { userId },
    order: [["updatedAt", "DESC"]],
  });
  const owned: IPlanWithRole[] = ownedRows.map((row) => ({
    ...planToDTO(row),
    accessRole: "owner" as const,
    ownerName: null,
  }));

  // Shared plans: first get collaborator records, then fetch the plans separately
  const collabRows = await PlanCollaborator.findAll({
    where: { userId },
  });

  if (collabRows.length === 0) return owned;

  const planIds = collabRows.map((c) => c.planId);
  const roleByPlanId = new Map(collabRows.map((c) => [c.planId, c.role]));

  const sharedPlanRows = await Plan.findAll({
    where: { id: planIds },
    include: [{ model: User, attributes: ["name"] }],
    order: [["updatedAt", "DESC"]],
  });

  const shared: IPlanWithRole[] = sharedPlanRows.map((row) => {
    const planWithUser = row as Plan & { user?: { name: string | null } };
    return {
      ...planToDTO(row),
      accessRole: roleByPlanId.get(row.id) ?? "viewer",
      ownerName: planWithUser.user?.name ?? null,
    };
  });

  return [...owned, ...shared];
}

export async function savePlanCalculation(
  planId: string,
  calculation: object
): Promise<void> {
  await Plan.update(
    { savedCalculation: calculation },
    { where: { id: planId } }
  );
}

export async function getSavedCalculation(
  planId: string
): Promise<object | null> {
  const row = await Plan.findByPk(planId, {
    attributes: ["savedCalculation"],
  });
  return (row?.savedCalculation as object) ?? null;
}

export async function saveFactoryNodePositions(
  planId: string,
  positions: Record<string, { x: number; y: number }>
): Promise<void> {
  await Plan.update(
    { factoryNodePositions: positions },
    { where: { id: planId } }
  );
}

export async function getFactoryNodePositions(
  planId: string
): Promise<Record<string, { x: number; y: number }> | null> {
  const row = await Plan.findByPk(planId, {
    attributes: ["factoryNodePositions"],
  });
  return (row?.factoryNodePositions as Record<string, { x: number; y: number }>) ?? null;
}

function planToDTO(row: Plan): IPlan {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    viewMode: row.viewMode,
    templateKey: row.templateKey,
    canvasViewport: row.canvasViewport as IPlan["canvasViewport"],
    shareToken: row.shareToken ?? null,
    shareRole: row.shareRole ?? null,
    maxTier: row.maxTier ?? 9,
    factoryNodePositions: row.factoryNodePositions ?? null,
    floorConfig: (row.floorConfig as IPlan["floorConfig"]) ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
