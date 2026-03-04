// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecipePicker } from "./RecipePicker";
import type { IRecipe } from "@/domain/types/game";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

const mockRecipes: IRecipe[] = [
  {
    className: "Recipe_IronIngot_C",
    slug: "iron-ingot",
    name: "Iron Ingot",
    isAlternate: false,
    timeSeconds: 2,
    producedInClass: "Smelter",
    ingredients: [],
    products: [],
  },
  {
    className: "Recipe_Alternate_IronIngot_C",
    slug: "pure-iron-ingot",
    name: "Pure Iron Ingot",
    isAlternate: true,
    timeSeconds: 12,
    producedInClass: "Refinery",
    ingredients: [],
    products: [],
  },
];

describe("RecipePicker", () => {
  beforeEach(async () => {
    const { useQuery } = await import("@tanstack/react-query");
    vi.mocked(useQuery).mockReturnValue({
      data: mockRecipes,
      isLoading: false,
    } as ReturnType<typeof useQuery>);
  });

  it("renders search input", () => {
    render(<RecipePicker onSelect={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: /search recipes/i })).toBeInTheDocument();
  });

  it("renders list of recipes", () => {
    render(<RecipePicker onSelect={vi.fn()} />);
    // Both "Iron Ingot" and "Pure Iron Ingot" are present
    expect(screen.getAllByRole("option").length).toBe(2);
    expect(screen.getByRole("option", { name: /^iron ingot$/i })).toBeInTheDocument();
  });

  it("marks alternate recipes", () => {
    render(<RecipePicker onSelect={vi.fn()} />);
    expect(screen.getByText("Alt")).toBeInTheDocument();
  });

  it("filters recipes by search term", async () => {
    render(<RecipePicker onSelect={vi.fn()} />);
    await userEvent.type(screen.getByRole("textbox", { name: /search/i }), "Pure");
    expect(screen.getByRole("option", { name: /pure iron ingot/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /^Iron Ingot/i })).not.toBeInTheDocument();
  });

  it("calls onSelect with recipe when clicked", async () => {
    const onSelect = vi.fn();
    render(<RecipePicker onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("option", { name: /^iron ingot/i }));
    expect(onSelect).toHaveBeenCalledWith(mockRecipes[0]);
  });

  it("shows empty state when no recipes match", async () => {
    render(<RecipePicker onSelect={vi.fn()} />);
    await userEvent.type(screen.getByRole("textbox", { name: /search/i }), "xyz999");
    expect(screen.getByText(/no recipes found/i)).toBeInTheDocument();
  });
});
