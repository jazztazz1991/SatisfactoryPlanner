import "@/models";
import { PlanEdge } from "@/models/PlanEdge";
import type { IPlanEdge, NodeViewType } from "@/domain/types/plan";

export interface CreateEdgeInput {
  sourceNodeId: string;
  targetNodeId: string;
  itemClassName: string;
  rate: number;
  viewType?: NodeViewType;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export async function getEdgesByPlan(planId: string, viewType?: NodeViewType): Promise<IPlanEdge[]> {
  const where: Record<string, unknown> = { planId };
  if (viewType) where.viewType = viewType;
  const rows = await PlanEdge.findAll({ where });
  return rows.map(edgeToDTO);
}

export async function createEdge(
  planId: string,
  input: CreateEdgeInput
): Promise<IPlanEdge> {
  const row = await PlanEdge.create({
    planId,
    sourceNodeId: input.sourceNodeId,
    targetNodeId: input.targetNodeId,
    itemClassName: input.itemClassName,
    rate: input.rate,
    viewType: input.viewType ?? "graph",
    sourceHandle: input.sourceHandle ?? null,
    targetHandle: input.targetHandle ?? null,
  });
  return edgeToDTO(row);
}

export async function deleteEdge(id: string): Promise<boolean> {
  const count = await PlanEdge.destroy({ where: { id } });
  return count > 0;
}

export async function getEdgeById(id: string): Promise<IPlanEdge | null> {
  const row = await PlanEdge.findByPk(id);
  return row ? edgeToDTO(row) : null;
}

function edgeToDTO(row: PlanEdge): IPlanEdge {
  return {
    id: row.id,
    planId: row.planId,
    sourceNodeId: row.sourceNodeId,
    targetNodeId: row.targetNodeId,
    itemClassName: row.itemClassName,
    rate: Number(row.rate),
    viewType: row.viewType,
    sourceHandle: row.sourceHandle ?? null,
    targetHandle: row.targetHandle ?? null,
  };
}
