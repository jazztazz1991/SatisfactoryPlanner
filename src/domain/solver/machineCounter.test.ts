import { describe, it, expect } from "vitest";
import { ratePerMachine, exactMachineCount, powerAtOverclock } from "./machineCounter";

describe("ratePerMachine", () => {
  it("calculates rate for a 4-second recipe producing 1 item", () => {
    // (60/4) * 1 = 15 items/min
    expect(ratePerMachine(4, 1)).toBe(15);
  });

  it("calculates rate for a 12-second recipe producing 3 items", () => {
    // (60/12) * 3 = 15 items/min
    expect(ratePerMachine(12, 3)).toBe(15);
  });

  it("returns 0 when timeSeconds is 0", () => {
    expect(ratePerMachine(0, 1)).toBe(0);
  });

  it("handles fractional amounts", () => {
    // (60/6) * 2 = 20
    expect(ratePerMachine(6, 2)).toBeCloseTo(20);
  });
});

describe("exactMachineCount", () => {
  it("returns 1 for target matching exactly one machine rate", () => {
    // rate = 15/min, target = 15 → 1 machine
    expect(exactMachineCount(15, 4, 1)).toBe(1);
  });

  it("returns fractional count when rate doesn't divide evenly", () => {
    // rate = 15/min, target = 22.5 → 1.5 machines
    expect(exactMachineCount(22.5, 4, 1)).toBeCloseTo(1.5);
  });

  it("returns 0 when target rate is 0", () => {
    expect(exactMachineCount(0, 4, 1)).toBe(0);
  });

  it("returns 0 when recipe has 0 time", () => {
    expect(exactMachineCount(15, 0, 1)).toBe(0);
  });
});

describe("powerAtOverclock", () => {
  it("returns base power at 100% overclock", () => {
    expect(powerAtOverclock(30, 100, 1.6)).toBeCloseTo(30);
  });

  it("returns less power at 50% overclock (exponent 1.6)", () => {
    // 30 * (0.5)^1.6 ≈ 30 * 0.3299 ≈ 9.9
    expect(powerAtOverclock(30, 50, 1.6)).toBeCloseTo(9.9, 1);
  });

  it("returns more power at 150% overclock", () => {
    // 30 * (1.5)^1.6 > 30
    expect(powerAtOverclock(30, 150, 1.6)).toBeGreaterThan(30);
  });

  it("scales linearly with exponent 1", () => {
    expect(powerAtOverclock(100, 50, 1)).toBeCloseTo(50);
  });
});
