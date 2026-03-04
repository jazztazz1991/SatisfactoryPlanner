import "@/models";
import { Plan } from "@/models/Plan";
import type { IPlan } from "@/domain/types/plan";
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
  });
  return planToDTO(row);
}

export async function deletePlan(id: string): Promise<boolean> {
  const count = await Plan.destroy({ where: { id } });
  return count > 0;
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
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
