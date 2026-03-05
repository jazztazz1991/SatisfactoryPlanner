// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BeltEdge } from "./BeltEdge";
import { Position } from "@xyflow/react";

vi.mock("@xyflow/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@xyflow/react")>();
  return {
    ...actual,
    BaseEdge: () => <line data-testid="base-edge" />,
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("@/domain/factory/beltRouting", () => ({
  buildOrthogonalPath: () => ({ path: "M0,0 L50,0 L50,100 L100,100", labelX: 50, labelY: 50 }),
  LANE_SPACING: 6,
}));

const baseProps = {
  id: "edge-1",
  source: "node-1",
  target: "node-2",
  sourceX: 0,
  sourceY: 0,
  targetX: 100,
  targetY: 100,
  sourcePosition: Position.Bottom,
  targetPosition: Position.Top,
  selected: false,
  animated: false,
  label: "",
  labelStyle: {},
  labelShowBg: false,
  labelBgStyle: {},
  labelBgPadding: [0, 0] as [number, number],
  labelBgBorderRadius: 0,
  markerStart: "",
  markerEnd: "",
  pathOptions: {},
  interactionWidth: 20,
  style: {},
};

describe("BeltEdge", () => {
  it("renders the base edge", () => {
    render(
      <svg>
        <BeltEdge {...baseProps} data={{ itemName: "Iron Ore", rate: 30, beltTier: 1, laneIndex: 0, laneCount: 1 }} />
      </svg>
    );
    expect(screen.getByTestId("base-edge")).toBeInTheDocument();
  });

  it("shows belt tier and rate label", () => {
    render(
      <svg>
        <BeltEdge {...baseProps} data={{ itemName: "Iron Ore", rate: 30, beltTier: 1, laneIndex: 0, laneCount: 1 }} />
      </svg>
    );
    expect(screen.getByText("Mk1 30/min")).toBeInTheDocument();
  });

  it("does not show item name separately", () => {
    render(
      <svg>
        <BeltEdge {...baseProps} data={{ itemName: "Iron Ore", rate: 30, beltTier: 1, laneIndex: 0, laneCount: 1 }} />
      </svg>
    );
    expect(screen.queryByText("Iron Ore")).not.toBeInTheDocument();
  });
});
