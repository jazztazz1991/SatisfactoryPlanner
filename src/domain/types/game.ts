export interface IItem {
  className: string;
  slug: string;
  name: string;
  description: string | null;
  stackSize: number | null;
  sinkPoints: number | null;
  energyValue: number | null;
  radioactiveDecay: number | null;
  isLiquid: boolean;
  fluidColor: { r: number; g: number; b: number; a: number } | null;
  isRawResource: boolean;
}

export interface IBuilding {
  className: string;
  slug: string;
  name: string;
  description: string | null;
  powerConsumption: number;
  powerConsumptionExponent: number;
  manufacturingSpeed: number;
}

export interface IIngredient {
  recipeClassName: string;
  itemClassName: string;
  amountPerCycle: number;
}

export interface IProduct {
  recipeClassName: string;
  itemClassName: string;
  amountPerCycle: number;
}

export interface IRecipe {
  className: string;
  slug: string;
  name: string;
  isAlternate: boolean;
  timeSeconds: number;
  producedInClass: string | null;
  ingredients: IIngredient[];
  products: IProduct[];
}
