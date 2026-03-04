// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProductionTree } from "./ProductionTree";
import { useCanvasStore } from "@/store/canvasStore";
import type { ISolverOutput } from "@/domain/types/solver";

vi.mock("@/store/canvasStore");

const mockResult: ISolverOutput = {
  steps: [
    {
      recipeClassName: "Recipe_IronPlate_C",
      recipeName: "Iron Plate",
      buildingClassName: "Constructor",
      buildingName: "Constructor",
      machineCount: 1,
      powerUsageKW: 4,
      inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
      outputs: [{ itemClassName: "Desc_IronPlate_C", itemName: "Iron Plate", rate: 20 }],
    },
  ],
  rawResources: [
    { itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 30 },
  ],
  totalPowerKW: 8,
};

describe("ProductionTree", () => {
  it("shows placeholder when no solver result", () => {
    vi.mocked(useCanvasStore).mockReturnValue({ solverResult: null } as ReturnType<typeof useCanvasStore>);
    render(<ProductionTree />);
    expect(screen.getByText(/calculate your production chain/i)).toBeInTheDocument();
  });

  it("renders production steps", () => {
    vi.mocked(useCanvasStore).mockReturnValue({ solverResult: mockResult } as ReturnType<typeof useCanvasStore>);
    render(<ProductionTree />);
    expect(screen.getByRole("tree")).toBeInTheDocument();
    expect(screen.getByText("Iron Plate")).toBeInTheDocument();
  });

  it("shows total power", () => {
    vi.mocked(useCanvasStore).mockReturnValue({ solverResult: mockResult } as ReturnType<typeof useCanvasStore>);
    render(<ProductionTree />);
    expect(screen.getByText(/8\.0 kW total/)).toBeInTheDocument();
  });

  it("shows raw resources", () => {
    vi.mocked(useCanvasStore).mockReturnValue({ solverResult: mockResult } as ReturnType<typeof useCanvasStore>);
    render(<ProductionTree />);
    expect(screen.getByText("Iron Ore")).toBeInTheDocument();
    expect(screen.getByText("30.00/min")).toBeInTheDocument();
  });
});
