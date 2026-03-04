// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NodeInspector } from "./NodeInspector";
import { useCanvasStore } from "@/store/canvasStore";
import type { Node } from "@xyflow/react";

vi.mock("@/store/canvasStore");

const mockNode: Node = {
  id: "node-1",
  type: "machine",
  position: { x: 0, y: 0 },
  data: {
    recipeName: "Iron Ingot",
    buildingName: "Smelter",
    machineCount: 2.5,
    overclockPercent: 100,
    powerUsageKW: 45,
  },
};

describe("NodeInspector", () => {
  beforeEach(() => {
    vi.mocked(useCanvasStore).mockReturnValue({
      nodes: [mockNode],
      selectedNodeId: "node-1",
    } as ReturnType<typeof useCanvasStore>);
  });

  it("shows placeholder when no node is selected", () => {
    vi.mocked(useCanvasStore).mockReturnValue({
      nodes: [],
      selectedNodeId: null,
    } as ReturnType<typeof useCanvasStore>);
    render(<NodeInspector planId="plan-1" />);
    expect(screen.getByText(/select a node/i)).toBeInTheDocument();
  });

  it("shows recipe name for selected node", () => {
    render(<NodeInspector planId="plan-1" />);
    expect(screen.getByText("Iron Ingot")).toBeInTheDocument();
  });

  it("shows machine count", () => {
    render(<NodeInspector planId="plan-1" />);
    expect(screen.getByText("2.50")).toBeInTheDocument();
  });

  it("shows delete button when onDelete provided", () => {
    render(<NodeInspector planId="plan-1" onDelete={vi.fn()} />);
    expect(screen.getByRole("button", { name: /delete node/i })).toBeInTheDocument();
  });

  it("does not show delete button without onDelete", () => {
    render(<NodeInspector planId="plan-1" />);
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });
});
