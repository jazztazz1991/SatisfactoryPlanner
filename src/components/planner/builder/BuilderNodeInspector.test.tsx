// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBuilderStore } from "@/store/builderStore";
import { BuilderNodeInspector } from "./BuilderNodeInspector";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderInspector() {
  return render(
    <QueryClientProvider client={queryClient}>
      <BuilderNodeInspector onReassignRecipe={() => {}} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  useBuilderStore.getState().reset();
});

describe("BuilderNodeInspector", () => {
  it("shows empty message when no node selected", () => {
    renderInspector();
    expect(screen.getByText("Select a node to inspect.")).toBeDefined();
  });

  it("shows building name when machine node is selected", () => {
    const store = useBuilderStore.getState();
    store.setNodes([
      {
        id: "n1",
        type: "builderMachine",
        position: { x: 0, y: 0 },
        data: {
          buildingClassName: "Desc_SmelterMk1_C",
          buildingName: "Smelter",
          recipeClassName: "Recipe_IronIngot_C",
          recipeName: "Iron Ingot",
          spriteKey: "smelter",
          widthPx: 48,
          depthPx: 96,
          inputItems: [],
          outputItems: [],
          inputRates: [],
          outputRates: [],
          machineCount: 1,
          overclockPercent: 100,
        },
      },
    ]);
    store.setSelectedNodeId("n1");

    renderInspector();
    expect(screen.getByText("Smelter")).toBeDefined();
    expect(screen.getByText("Iron Ingot")).toBeDefined();
    expect(screen.getByLabelText("Machine count")).toBeDefined();
    expect(screen.getByLabelText("Overclock percent")).toBeDefined();
  });

  it("shows assign recipe button for unassigned node", () => {
    const store = useBuilderStore.getState();
    store.setNodes([
      {
        id: "n1",
        type: "builderMachine",
        position: { x: 0, y: 0 },
        data: {
          buildingClassName: "Desc_SmelterMk1_C",
          buildingName: "Smelter",
          recipeClassName: null,
          recipeName: null,
          spriteKey: "smelter",
          widthPx: 48,
          depthPx: 96,
          inputItems: [],
          outputItems: [],
          inputRates: [],
          outputRates: [],
          machineCount: 1,
          overclockPercent: 100,
        },
      },
    ]);
    store.setSelectedNodeId("n1");

    renderInspector();
    expect(screen.getByText("Assign Recipe")).toBeDefined();
  });

  it("shows rate input for resource node", () => {
    const store = useBuilderStore.getState();
    store.setNodes([
      {
        id: "r1",
        type: "factoryResource",
        position: { x: 0, y: 0 },
        data: {
          itemClassName: "Desc_OreIron_C",
          itemName: "Iron Ore",
          rate: 60,
        },
      },
    ]);
    store.setSelectedNodeId("r1");

    renderInspector();
    expect(screen.getByText("Iron Ore")).toBeDefined();
    expect(screen.getByText("Resource Source")).toBeDefined();
    expect(screen.getByLabelText("Resource rate")).toBeDefined();
    expect((screen.getByLabelText("Resource rate") as HTMLInputElement).value).toBe("60");
  });
});
