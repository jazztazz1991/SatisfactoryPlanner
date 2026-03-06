/**
 * One-time script to extract milestone recipe unlocks from satisfactory-data.json
 * and output a TypeScript constant for src/domain/progression/tierRecipeMap.ts
 *
 * Usage: node scripts/extract-tier-data.js
 */
const data = require('../db/data/satisfactory-data.json');
const schematics = data.schematics;
const recipes = data.recipes;

// Only include main progression gates (milestones + tutorial)
const progressionTypes = new Set(['EST_Milestone', 'EST_Tutorial']);

// Collect all recipe classNames unlocked by ANY schematic
const unlockedBySchematic = new Set();
for (const s of Object.values(schematics)) {
  const recs = (s.unlock && s.unlock.recipes) ? s.unlock.recipes : [];
  recs.forEach(r => unlockedBySchematic.add(r));
}

// Find machine-producible recipes NOT gated by any schematic → treat as tier 0
// These are recipes available from the start (e.g. Iron Ingot, Iron Plate, Iron Rod)
const alwaysAvailable = [];
for (const [className, recipe] of Object.entries(recipes)) {
  if (unlockedBySchematic.has(className)) continue;
  // Only include recipes that have a machine producer (skip building/structure recipes)
  const producers = recipe.producedIn || [];
  if (producers.length > 0) {
    alwaysAvailable.push(className);
  }
}

// Group recipe unlocks by tier
const tierRecipes = {};
for (let t = 0; t <= 9; t++) tierRecipes[t] = [];

// Add always-available recipes to tier 0
tierRecipes[0].push(...alwaysAvailable);

for (const s of Object.values(schematics)) {
  if (!progressionTypes.has(s.type)) continue;
  const tier = s.tier;
  if (tier == null || tier < 0 || tier > 9) continue;
  const recs = (s.unlock && s.unlock.recipes) ? s.unlock.recipes : [];
  tierRecipes[tier].push(...recs);
}

// Deduplicate per tier
for (let t = 0; t <= 9; t++) {
  tierRecipes[t] = [...new Set(tierRecipes[t])].sort();
}

// Build cumulative sets
const cumulative = {};
let accum = [];
for (let t = 0; t <= 9; t++) {
  accum = [...new Set([...accum, ...tierRecipes[t]])].sort();
  cumulative[t] = accum;
}

// Output TypeScript
console.log('/**');
console.log(' * Auto-generated from db/data/satisfactory-data.json');
console.log(' * by scripts/extract-tier-data.js');
console.log(' *');
console.log(' * Cumulative recipe classNames unlocked at each milestone tier.');
console.log(' * Includes EST_Milestone, EST_Tutorial schematics, and always-available machine recipes.');
console.log(' */');
console.log('');
console.log('export const TIER_RECIPES: Record<number, readonly string[]> = {');
for (let t = 0; t <= 9; t++) {
  const recipes = cumulative[t];
  console.log(`  ${t}: [`);
  for (const r of recipes) {
    console.log(`    "${r}",`);
  }
  console.log('  ],');
}
console.log('} as const;');

// Print stats
console.error('\n--- Stats ---');
for (let t = 0; t <= 9; t++) {
  console.error(`Tier ${t}: ${tierRecipes[t].length} new recipes, ${cumulative[t].length} cumulative`);
}
