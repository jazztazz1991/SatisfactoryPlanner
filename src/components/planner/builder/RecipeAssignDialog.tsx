"use client";

import { useState, useMemo } from "react";
import type { IRecipe } from "@/domain/types/game";

interface RecipeAssignDialogProps {
  open: boolean;
  buildingClassName: string | null;
  recipes: IRecipe[];
  onSelect: (recipe: IRecipe) => void;
  onClose: () => void;
}

export function RecipeAssignDialog({ open, buildingClassName, recipes, onSelect, onClose }: RecipeAssignDialogProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = recipes;
    if (buildingClassName) {
      list = list.filter((r) => r.producedInClass === buildingClassName);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    return list;
  }, [recipes, buildingClassName, search]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-label="Assign Recipe"
    >
      <div className="w-80 max-h-[70vh] flex flex-col glass glass-border rounded-2xl shadow-card">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-content-muted">Assign Recipe</h3>
          <button
            onClick={onClose}
            className="text-content-secondary hover:text-content"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-2">
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-surface-border bg-surface-overlay px-3 py-1.5 text-sm text-content placeholder-content-muted focus:outline-none focus:glow-ring"
            autoFocus
            aria-label="Search recipes"
          />
        </div>

        <ul className="flex-1 overflow-y-auto px-2 pb-2" role="listbox" aria-label="Recipes">
          {filtered.length === 0 && (
            <li className="px-2 py-3 text-center text-xs text-content-muted">No recipes found</li>
          )}
          {filtered.map((r) => (
            <li key={r.className}>
              <button
                onClick={() => { onSelect(r); setSearch(""); }}
                className="w-full rounded-xl px-3 py-1.5 text-left text-sm text-content-secondary hover:bg-brand-muted transition-colors"
                role="option"
                aria-selected={false}
              >
                {r.name}
                {r.isAlternate && <span className="ml-1 rounded-full bg-accent-muted border border-accent/20 px-1.5 text-[10px] font-bold text-accent-light uppercase">Alt</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
