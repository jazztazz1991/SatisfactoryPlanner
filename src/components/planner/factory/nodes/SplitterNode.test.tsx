// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SplitterNode } from "./SplitterNode";

vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Top: "top", Bottom: "bottom" },
}));

const baseProps = {
  id: "split-1",
  type: "splitter",
  selected: false,
  isConnectable: true,
  zIndex: 0,
  xPos: 0,
  yPos: 0,
  dragging: false,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
  data: {
    itemName: "Iron Ingot",
    rate: 60,
  },
};

describe("SplitterNode", () => {
  it("renders item name", () => {
    render(<SplitterNode {...baseProps} />);
    expect(screen.getByText("Iron Ingot")).toBeInTheDocument();
  });

  it("renders rate", () => {
    render(<SplitterNode {...baseProps} />);
    expect(screen.getByText("60.0/min")).toBeInTheDocument();
  });
});
