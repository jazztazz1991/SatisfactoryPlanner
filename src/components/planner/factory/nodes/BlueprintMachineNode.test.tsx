// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BlueprintMachineNode } from "./BlueprintMachineNode";

vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Left: "left", Right: "right" },
}));

const baseProps = {
  id: "bp-Recipe_IronIngot_C-0",
  type: "blueprintMachine",
  selected: false,
  isConnectable: true,
  zIndex: 0,
  xPos: 0,
  yPos: 0,
  dragging: false,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
  data: {
    buildingName: "Smelter",
    recipeName: "Iron Ingot",
    spriteKey: "smelter" as const,
    widthPx: 48,
    depthPx: 96,
    inputItems: ["Desc_OreIron_C"],
    outputItems: ["Desc_IronIngot_C"],
  },
};

describe("BlueprintMachineNode", () => {
  it("renders the building name", () => {
    render(<BlueprintMachineNode {...baseProps} />);
    expect(screen.getByText("Smelter")).toBeInTheDocument();
  });

  it("renders the recipe name", () => {
    render(<BlueprintMachineNode {...baseProps} />);
    expect(screen.getByText("Iron Ingot")).toBeInTheDocument();
  });

  it("renders at the correct dimensions", () => {
    const { container } = render(<BlueprintMachineNode {...baseProps} />);
    const node = container.firstElementChild as HTMLElement;
    expect(node.style.width).toBe("48px");
    expect(node.style.height).toBe("96px");
  });

  it("uses building-specific color", () => {
    const { container } = render(<BlueprintMachineNode {...baseProps} />);
    const node = container.firstElementChild;
    expect(node?.className).toContain("bg-amber-900/80");
    expect(node?.className).toContain("border-amber-500");
  });

  it("shows brand border when selected", () => {
    const { container } = render(<BlueprintMachineNode {...baseProps} selected={true} />);
    const node = container.firstElementChild;
    expect(node?.className).toContain("border-brand");
  });

  it("falls back to 'Building' label when buildingName is null", () => {
    render(
      <BlueprintMachineNode
        {...baseProps}
        data={{ ...baseProps.data, buildingName: null }}
      />
    );
    expect(screen.getByText("Building")).toBeInTheDocument();
    expect(screen.getByText("Iron Ingot")).toBeInTheDocument();
  });
});
