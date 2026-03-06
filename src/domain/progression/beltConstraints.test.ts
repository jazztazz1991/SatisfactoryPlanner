import { describe, it, expect } from "vitest";
import { getMaxBeltRate, isBeltOverCapacity } from "./beltConstraints";

describe("getMaxBeltRate", () => {
  it("returns 60 for tier 0 (Mk.1 belts)", () => {
    expect(getMaxBeltRate(0)).toBe(60);
  });

  it("returns 60 for tier 1 (no new belt unlocked)", () => {
    expect(getMaxBeltRate(1)).toBe(60);
  });

  it("returns 120 for tier 2 (Mk.2 belts)", () => {
    expect(getMaxBeltRate(2)).toBe(120);
  });

  it("returns 270 for tier 4 (Mk.3 belts)", () => {
    expect(getMaxBeltRate(4)).toBe(270);
  });

  it("returns 480 for tier 5 (Mk.4 belts)", () => {
    expect(getMaxBeltRate(5)).toBe(480);
  });

  it("returns 780 for tier 7 (Mk.5 belts)", () => {
    expect(getMaxBeltRate(7)).toBe(780);
  });

  it("returns 1320 for tier 9 (Mk.6 belts)", () => {
    expect(getMaxBeltRate(9)).toBe(1320);
  });

  it("clamps negative values to tier 0", () => {
    expect(getMaxBeltRate(-1)).toBe(60);
  });

  it("clamps values above 9 to tier 9", () => {
    expect(getMaxBeltRate(99)).toBe(1320);
  });
});

describe("isBeltOverCapacity", () => {
  it("returns false when rate is within capacity", () => {
    expect(isBeltOverCapacity(60, 0)).toBe(false);
    expect(isBeltOverCapacity(120, 2)).toBe(false);
    expect(isBeltOverCapacity(480, 5)).toBe(false);
  });

  it("returns true when rate exceeds capacity", () => {
    expect(isBeltOverCapacity(61, 0)).toBe(true);
    expect(isBeltOverCapacity(270, 2)).toBe(true);
    expect(isBeltOverCapacity(121, 2)).toBe(true);
  });

  it("returns false for any rate at tier 9 up to 1320", () => {
    expect(isBeltOverCapacity(1320, 9)).toBe(false);
    expect(isBeltOverCapacity(1321, 9)).toBe(true);
  });
});
