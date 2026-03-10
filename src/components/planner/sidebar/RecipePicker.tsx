"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { IRecipe } from "@/domain/types/game";
import { Spinner } from "@/components/shared/Spinner";
import { Input } from "@/components/shared/Input";
import { useCanvasStore } from "@/store/canvasStore";
import { getAvailableRecipes } from "@/domain/progression/tierRecipeMap";

async function fetchRecipes(): Promise<IRecipe[]> {
  const res = await fetch("/api/game-data/recipes");
  if (!res.ok) throw new Error("Failed to load recipes");
  return res.json();
}

interface RecipePickerProps {
  onSelect: (recipe: IRecipe) => void;
}

export function RecipePicker({ onSelect }: RecipePickerProps) {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["recipes"], queryFn: fetchRecipes });
  const maxTier = useCanvasStore((s) => s.maxTier);

  const availableRecipes = useMemo(() => getAvailableRecipes(maxTier), [maxTier]);

  const filtered = (data ?? [])
    .filter((r) => availableRecipes.has(r.className))
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-3 p-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-content-muted">Add Recipe</h2>
      <Input
        id="recipe-search"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search recipes"
      />
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto" role="listbox" aria-label="Recipes">
          {filtered.map((recipe) => (
            <li key={recipe.className}>
              <button
                role="option"
                aria-selected={false}
                onClick={() => onSelect(recipe)}
                className="w-full rounded-xl px-2 py-1.5 text-left text-sm text-content-secondary hover:bg-brand-muted flex items-center gap-2"
              >
                <span>{recipe.name}</span>
                {recipe.isAlternate && (
                  <span className="ml-auto rounded-full bg-accent-muted border border-accent/20 px-1.5 text-[10px] font-bold text-accent-light uppercase">Alt</span>
                )}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-2 py-2 text-sm text-content-muted">No recipes found</li>
          )}
        </ul>
      )}
    </div>
  );
}
