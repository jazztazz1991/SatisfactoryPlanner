import "@/models";
import { PlanTarget } from "@/models/PlanTarget";
import type { IPlanTarget } from "@/domain/types/plan";
import type { CreateTargetInput, UpdateTargetInput } from "@/domain/validation/targetSchemas";

export async function getTargetsByPlan(planId: string): Promise<IPlanTarget[]> {
  const rows = await PlanTarget.findAll({ where: { planId } });
  return rows.map(targetToDTO);
}

export async function getTargetById(id: string): Promise<IPlanTarget | null> {
  const row = await PlanTarget.findByPk(id);
  return row ? targetToDTO(row) : null;
}

export async function createTarget(
  planId: string,
  input: CreateTargetInput
): Promise<IPlanTarget> {
  const row = await PlanTarget.create({
    planId,
    itemClassName: input.itemClassName,
    targetRate: input.targetRate,
  });
  return targetToDTO(row);
}

export async function updateTarget(
  id: string,
  input: UpdateTargetInput
): Promise<IPlanTarget | null> {
  const row = await PlanTarget.findByPk(id);
  if (!row) return null;
  await row.update({ targetRate: input.targetRate });
  return targetToDTO(row);
}

export async function deleteTarget(id: string): Promise<boolean> {
  const count = await PlanTarget.destroy({ where: { id } });
  return count > 0;
}

function targetToDTO(row: PlanTarget): IPlanTarget {
  return {
    id: row.id,
    planId: row.planId,
    itemClassName: row.itemClassName,
    targetRate: Number(row.targetRate),
  };
}
