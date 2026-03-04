// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SinkNode } from "./SinkNode";

vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Top: "top", Bottom: "bottom" },
}));

const baseProps = {
  id: "node-s1",
  type: "sink",
  selected: false,
  isConnectable: true,
  zIndex: 0,
  xPos: 0,
  yPos: 0,
  dragging: false,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
  data: { itemName: "Smart Plating", rate: 2 },
};

describe("SinkNode", () => {
  it("renders item name", () => {
    render(<SinkNode {...baseProps} />);
    expect(screen.getByText("Smart Plating")).toBeInTheDocument();
  });

  it("renders rate", () => {
    render(<SinkNode {...baseProps} />);
    expect(screen.getByText("2.00/min")).toBeInTheDocument();
  });
});
