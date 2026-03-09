export interface ConnectionCandidate {
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface ExistingEdge {
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: string;
  targetHandle: string;
}

/**
 * Parses an item className from a handle ID.
 * Handle formats:
 *   "out-Desc_IronIngot_C", "in-Desc_IronIngot_C"          — machine/resource handles
 *   "bus-in-Desc_X", "bus-out-Desc_X"                       — splitter/merger bus handles
 *   "branch-out-Desc_X", "branch-out-left-Desc_X"           — splitter branch outputs
 *   "branch-in-Desc_X", "branch-in-right-Desc_X"            — merger branch inputs
 */
export function parseHandleItem(handleId: string): string | null {
  // Order matters: longest prefixes first to avoid partial matches
  const match = handleId.match(/^(?:branch-out-left|branch-in-right|branch-out|branch-in|bus-in|bus-out|in|out)-(.*)$/);
  return match?.[1] ?? null;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  /** When one side is an unassigned splitter/merger, this is the resolved item className. */
  resolvedItem?: string;
}

/**
 * Validates whether a proposed connection between two nodes is allowed.
 *
 * Unassigned splitters/mergers have handles ending in "-" (empty item).
 * These are allowed as long as the other side has a concrete item.
 */
export function validateConnection(
  connection: ConnectionCandidate,
  existingEdges: ExistingEdge[],
): ValidationResult {
  if (connection.source === connection.target) {
    return { valid: false, reason: "Cannot connect a node to itself" };
  }

  const sourceItem = parseHandleItem(connection.sourceHandle);
  const targetItem = parseHandleItem(connection.targetHandle);

  if (sourceItem === null || targetItem === null) {
    return { valid: false, reason: "Invalid handle format" };
  }

  // Handle unassigned splitter/merger (empty item on one side)
  if (sourceItem === "" && targetItem === "") {
    return { valid: false, reason: "Cannot connect: both sides have unknown item" };
  }

  if (sourceItem !== "" && targetItem !== "" && sourceItem !== targetItem) {
    return { valid: false, reason: `Item mismatch: ${sourceItem} → ${targetItem}` };
  }

  const duplicate = existingEdges.some(
    (e) =>
      e.sourceNodeId === connection.source &&
      e.targetNodeId === connection.target &&
      e.sourceHandle === connection.sourceHandle &&
      e.targetHandle === connection.targetHandle,
  );
  if (duplicate) {
    return { valid: false, reason: "Connection already exists" };
  }

  // Resolve the item from whichever side has it
  const resolvedItem = sourceItem || targetItem;
  return { valid: true, resolvedItem: resolvedItem || undefined };
}
