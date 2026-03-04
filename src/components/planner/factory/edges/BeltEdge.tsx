import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export interface BeltEdgeData {
  itemName: string;
  rate: number;
  beltTier: 1 | 2 | 3 | 4 | 5;
  [key: string]: unknown;
}

const BELT_STYLES: Record<number, { stroke: string; label: string; badge: string }> = {
  1: { stroke: "#f59e0b", label: "text-amber-400 border-amber-400", badge: "bg-amber-400 text-gray-900" },
  2: { stroke: "#22c55e", label: "text-green-400 border-green-400", badge: "bg-green-400 text-gray-900" },
  3: { stroke: "#3b82f6", label: "text-blue-500 border-blue-500", badge: "bg-blue-500 text-white" },
  4: { stroke: "#a855f7", label: "text-purple-500 border-purple-500", badge: "bg-purple-500 text-white" },
  5: { stroke: "#06b6d4", label: "text-cyan-400 border-cyan-400", badge: "bg-cyan-400 text-gray-900" },
};

export function BeltEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const d = data as BeltEdgeData | undefined;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const tier = d?.beltTier ?? 1;
  const styles = BELT_STYLES[tier] ?? BELT_STYLES[1];

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: styles.stroke, strokeWidth: 2 }} />
      {d?.rate !== undefined && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className={`rounded bg-gray-900 px-1.5 py-0.5 text-xs border flex items-center gap-1 ${styles.label}`}
          >
            <span>{d.itemName}</span>
            <span>{d.rate.toFixed(1)}/min</span>
            <span className={`rounded px-1 text-xs ${styles.badge}`}>
              Mk{tier}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
