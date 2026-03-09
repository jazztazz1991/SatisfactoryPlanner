const BELT_TIERS = [
  { maxRate: 60, tier: 1 },
  { maxRate: 120, tier: 2 },
  { maxRate: 270, tier: 3 },
  { maxRate: 480, tier: 4 },
  { maxRate: 780, tier: 5 },
  { maxRate: 1320, tier: 6 },
] as const;

export function getBeltTier(rate: number): 1 | 2 | 3 | 4 | 5 | 6 {
  for (const { maxRate, tier } of BELT_TIERS) {
    if (rate <= maxRate) return tier;
  }
  return 6;
}
