import "@/models";
import { PlanNode } from "@/models/PlanNode";
import type { IPlanNode } from "@/domain/types/plan";
import type { CreateNodeInput, UpdateNodeInput } from "@/domain/validation/nodeSchemas";

export async function getNodesByPlan(planId: string): Promise<IPlanNode[]> {
  const rows = await PlanNode.findAll({ where: { planId } });
  return rows.map(nodeToDTO);
}

export async function getNodeById(id: string): Promise<IPlanNode | null> {
  const row = await PlanNode.findByPk(id);
  return row ? nodeToDTO(row) : null;
}

export async function createNode(
  planId: string,
  input: CreateNodeInput
): Promise<IPlanNode> {
  const row = await PlanNode.create({
    planId,
    recipeClassName: input.recipeClassName ?? null,
    buildingClassName: input.buildingClassName ?? null,
    machineCount: input.machineCount ?? 1,
    overclockPercent: input.overclockPercent ?? 100,
    useAlternate: input.useAlternate ?? false,
    positionX: input.positionX ?? 0,
    positionY: input.positionY ?? 0,
    nodeType: input.nodeType,
  });
  return nodeToDTO(row);
}

export async function updateNode(
  id: string,
  input: UpdateNodeInput
): Promise<IPlanNode | null> {
  const row = await PlanNode.findByPk(id);
  if (!row) return null;
  await row.update({
    ...(input.recipeClassName !== undefined && { recipeClassName: input.recipeClassName }),
    ...(input.buildingClassName !== undefined && { buildingClassName: input.buildingClassName }),
    ...(input.machineCount !== undefined && { machineCount: input.machineCount }),
    ...(input.overclockPercent !== undefined && { overclockPercent: input.overclockPercent }),
    ...(input.useAlternate !== undefined && { useAlternate: input.useAlternate }),
    ...(input.positionX !== undefined && { positionX: input.positionX }),
    ...(input.positionY !== undefined && { positionY: input.positionY }),
    ...(input.nodeType !== undefined && { nodeType: input.nodeType }),
  });
  return nodeToDTO(row);
}

export async function deleteNode(id: string): Promise<boolean> {
  const count = await PlanNode.destroy({ where: { id } });
  return count > 0;
}

function nodeToDTO(row: PlanNode): IPlanNode {
  return {
    id: row.id,
    planId: row.planId,
    recipeClassName: row.recipeClassName,
    buildingClassName: row.buildingClassName,
    machineCount: Number(row.machineCount),
    overclockPercent: Number(row.overclockPercent),
    useAlternate: row.useAlternate,
    positionX: Number(row.positionX),
    positionY: Number(row.positionY),
    nodeType: row.nodeType,
  };
}
