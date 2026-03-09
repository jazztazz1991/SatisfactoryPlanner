// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { LiftNode } from "./LiftNode";
import type { NodeProps } from "@xyflow/react";

function renderLiftNode(data: Record<string, unknown>) {
  const props = {
    id: "test-lift",
    data,
    type: "factoryLift",
    selected: false,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    zIndex: 0,
    dragging: false,
  } as unknown as NodeProps;

  return render(
    <ReactFlowProvider>
      <LiftNode {...props} />
    </ReactFlowProvider>,
  );
}

describe("LiftNode", () => {
  it("renders down arrow for direction=down", () => {
    renderLiftNode({
      direction: "down",
      connectedFloor: 1,
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      rate: 60,
    });

    expect(screen.getByText("▼")).toBeDefined();
  });

  it("renders up arrow for direction=up", () => {
    renderLiftNode({
      direction: "up",
      connectedFloor: 0,
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      rate: 60,
    });

    expect(screen.getByText("▲")).toBeDefined();
  });

  it("shows connected floor label", () => {
    renderLiftNode({
      direction: "down",
      connectedFloor: 2,
      itemClassName: "Desc_IronIngot_C",
      itemName: "Iron Ingot",
      rate: 60,
    });

    expect(screen.getByText("F3")).toBeDefined();
  });

  it("shows item name", () => {
    renderLiftNode({
      direction: "up",
      connectedFloor: 0,
      itemClassName: "Desc_CopperIngot_C",
      itemName: "Copper Ingot",
      rate: 30,
    });

    expect(screen.getByText("Copper Ingot")).toBeDefined();
  });
});
