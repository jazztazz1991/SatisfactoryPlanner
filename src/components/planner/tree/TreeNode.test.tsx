// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { TreeNode } from "./TreeNode";
import { buildStepTree } from "./ProductionTree";
import type { TreeItem } from "./TreeNode";
import type { IProductionStep } from "@/domain/types/solver";

const ironIngotStep: IProductionStep = {
  recipeClassName: "Recipe_IronIngot_C",
  recipeName: "Iron Ingot",
  buildingClassName: "Smelter",
  buildingName: "Smelter",
  machineCount: 1,
  powerUsageKW: 4,
  inputs: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 30 }],
  outputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
};

const ironPlateStep: IProductionStep = {
  recipeClassName: "Recipe_IronPlate_C",
  recipeName: "Iron Plate",
  buildingClassName: "Constructor",
  buildingName: "Constructor",
  machineCount: 1,
  powerUsageKW: 4,
  inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
  outputs: [{ itemClassName: "Desc_IronPlate_C", itemName: "Iron Plate", rate: 20 }],
};

const ironRodStep: IProductionStep = {
  recipeClassName: "Recipe_IronRod_C",
  recipeName: "Iron Rod",
  buildingClassName: "Constructor",
  buildingName: "Constructor",
  machineCount: 1,
  powerUsageKW: 4,
  inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
  outputs: [{ itemClassName: "Desc_IronRod_C", itemName: "Iron Rod", rate: 15 }],
};

// Pre-built tree items for render tests
const ironIngotItem: TreeItem = { step: ironIngotStep, children: [] };
const ironPlateItem: TreeItem = { step: ironPlateStep, children: [ironIngotItem] };

describe("TreeNode", () => {
  it("renders the step recipe name", () => {
    render(<TreeNode item={ironPlateItem} />);
    expect(screen.getByText("Iron Plate")).toBeInTheDocument();
  });

  it("renders machine count and power", () => {
    render(<TreeNode item={ironPlateItem} />);
    expect(screen.getAllByText(/×1\.00/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/4\.0 kW/).length).toBeGreaterThan(0);
  });

  it("shows collapse button for steps with children", () => {
    render(<TreeNode item={ironPlateItem} />);
    expect(screen.getByRole("button", { name: /collapse iron plate/i })).toBeInTheDocument();
  });

  it("collapses children when collapse button is clicked", async () => {
    render(<TreeNode item={ironPlateItem} />);
    expect(screen.getByText("Iron Ingot")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /collapse iron plate/i }));
    expect(screen.queryByText("Iron Ingot")).not.toBeInTheDocument();
  });

  it("shows expand button when collapsed", async () => {
    render(<TreeNode item={ironPlateItem} />);
    await userEvent.click(screen.getByRole("button", { name: /collapse iron plate/i }));
    expect(screen.getByRole("button", { name: /expand iron plate/i })).toBeInTheDocument();
  });

  it("does not render collapse button for leaf nodes", () => {
    render(<TreeNode item={ironIngotItem} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("buildStepTree", () => {
  it("builds a tree with correct parent-child relationships", () => {
    const visited = new Set<string>();
    const tree = buildStepTree(ironPlateStep, [ironPlateStep, ironIngotStep], visited);
    expect(tree.step.recipeClassName).toBe("Recipe_IronPlate_C");
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0].step.recipeClassName).toBe("Recipe_IronIngot_C");
  });

  it("each shared step appears at most once across the tree", () => {
    // Both ironPlateStep and ironRodStep require ironIngotStep.
    // A parent step that needs both plates and rods would only see ironIngot as a child of whichever comes first.
    const allSteps = [ironPlateStep, ironRodStep, ironIngotStep];
    const visited = new Set<string>();

    const plateTree = buildStepTree(ironPlateStep, allSteps, visited);
    // Iron Ingot is a child of Iron Plate
    expect(plateTree.children[0].step.recipeClassName).toBe("Recipe_IronIngot_C");

    // Now build Iron Rod's tree with the same visited set — Iron Ingot is already visited
    const rodTree = buildStepTree(ironRodStep, allSteps, visited);
    // Iron Rod still renders, but Iron Ingot is NOT duplicated as its child
    expect(rodTree.step.recipeClassName).toBe("Recipe_IronRod_C");
    expect(rodTree.children).toHaveLength(0);
  });
});
