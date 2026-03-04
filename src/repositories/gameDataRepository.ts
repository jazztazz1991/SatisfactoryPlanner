import "@/models";
import { GameItem } from "@/models/GameItem";
import { GameBuilding } from "@/models/GameBuilding";
import { GameRecipe } from "@/models/GameRecipe";
import { GameRecipeIngredient } from "@/models/GameRecipeIngredient";
import { GameRecipeProduct } from "@/models/GameRecipeProduct";
import type { IItem, IBuilding, IRecipe } from "@/domain/types/game";

// Game data is static — cache it in memory so we only hit the DB once per
// server process lifetime instead of on every API request.
let _items: IItem[] | null = null;
let _buildings: IBuilding[] | null = null;
let _recipes: IRecipe[] | null = null;

export async function getAllItems(): Promise<IItem[]> {
  if (_items) return _items;
  const rows = await GameItem.findAll({ order: [["name", "ASC"]] });
  _items = rows.map(itemToDTO);
  return _items;
}

export async function getAllBuildings(): Promise<IBuilding[]> {
  if (_buildings) return _buildings;
  const rows = await GameBuilding.findAll({ order: [["name", "ASC"]] });
  _buildings = rows.map(buildingToDTO);
  return _buildings;
}

type GameRecipeWithAssociations = GameRecipe & {
  ingredients: GameRecipeIngredient[];
  products: GameRecipeProduct[];
};

export async function getAllRecipes(): Promise<IRecipe[]> {
  if (_recipes) return _recipes;
  const rows = (await GameRecipe.findAll({
    include: [
      { model: GameRecipeIngredient, as: "ingredients" },
      { model: GameRecipeProduct, as: "products" },
    ],
    order: [["name", "ASC"]],
  })) as GameRecipeWithAssociations[];
  _recipes = rows.map(recipeToDTO);
  return _recipes;
}

function itemToDTO(row: GameItem): IItem {
  return {
    className: row.className,
    slug: row.slug,
    name: row.name,
    description: row.description,
    stackSize: row.stackSize,
    sinkPoints: row.sinkPoints,
    energyValue: row.energyValue,
    radioactiveDecay: row.radioactiveDecay,
    isLiquid: row.isLiquid,
    fluidColor: row.fluidColor as IItem["fluidColor"],
    isRawResource: row.isRawResource,
  };
}

function buildingToDTO(row: GameBuilding): IBuilding {
  return {
    className: row.className,
    slug: row.slug,
    name: row.name,
    description: row.description,
    powerConsumption: Number(row.powerConsumption),
    powerConsumptionExponent: Number(row.powerConsumptionExponent),
    manufacturingSpeed: Number(row.manufacturingSpeed),
  };
}

function recipeToDTO(row: GameRecipeWithAssociations): IRecipe {
  return {
    className: row.className,
    slug: row.slug,
    name: row.name,
    isAlternate: row.isAlternate,
    timeSeconds: Number(row.timeSeconds),
    producedInClass: row.producedInClass,
    ingredients: (row.ingredients ?? []).map((ing) => ({
      recipeClassName: row.className,
      itemClassName: ing.itemClassName,
      amountPerCycle: Number(ing.amountPerCycle),
    })),
    products: (row.products ?? []).map((prod) => ({
      recipeClassName: row.className,
      itemClassName: prod.itemClassName,
      amountPerCycle: Number(prod.amountPerCycle),
    })),
  };
}
