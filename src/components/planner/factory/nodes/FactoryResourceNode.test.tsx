// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FactoryResourceNode } from "./FactoryResourceNode";

vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Right: "right" },
}));

vi.mock("../factoryLayout", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../factoryLayout")>();
  return { ...actual, CELL_PX: 48 };
});

const baseProps = {
  id: "raw-1",
  type: "factoryResource",
  selected: false,
  isConnectable: true,
  zIndex: 0,
  xPos: 0,
  yPos: 0,
  dragging: false,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
  data: {
    itemClassName: "Desc_OreIron_C",
    itemName: "Iron Ore",
    rate: 30,
  },
};

describe("FactoryResourceNode", () => {
  it("renders the item name", () => {
    render(<FactoryResourceNode {...baseProps} />);
    expect(screen.getByText("Iron Ore")).toBeInTheDocument();
  });

  it("renders the rate", () => {
    render(<FactoryResourceNode {...baseProps} />);
    expect(screen.getByText("30/m")).toBeInTheDocument();
  });

  it("renders at grid cell size", () => {
    const { container } = render(<FactoryResourceNode {...baseProps} />);
    const node = container.firstElementChild as HTMLElement;
    expect(node.style.width).toBe("48px");
    expect(node.style.height).toBe("48px");
  });

  it("shows yellow border when selected", () => {
    const { container } = render(<FactoryResourceNode {...baseProps} selected={true} />);
    const card = container.firstElementChild;
    expect(card?.className).toContain("border-yellow-400");
  });

  it("shows default green border when not selected", () => {
    const { container } = render(<FactoryResourceNode {...baseProps} />);
    const card = container.firstElementChild;
    expect(card?.className).toContain("border-green-500");
  });

  it("formats fractional rates", () => {
    render(
      <FactoryResourceNode
        {...baseProps}
        data={{ ...baseProps.data, rate: 22.5 }}
      />
    );
    expect(screen.getByText("22.5/m")).toBeInTheDocument();
  });
});
