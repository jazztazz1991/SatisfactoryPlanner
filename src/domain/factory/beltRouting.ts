/** Pixels between parallel belt lanes. */
export const LANE_SPACING = 6;

export interface OrthogonalPathInput {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  laneIndex: number;
  laneCount: number;
}

export interface OrthogonalPathResult {
  path: string;
  labelX: number;
  labelY: number;
}

/**
 * Builds an orthogonal (right-angle only) SVG path between two points.
 * Parallel edges in the same corridor are offset by lane index so they
 * don't overlap.
 *
 * Path shape: horizontal → vertical → horizontal
 *   M sourceX,sourceY → L midX,sourceY → L midX,targetY → L targetX,targetY
 */
export function buildOrthogonalPath(input: OrthogonalPathInput): OrthogonalPathResult {
  const { sourceX, sourceY, targetX, targetY, laneIndex, laneCount } = input;

  const laneOffset = (laneIndex - (laneCount - 1) / 2) * LANE_SPACING;
  const midX = (sourceX + targetX) / 2 + laneOffset;

  const path =
    `M ${sourceX},${sourceY} ` +
    `L ${midX},${sourceY} ` +
    `L ${midX},${targetY} ` +
    `L ${targetX},${targetY}`;

  return {
    path,
    labelX: midX,
    labelY: (sourceY + targetY) / 2,
  };
}
