import type { IRecipe, IItem, IBuilding } from "./game";

export interface ISolverInput {
  targets: Array<{ itemClassName: string; targetRate: number }>;
  recipeMap: Map<string, IRecipe>;
  itemMap: Map<string, IItem>;
  buildingMap: Map<string, IBuilding>;
  enabledAlternates: Set<string>;
  overclockPercent: number;
}

export interface IProductionStep {
  recipeClassName: string;
  recipeName: string;
  buildingClassName: string | null;
  buildingName: string | null;
  machineCount: number;
  powerUsageKW: number;
  inputs: Array<{ itemClassName: string; itemName: string; rate: number }>;
  outputs: Array<{ itemClassName: string; itemName: string; rate: number }>;
}

export interface IRawResourceRequirement {
  itemClassName: string;
  itemName: string;
  rate: number;
}

export interface ISolverOutput {
  steps: IProductionStep[];
  rawResources: IRawResourceRequirement[];
  totalPowerKW: number;
}

export class CycleDetectedError extends Error {
  constructor(className: string) {
    super(`Cycle detected while resolving item: ${className}`);
    this.name = "CycleDetectedError";
  }
}
