import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
} from "@xyflow/react";
import { buildOrthogonalPath } from "@/domain/factory/beltRouting";

export interface BeltEdgeData {
  itemName: string;
  rate: number;
  beltTier: 1 | 2 | 3 | 4 | 5 | 6;
  overCapacity?: boolean;
  laneIndex: number;
  laneCount: number;
  [key: string]: unknown;
}

const BELT_STYLES: Record<number, { stroke: string; text: string }> = {
  1: { stroke: "#f59e0b", text: "text-amber-400" },
  2: { stroke: "#22c55e", text: "text-green-400" },
  3: { stroke: "#3b82f6", text: "text-blue-400" },
  4: { stroke: "#a855f7", text: "text-purple-400" },
  5: { stroke: "#06b6d4", text: "text-cyan-400" },
  6: { stroke: "#ec4899", text: "text-pink-400" },
};

function formatRate(rate: number): string {
  return rate % 1 === 0 ? `${rate}` : rate.toFixed(1);
}

export function BeltEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) {
  const d = data as BeltEdgeData | undefined;

  const laneIndex = d?.laneIndex ?? 0;
  const laneCount = d?.laneCount ?? 1;

  const { path: edgePath, labelX, labelY } = buildOrthogonalPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    laneIndex,
    laneCount,
  });

  const tier = d?.beltTier ?? 1;
  const overCapacity = d?.overCapacity ?? false;
  const styles = BELT_STYLES[tier] ?? BELT_STYLES[1];

  // Stagger labels vertically to prevent overlap in dense corridors
  const labelYOffset = laneCount > 1 ? (laneIndex - (laneCount - 1) / 2) * 14 : 0;

  const strokeColor = overCapacity ? "#ef4444" : styles.stroke;
  const labelTextClass = overCapacity ? "text-red-400" : styles.text;
  const labelBorderClass = overCapacity ? "ring-1 ring-red-500" : "";

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: strokeColor, strokeWidth: overCapacity ? 3 : 2, strokeDasharray: overCapacity ? "6 3" : undefined }}
      />
      {d?.rate !== undefined && d.rate > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + labelYOffset}px)`,
              pointerEvents: "all",
            }}
            className={`rounded bg-surface-raised/80 px-1 py-px text-[10px] ${labelTextClass} ${labelBorderClass}`}
          >
            {overCapacity && "⚠ "}Mk{tier} {formatRate(d.rate)}/min
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
