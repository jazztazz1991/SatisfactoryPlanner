// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ResourceNode } from "./ResourceNode";

vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Top: "top", Bottom: "bottom" },
}));

const baseProps = {
  id: "node-r1",
  type: "resource",
  selected: false,
  isConnectable: true,
  zIndex: 0,
  xPos: 0,
  yPos: 0,
  dragging: false,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
  data: { itemName: "Iron Ore", rate: 60 },
};

describe("ResourceNode", () => {
  it("renders item name", () => {
    render(<ResourceNode {...baseProps} />);
    expect(screen.getByText("Iron Ore")).toBeInTheDocument();
  });

  it("renders rate", () => {
    render(<ResourceNode {...baseProps} />);
    expect(screen.getByText("60.00/min")).toBeInTheDocument();
  });
});
