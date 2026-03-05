import { describe, it, expect } from "vitest";
import { getBuildingFootprint } from "./buildingFootprints";

describe("getBuildingFootprint", () => {
  it("returns correct footprint for Smelter", () => {
    expect(getBuildingFootprint("Desc_SmelterMk1_C")).toEqual({ w: 1, d: 2 });
  });

  it("returns correct footprint for Constructor", () => {
    expect(getBuildingFootprint("Desc_ConstructorMk1_C")).toEqual({ w: 1, d: 2 });
  });

  it("returns correct footprint for Assembler", () => {
    expect(getBuildingFootprint("Desc_AssemblerMk1_C")).toEqual({ w: 2, d: 2 });
  });

  it("returns correct footprint for Manufacturer", () => {
    expect(getBuildingFootprint("Desc_ManufacturerMk1_C")).toEqual({ w: 2, d: 3 });
  });

  it("returns correct footprint for Foundry", () => {
    expect(getBuildingFootprint("Desc_FoundryMk1_C")).toEqual({ w: 1, d: 2 });
  });

  it("returns correct footprint for Refinery", () => {
    expect(getBuildingFootprint("Desc_OilRefinery_C")).toEqual({ w: 3, d: 2 });
  });

  it("returns correct footprint for Blender", () => {
    expect(getBuildingFootprint("Desc_Blender_C")).toEqual({ w: 2, d: 2 });
  });

  it("returns correct footprint for Packager", () => {
    expect(getBuildingFootprint("Desc_Packager_C")).toEqual({ w: 1, d: 1 });
  });

  it("returns correct footprint for Particle Accelerator", () => {
    expect(getBuildingFootprint("Desc_HadronCollider_C")).toEqual({ w: 3, d: 5 });
  });

  it("returns correct footprint for Miner variants", () => {
    expect(getBuildingFootprint("Desc_MinerMk1_C")).toEqual({ w: 1, d: 2 });
    expect(getBuildingFootprint("Desc_MinerMk2_C")).toEqual({ w: 1, d: 2 });
    expect(getBuildingFootprint("Desc_MinerMk3_C")).toEqual({ w: 1, d: 2 });
  });

  it("returns default 1x1 for unknown building", () => {
    expect(getBuildingFootprint("Desc_Unknown_C")).toEqual({ w: 1, d: 1 });
  });

  it("returns default 1x1 for null", () => {
    expect(getBuildingFootprint(null)).toEqual({ w: 1, d: 1 });
  });
});
