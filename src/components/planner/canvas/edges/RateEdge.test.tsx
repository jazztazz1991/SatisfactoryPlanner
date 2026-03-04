// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RateEdge } from "./RateEdge";
import { Position } from "@xyflow/react";

vi.mock("@xyflow/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@xyflow/react")>();
  return {
    ...actual,
    BaseEdge: () => <line data-testid="base-edge" />,
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    getBezierPath: () => ["M0,0", 50, 50],
  };
});

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

describe("RateEdge", () => {
  it("renders the base edge", () => {
    render(
      <svg>
        <RateEdge {...baseProps} data={{ rate: 30, itemName: "Iron Ore" }} />
      </svg>
    );
    expect(screen.getByTestId("base-edge")).toBeInTheDocument();
  });

  it("shows rate label when rate is provided", () => {
    render(
      <svg>
        <RateEdge {...baseProps} data={{ rate: 30, itemName: "Iron Ore" }} />
      </svg>
    );
    expect(screen.getByText("30.0/min")).toBeInTheDocument();
  });

  it("does not show label when no data", () => {
    render(
      <svg>
        <RateEdge {...baseProps} data={{}} />
      </svg>
    );
    expect(screen.queryByText("/min")).not.toBeInTheDocument();
  });
});
