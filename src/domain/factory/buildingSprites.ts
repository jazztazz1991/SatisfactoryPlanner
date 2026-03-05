export type SpriteKey =
  | "smelter"
  | "constructor"
  | "assembler"
  | "manufacturer"
  | "foundry"
  | "refinery"
  | "blender"
  | "packager"
  | "particle_accelerator"
  | "miner"
  | "splitter"
  | "merger"
  | "unknown";

const CLASS_TO_SPRITE: Record<string, SpriteKey> = {
  Desc_SmelterMk1_C: "smelter",
  Desc_ConstructorMk1_C: "constructor",
  Desc_AssemblerMk1_C: "assembler",
  Desc_ManufacturerMk1_C: "manufacturer",
  Desc_FoundryMk1_C: "foundry",
  Desc_OilRefinery_C: "refinery",
  Desc_Blender_C: "blender",
  Desc_Packager_C: "packager",
  Desc_HadronCollider_C: "particle_accelerator",
  Desc_MinerMk1_C: "miner",
  Desc_MinerMk2_C: "miner",
  Desc_MinerMk3_C: "miner",
};

export function getSpriteKey(buildingClassName: string | null): SpriteKey {
  if (!buildingClassName) return "unknown";
  return CLASS_TO_SPRITE[buildingClassName] ?? "unknown";
}

const SPRITE_LABELS: Record<SpriteKey, string> = {
  smelter: "Smelter",
  constructor: "Constructor",
  assembler: "Assembler",
  manufacturer: "Manufacturer",
  foundry: "Foundry",
  refinery: "Refinery",
  blender: "Blender",
  packager: "Packager",
  particle_accelerator: "Particle Accelerator",
  miner: "Miner",
  splitter: "Splitter",
  merger: "Merger",
  unknown: "Building",
};

export function getSpriteLabel(key: SpriteKey): string {
  return SPRITE_LABELS[key];
}
