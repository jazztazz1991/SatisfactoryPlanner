import { describe, it, expect } from "vitest";
import { buildOrthogonalPath, LANE_SPACING } from "./beltRouting";

describe("buildOrthogonalPath", () => {
  it("produces an orthogonal path with only M and L commands", () => {
    const result = buildOrthogonalPath({
      sourceX: 0,
      sourceY: 0,
      targetX: 200,
      targetY: 100,
      laneIndex: 0,
      laneCount: 1,
    });

    // Should only contain M (moveto) and L (lineto) — no curves
    expect(result.path).toMatch(/^M[\d\s.,L-]+$/);
    expect(result.path).not.toMatch(/[CQA]/); // no curve commands
  });

  it("single lane routes vertical segment through center", () => {
    const result = buildOrthogonalPath({
      sourceX: 0,
      sourceY: 0,
      targetX: 200,
      targetY: 100,
      laneIndex: 0,
      laneCount: 1,
    });

    // midX should be (0+200)/2 = 100 with no offset
    expect(result.path).toContain("L 100,0");
    expect(result.path).toContain("L 100,100");
  });

  it("two lanes offset symmetrically from center", () => {
    const base = {
      sourceX: 0,
      sourceY: 0,
      targetX: 200,
      targetY: 100,
      laneCount: 2,
    };

    const lane0 = buildOrthogonalPath({ ...base, laneIndex: 0 });
    const lane1 = buildOrthogonalPath({ ...base, laneIndex: 1 });

    // Lane 0 offset = (0 - 0.5) * LANE_SPACING = -3, midX = 100 - 3 = 97
    // Lane 1 offset = (1 - 0.5) * LANE_SPACING = +3, midX = 100 + 3 = 103
    const midX0 = 100 - LANE_SPACING / 2;
    const midX1 = 100 + LANE_SPACING / 2;

    expect(lane0.path).toContain(`L ${midX0},0`);
    expect(lane1.path).toContain(`L ${midX1},0`);
  });

  it("label is positioned at the midpoint of the vertical segment", () => {
    const result = buildOrthogonalPath({
      sourceX: 0,
      sourceY: 0,
      targetX: 200,
      targetY: 100,
      laneIndex: 0,
      laneCount: 1,
    });

    // Label X = midX = 100, Label Y = midpoint of vertical = (0+100)/2 = 50
    expect(result.labelX).toBe(100);
    expect(result.labelY).toBe(50);
  });

  it("handles horizontal-only path (same Y)", () => {
    const result = buildOrthogonalPath({
      sourceX: 0,
      sourceY: 50,
      targetX: 200,
      targetY: 50,
      laneIndex: 0,
      laneCount: 1,
    });

    // Should still produce a valid path
    expect(result.path).toContain("M 0,50");
    expect(result.path).toContain("L 200,50");
  });

  it("three lanes are evenly spaced", () => {
    const base = {
      sourceX: 0,
      sourceY: 0,
      targetX: 200,
      targetY: 100,
      laneCount: 3,
    };

    const lane0 = buildOrthogonalPath({ ...base, laneIndex: 0 });
    const lane1 = buildOrthogonalPath({ ...base, laneIndex: 1 });
    const lane2 = buildOrthogonalPath({ ...base, laneIndex: 2 });

    // Offsets: -LANE_SPACING, 0, +LANE_SPACING
    const midX0 = 100 - LANE_SPACING;
    const midX1 = 100;
    const midX2 = 100 + LANE_SPACING;

    expect(lane0.path).toContain(`L ${midX0},0`);
    expect(lane1.path).toContain(`L ${midX1},0`);
    expect(lane2.path).toContain(`L ${midX2},0`);
  });
});
