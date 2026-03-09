import { z } from "zod";
import { auth } from "@/auth";
import { getNodesByPlan, createNode, deleteNode } from "@/repositories/nodeRepository";
import { getEdgesByPlan, createEdge, deleteEdge } from "@/repositories/edgeRepository";
import { requirePlanAccess } from "@/lib/planAuth";
import { ok, err, unauthorized } from "@/lib/apiResponse";

type Params = { params: Promise<{ planId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "viewer");
  if (error) return error;

  try {
    const [nodes, edges] = await Promise.all([
      getNodesByPlan(planId, "builder"),
      getEdgesByPlan(planId, "builder"),
    ]);
    return ok({ nodes, edges });
  } catch (e) {
    console.error(e);
    return err("Failed to fetch builder data", 500);
  }
}

const bulkNodeSchema = z.object({
  id: z.string().uuid(),
  recipeClassName: z.string().nullable().optional(),
  buildingClassName: z.string().nullable().optional(),
  machineCount: z.number().nonnegative().default(1),
  overclockPercent: z.number().min(1).max(250).default(100),
  useAlternate: z.boolean().default(false),
  positionX: z.number().default(0),
  positionY: z.number().default(0),
  nodeType: z.enum(["machine", "resource", "sink", "splitter", "merger"]),
});

const bulkEdgeSchema = z.object({
  id: z.string().uuid(),
  sourceNodeId: z.string().uuid(),
  targetNodeId: z.string().uuid(),
  sourceHandle: z.string(),
  targetHandle: z.string(),
  itemClassName: z.string(),
  rate: z.number().nonnegative(),
});

const bulkSaveSchema = z.object({
  nodes: z.array(bulkNodeSchema),
  edges: z.array(bulkEdgeSchema),
});

export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { planId } = await params;
  const { error } = await requirePlanAccess(planId, session.user.id, "editor");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = bulkSaveSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", 400, parsed.error.flatten());
  }

  try {
    // Delete existing builder nodes & edges for this plan
    const existingNodes = await getNodesByPlan(planId, "builder");
    const existingEdges = await getEdgesByPlan(planId, "builder");

    await Promise.all(existingEdges.map((e) => deleteEdge(e.id)));
    await Promise.all(existingNodes.map((n) => deleteNode(n.id)));

    // Create new nodes
    const createdNodes = await Promise.all(
      parsed.data.nodes.map((n) =>
        createNode(planId, {
          recipeClassName: n.recipeClassName ?? null,
          buildingClassName: n.buildingClassName ?? null,
          machineCount: n.machineCount,
          overclockPercent: n.overclockPercent,
          useAlternate: n.useAlternate,
          positionX: n.positionX,
          positionY: n.positionY,
          nodeType: n.nodeType,
          viewType: "builder",
        }),
      ),
    );

    // Build ID mapping (client UUID → server UUID)
    const idMap = new Map<string, string>();
    parsed.data.nodes.forEach((clientNode, i) => {
      idMap.set(clientNode.id, createdNodes[i].id);
    });

    // Create new edges with remapped node IDs
    const createdEdges = await Promise.all(
      parsed.data.edges.map((e) =>
        createEdge(planId, {
          sourceNodeId: idMap.get(e.sourceNodeId) ?? e.sourceNodeId,
          targetNodeId: idMap.get(e.targetNodeId) ?? e.targetNodeId,
          itemClassName: e.itemClassName,
          rate: e.rate,
          viewType: "builder",
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        }),
      ),
    );

    return ok({ nodes: createdNodes, edges: createdEdges });
  } catch (e) {
    console.error("Builder PUT error:", e);
    const message = e instanceof Error ? e.message : "Failed to save builder data";
    return err(message, 500);
  }
}
