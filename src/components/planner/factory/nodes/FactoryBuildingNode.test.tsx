// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FactoryBuildingNode } from "./FactoryBuildingNode";

vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Top: "top", Bottom: "bottom" },
}));

const baseProps = {
  id: "node-1",
  type: "factoryBuilding",
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
    machineCount: 3,
    powerUsageKW: 12,
  },
};

describe("FactoryBuildingNode", () => {
  it("renders the recipe name", () => {
    render(<FactoryBuildingNode {...baseProps} />);
    expect(screen.getByText("Iron Ingot")).toBeInTheDocument();
  });

  it("renders the building name", () => {
    render(<FactoryBuildingNode {...baseProps} />);
    expect(screen.getByText("Smelter")).toBeInTheDocument();
  });

  it("renders ceil machine count", () => {
    render(<FactoryBuildingNode {...baseProps} />);
    expect(screen.getByText("×3 machines")).toBeInTheDocument();
  });

  it("renders power usage", () => {
    render(<FactoryBuildingNode {...baseProps} />);
    expect(screen.getByText("12.0 kW")).toBeInTheDocument();
  });

  it("renders Smelter emoji", () => {
    render(<FactoryBuildingNode {...baseProps} />);
    expect(screen.getByText("🔥")).toBeInTheDocument();
  });

  it("renders default emoji for unknown building", () => {
    render(
      <FactoryBuildingNode
        {...baseProps}
        data={{ ...baseProps.data, buildingName: "UnknownMachine" }}
      />
    );
    expect(screen.getByText("🏗️")).toBeInTheDocument();
  });
});
