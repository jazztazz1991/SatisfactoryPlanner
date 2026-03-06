/**
 * Maximum belt throughput (items/min) available at each milestone tier.
 *
 * Belt unlocks:
 *   Mk.1 (60/min)   — Tier 0 (tutorial)
 *   Mk.2 (120/min)  — Tier 2 (Logistics Mk.2)
 *   Mk.3 (270/min)  — Tier 4 (Logistics Mk.3)
 *   Mk.4 (480/min)  — Tier 5 (Logistics Mk.4)
 *   Mk.5 (780/min)  — Tier 7 (Logistics Mk.5)
 *   Mk.6 (1320/min) — Tier 9 (Peak Efficiency)
 */
export const MAX_BELT_RATE: Record<number, number> = {
  0: 60,
  1: 60,
  2: 120,
  3: 120,
  4: 270,
  5: 480,
  6: 480,
  7: 780,
  8: 780,
  9: 1320,
} as const;

/** Returns the maximum belt throughput (items/min) for the given tier. */
export function getMaxBeltRate(maxTier: number): number {
  const clamped = Math.max(0, Math.min(9, Math.floor(maxTier)));
  return MAX_BELT_RATE[clamped] ?? 60;
}

/** Returns true if a belt rate exceeds what is available at the given tier. */
export function isBeltOverCapacity(rate: number, maxTier: number): boolean {
  return rate > getMaxBeltRate(maxTier);
}
