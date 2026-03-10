// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MachineNode } from "./MachineNode";

// Stub @xyflow/react Handle (not needed for RTL tests)
vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Top: "top", Bottom: "bottom" },
}));

const baseProps = {
  id: "node-1",
  type: "machine",
  selected: false,
  isConnectable: true,
  zIndex: 0,
  xPos: 0,
  yPos: 0,
  dragging: false,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
  data: {
    recipeName: "Iron Ingot",
    buildingName: "Smelter",
    machineCount: 1.5,
    overclockPercent: 100,
    powerUsageKW: 45,
  },
};

describe("MachineNode", () => {
  it("renders the recipe name", () => {
    render(<MachineNode {...baseProps} />);
    expect(screen.getByText("Iron Ingot")).toBeInTheDocument();
  });

  it("renders the building name", () => {
    render(<MachineNode {...baseProps} />);
    expect(screen.getByText("Smelter")).toBeInTheDocument();
  });

  it("renders machine count", () => {
    render(<MachineNode {...baseProps} />);
    expect(screen.getByText("×1.50")).toBeInTheDocument();
  });

  it("renders power usage", () => {
    render(<MachineNode {...baseProps} />);
    expect(screen.getByText("45.0 kW")).toBeInTheDocument();
  });

  it("applies selected styling when selected", () => {
    render(<MachineNode {...baseProps} selected />);
    const node = screen.getByText("Iron Ingot").closest("div")!.parentElement!;
    expect(node.className).toContain("border-brand");
  });
});
