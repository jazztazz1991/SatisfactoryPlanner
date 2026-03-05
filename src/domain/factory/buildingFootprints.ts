/** Building footprint in foundation units (1 foundation = 8m × 8m). */
export interface BuildingFootprint {
  /** Width in foundations (perpendicular to belt flow, left-right on screen). */
  w: number;
  /** Depth in foundations (along belt flow, top-bottom on screen). */
  d: number;
}

const FOOTPRINTS: Record<string, BuildingFootprint> = {
  Desc_SmelterMk1_C: { w: 1, d: 2 },
  Desc_ConstructorMk1_C: { w: 1, d: 2 },
  Desc_AssemblerMk1_C: { w: 2, d: 2 },
  Desc_ManufacturerMk1_C: { w: 2, d: 3 },
  Desc_FoundryMk1_C: { w: 1, d: 2 },
  Desc_OilRefinery_C: { w: 3, d: 2 },
  Desc_Blender_C: { w: 2, d: 2 },
  Desc_Packager_C: { w: 1, d: 1 },
  Desc_HadronCollider_C: { w: 3, d: 5 },
  Desc_MinerMk1_C: { w: 1, d: 2 },
  Desc_MinerMk2_C: { w: 1, d: 2 },
  Desc_MinerMk3_C: { w: 1, d: 2 },
};

const DEFAULT_FOOTPRINT: BuildingFootprint = { w: 1, d: 1 };

export function getBuildingFootprint(buildingClassName: string | null): BuildingFootprint {
  if (!buildingClassName) return DEFAULT_FOOTPRINT;
  return FOOTPRINTS[buildingClassName] ?? DEFAULT_FOOTPRINT;
}
