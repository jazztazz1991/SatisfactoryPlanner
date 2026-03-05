// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SplitterMergerNode } from "./SplitterMergerNode";

vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Left: "left", Right: "right", Top: "top", Bottom: "bottom" },
}));

vi.mock("../factoryLayout", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../factoryLayout")>();
  return { ...actual, CELL_PX: 48 };
});

const baseProps = {
  id: "splitter-1",
  type: "splitterMerger",
  selected: false,
  isConnectable: true,
  zIndex: 0,
  xPos: 0,
  yPos: 0,
  dragging: false,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
};

describe("SplitterMergerNode", () => {
  it("renders S label for splitter", () => {
    render(
      <SplitterMergerNode
        {...baseProps}
        data={{ kind: "splitter", itemClassName: "Desc_IronIngot_C" }}
      />
    );
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("renders M label for merger", () => {
    render(
      <SplitterMergerNode
        {...baseProps}
        data={{ kind: "merger", itemClassName: "Desc_IronIngot_C" }}
      />
    );
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("uses amber color for splitter", () => {
    const { container } = render(
      <SplitterMergerNode
        {...baseProps}
        data={{ kind: "splitter", itemClassName: "Desc_IronIngot_C" }}
      />
    );
    const node = container.firstElementChild;
    expect(node?.className).toContain("bg-amber-700/80");
    expect(node?.className).toContain("border-amber-400");
  });

  it("uses teal color for merger", () => {
    const { container } = render(
      <SplitterMergerNode
        {...baseProps}
        data={{ kind: "merger", itemClassName: "Desc_IronIngot_C" }}
      />
    );
    const node = container.firstElementChild;
    expect(node?.className).toContain("bg-teal-700/80");
    expect(node?.className).toContain("border-teal-400");
  });

  it("shows yellow border when selected", () => {
    const { container } = render(
      <SplitterMergerNode
        {...baseProps}
        selected={true}
        data={{ kind: "splitter", itemClassName: "Desc_IronIngot_C" }}
      />
    );
    const node = container.firstElementChild;
    expect(node?.className).toContain("border-yellow-400");
  });

  it("renders at grid cell size", () => {
    const { container } = render(
      <SplitterMergerNode
        {...baseProps}
        data={{ kind: "splitter", itemClassName: "Desc_IronIngot_C" }}
      />
    );
    const node = container.firstElementChild as HTMLElement;
    expect(node.style.width).toBe("48px");
    expect(node.style.height).toBe("48px");
  });
});
