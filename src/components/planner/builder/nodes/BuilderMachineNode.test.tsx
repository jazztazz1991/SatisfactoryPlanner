// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { BuilderMachineNode } from "./BuilderMachineNode";

function renderNode(data: Record<string, unknown>, selected = false) {
  const props = {
    id: "test-node",
    data,
    selected,
    type: "builderMachine",
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    zIndex: 0,
    dragging: false,
    dragHandle: undefined,
    parentId: undefined,
    deletable: true,
    selectable: true,
    sourcePosition: undefined,
    targetPosition: undefined,
  };
  return render(
    <ReactFlowProvider>
      <BuilderMachineNode {...(props as any)} />
    </ReactFlowProvider>,
  );
}

describe("BuilderMachineNode", () => {
  it("shows building name and assign prompt when unassigned", () => {
    renderNode({
      buildingClassName: "Desc_SmelterMk1_C",
      buildingName: "Smelter",
      recipeClassName: null,
      recipeName: null,
      spriteKey: "smelter",
      widthPx: 48,
      depthPx: 96,
      inputItems: [],
      outputItems: [],
      machineCount: 1,
      overclockPercent: 100,
    });

    expect(screen.getByText("Smelter")).toBeDefined();
    expect(screen.getByText("Double-click to assign")).toBeDefined();
  });

  it("shows recipe name when assigned", () => {
    renderNode({
      buildingClassName: "Desc_SmelterMk1_C",
      buildingName: "Smelter",
      recipeClassName: "Recipe_IronIngot_C",
      recipeName: "Iron Ingot",
      spriteKey: "smelter",
      widthPx: 48,
      depthPx: 96,
      inputItems: ["Desc_OreIron_C"],
      outputItems: ["Desc_IronIngot_C"],
      inputItemNames: ["Iron Ore"],
      outputItemNames: ["Iron Ingot"],
      inputRates: [30],
      outputRates: [30],
      machineCount: 1,
      overclockPercent: 100,
    });

    expect(screen.getByText("Iron Ingot")).toBeDefined();
    expect(screen.queryByText("Double-click to assign")).toBeNull();
  });

  it("shows machine count when greater than 1", () => {
    renderNode({
      buildingClassName: "Desc_SmelterMk1_C",
      buildingName: "Smelter",
      recipeClassName: "Recipe_IronIngot_C",
      recipeName: "Iron Ingot",
      spriteKey: "smelter",
      widthPx: 48,
      depthPx: 96,
      inputItems: ["Desc_OreIron_C"],
      outputItems: ["Desc_IronIngot_C"],
      inputItemNames: ["Iron Ore"],
      outputItemNames: ["Iron Ingot"],
      inputRates: [30],
      outputRates: [30],
      machineCount: 3,
      overclockPercent: 100,
    });

    expect(screen.getByText("×3")).toBeDefined();
  });

  it("does not show machine count when 1", () => {
    renderNode({
      buildingClassName: "Desc_SmelterMk1_C",
      buildingName: "Smelter",
      recipeClassName: "Recipe_IronIngot_C",
      recipeName: "Iron Ingot",
      spriteKey: "smelter",
      widthPx: 48,
      depthPx: 96,
      inputItems: [],
      outputItems: [],
      inputItemNames: [],
      outputItemNames: [],
      inputRates: [],
      outputRates: [],
      machineCount: 1,
      overclockPercent: 100,
    });

    expect(screen.queryByText("×1")).toBeNull();
  });

  it("shows input and output rates with /m suffix", () => {
    renderNode({
      buildingClassName: "Desc_SmelterMk1_C",
      buildingName: "Smelter",
      recipeClassName: "Recipe_IronIngot_C",
      recipeName: "Iron Ingot",
      spriteKey: "smelter",
      widthPx: 48,
      depthPx: 96,
      inputItems: ["Desc_OreIron_C"],
      outputItems: ["Desc_IronIngot_C"],
      inputItemNames: ["Iron Ore"],
      outputItemNames: ["Iron Ingot"],
      inputRates: [30],
      outputRates: [30],
      machineCount: 1,
      overclockPercent: 100,
    });

    // Single input/output — shows rate only (no item name)
    const rateLabels = screen.getAllByText("30/m");
    expect(rateLabels.length).toBe(2);
  });

  it("shows item names for multi-input buildings", () => {
    renderNode({
      buildingClassName: "Desc_AssemblerMk1_C",
      buildingName: "Assembler",
      recipeClassName: "Recipe_ModularFrame_C",
      recipeName: "Modular Frame",
      spriteKey: "assembler",
      widthPx: 96,
      depthPx: 96,
      inputItems: ["Desc_IronRod_C", "Desc_IronPlate_C"],
      outputItems: ["Desc_ModularFrame_C"],
      inputItemNames: ["Iron Rod", "Iron Plate"],
      outputItemNames: ["Modular Frame"],
      inputRates: [12, 6],
      outputRates: [2],
      machineCount: 1,
      overclockPercent: 100,
    });

    // Multi-input: shows "ItemName rate/m"
    expect(screen.getByText("Iron Rod 12/m")).toBeDefined();
    expect(screen.getByText("Iron Plate 6/m")).toBeDefined();
    // Single output: shows "rate/m" only
    expect(screen.getByText("2/m")).toBeDefined();
  });
});
