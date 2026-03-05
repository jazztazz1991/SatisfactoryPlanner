import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
} from "@xyflow/react";
import { buildOrthogonalPath } from "@/domain/factory/beltRouting";

export interface BeltEdgeData {
  itemName: string;
  rate: number;
  beltTier: 1 | 2 | 3 | 4 | 5;
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
  const styles = BELT_STYLES[tier] ?? BELT_STYLES[1];

  // Stagger labels vertically to prevent overlap in dense corridors
  const labelYOffset = laneCount > 1 ? (laneIndex - (laneCount - 1) / 2) * 14 : 0;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: styles.stroke, strokeWidth: 2 }} />
      {d?.rate !== undefined && d.rate > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + labelYOffset}px)`,
              pointerEvents: "all",
            }}
            className={`rounded bg-gray-900/80 px-1 py-px text-[10px] ${styles.text}`}
          >
            Mk{tier} {formatRate(d.rate)}/min
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
