// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeAssignDialog } from "./RecipeAssignDialog";
import type { IRecipe } from "@/domain/types/game";

const RECIPES: IRecipe[] = [
  {
    className: "Recipe_IronIngot_C",
    slug: "iron-ingot",
    name: "Iron Ingot",
    isAlternate: false,
    timeSeconds: 2,
    producedInClass: "Desc_SmelterMk1_C",
    ingredients: [{ recipeClassName: "Recipe_IronIngot_C", itemClassName: "Desc_OreIron_C", amountPerCycle: 1 }],
    products: [{ recipeClassName: "Recipe_IronIngot_C", itemClassName: "Desc_IronIngot_C", amountPerCycle: 1 }],
  },
  {
    className: "Recipe_CopperIngot_C",
    slug: "copper-ingot",
    name: "Copper Ingot",
    isAlternate: false,
    timeSeconds: 2,
    producedInClass: "Desc_SmelterMk1_C",
    ingredients: [{ recipeClassName: "Recipe_CopperIngot_C", itemClassName: "Desc_OreCobalt_C", amountPerCycle: 1 }],
    products: [{ recipeClassName: "Recipe_CopperIngot_C", itemClassName: "Desc_CopperIngot_C", amountPerCycle: 1 }],
  },
  {
    className: "Recipe_IronPlate_C",
    slug: "iron-plate",
    name: "Iron Plate",
    isAlternate: false,
    timeSeconds: 6,
    producedInClass: "Desc_ConstructorMk1_C",
    ingredients: [{ recipeClassName: "Recipe_IronPlate_C", itemClassName: "Desc_IronIngot_C", amountPerCycle: 3 }],
    products: [{ recipeClassName: "Recipe_IronPlate_C", itemClassName: "Desc_IronPlate_C", amountPerCycle: 2 }],
  },
];

describe("RecipeAssignDialog", () => {
  it("does not render when closed", () => {
    render(
      <RecipeAssignDialog
        open={false}
        buildingClassName={null}
        recipes={RECIPES}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.queryByText("Assign Recipe")).toBeNull();
  });

  it("filters recipes by building class", () => {
    render(
      <RecipeAssignDialog
        open={true}
        buildingClassName="Desc_SmelterMk1_C"
        recipes={RECIPES}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("Iron Ingot")).toBeDefined();
    expect(screen.getByText("Copper Ingot")).toBeDefined();
    expect(screen.queryByText("Iron Plate")).toBeNull();
  });

  it("filters by search text", async () => {
    const user = userEvent.setup();
    render(
      <RecipeAssignDialog
        open={true}
        buildingClassName={null}
        recipes={RECIPES}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );

    await user.type(screen.getByLabelText("Search recipes"), "copper");
    expect(screen.getByText("Copper Ingot")).toBeDefined();
    expect(screen.queryByText("Iron Ingot")).toBeNull();
  });

  it("calls onSelect when a recipe is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <RecipeAssignDialog
        open={true}
        buildingClassName="Desc_SmelterMk1_C"
        recipes={RECIPES}
        onSelect={onSelect}
        onClose={() => {}}
      />,
    );

    await user.click(screen.getByText("Iron Ingot"));
    expect(onSelect).toHaveBeenCalledWith(RECIPES[0]);
  });
});
