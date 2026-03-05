import { describe, it, expect } from "vitest";
import { getSpriteKey, getSpriteLabel } from "./buildingSprites";

describe("getSpriteKey", () => {
  it("maps Smelter class to smelter key", () => {
    expect(getSpriteKey("Desc_SmelterMk1_C")).toBe("smelter");
  });

  it("maps Constructor class to constructor key", () => {
    expect(getSpriteKey("Desc_ConstructorMk1_C")).toBe("constructor");
  });

  it("maps Assembler class to assembler key", () => {
    expect(getSpriteKey("Desc_AssemblerMk1_C")).toBe("assembler");
  });

  it("maps all Miner tiers to miner key", () => {
    expect(getSpriteKey("Desc_MinerMk1_C")).toBe("miner");
    expect(getSpriteKey("Desc_MinerMk2_C")).toBe("miner");
    expect(getSpriteKey("Desc_MinerMk3_C")).toBe("miner");
  });

  it("returns unknown for null", () => {
    expect(getSpriteKey(null)).toBe("unknown");
  });

  it("returns unknown for unrecognized class", () => {
    expect(getSpriteKey("Desc_SomeFutureBuilding_C")).toBe("unknown");
  });
});

describe("getSpriteLabel", () => {
  it("returns human-readable label for known keys", () => {
    expect(getSpriteLabel("smelter")).toBe("Smelter");
    expect(getSpriteLabel("particle_accelerator")).toBe("Particle Accelerator");
  });

  it("returns Building for unknown key", () => {
    expect(getSpriteLabel("unknown")).toBe("Building");
  });
});
