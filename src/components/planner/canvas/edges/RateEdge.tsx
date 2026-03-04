import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export interface RateEdgeData {
  itemName?: string;
  rate?: number;
  [key: string]: unknown;
}

export function RateEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const d = data as RateEdgeData | undefined;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: "#f97316", strokeWidth: 2 }} />
      {d?.rate !== undefined && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="rounded bg-gray-900 px-1.5 py-0.5 text-xs text-orange-300 border border-orange-700"
          >
            {d.rate.toFixed(1)}/min
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
