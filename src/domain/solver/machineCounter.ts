/**
 * Calculates the production rate of one machine running a recipe at 100% clock speed.
 * rate_per_machine = (60 / time_seconds) * amount_per_cycle
 */
export function ratePerMachine(
  timeSeconds: number,
  amountPerCycle: number
): number {
  if (timeSeconds <= 0) return 0;
  return (60 / timeSeconds) * amountPerCycle;
}

/**
 * Calculates the exact (fractional) number of machines needed to hit a target rate.
 * machines_needed = target_rate / rate_per_machine
 */
export function exactMachineCount(
  targetRate: number,
  timeSeconds: number,
  amountPerCycle: number
): number {
  const rate = ratePerMachine(timeSeconds, amountPerCycle);
  if (rate === 0) return 0;
  return targetRate / rate;
}

/**
 * Power consumption at a given overclock percentage.
 * power_at_overclock = base_power * (overclock / 100) ^ power_exponent
 */
export function powerAtOverclock(
  basePowerKW: number,
  overclockPercent: number,
  powerExponent: number
): number {
  return basePowerKW * Math.pow(overclockPercent / 100, powerExponent);
}
