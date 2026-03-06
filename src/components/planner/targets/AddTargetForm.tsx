"use client";
import { useState } from "react";
import { Button } from "@/components/shared/Button";
import type { IItem } from "@/domain/types/game";

interface AddTargetFormProps {
  items: IItem[];
  onAdd: (itemClassName: string, targetRate: number) => void;
  loading?: boolean;
}

export function AddTargetForm({ items, onAdd, loading }: AddTargetFormProps) {
  const [search, setSearch] = useState("");
  const [rate, setRate] = useState(1);
  const [selectedItem, setSelectedItem] = useState<IItem | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = search.length > 0
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())).slice(0, 20)
    : [];

  function handleSelect(item: IItem) {
    setSelectedItem(item);
    setSearch(item.name);
    setShowSuggestions(false);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setSelectedItem(null);
    setShowSuggestions(value.length > 0);
  }

  function handleAdd() {
    if (!selectedItem) return;
    onAdd(selectedItem.className, rate);
    setSearch("");
    setRate(1);
    setSelectedItem(null);
    setShowSuggestions(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {showSuggestions && filtered.length > 0 && (
          <ul
            role="listbox"
            aria-label="Item suggestions"
            className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border border-gray-600 bg-gray-800 shadow-lg"
          >
            {filtered.map((item) => (
              <li key={item.className}>
                <button
                  role="option"
                  aria-selected={false}
                  onClick={() => handleSelect(item)}
                  className="w-full px-3 py-1.5 text-left text-sm text-gray-200 hover:bg-gray-700"
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="add-target-rate" className="text-xs text-gray-400">
            Rate (per min)
          </label>
          <input
            id="add-target-rate"
            type="number"
            min={0.01}
            step={1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!selectedItem}
          loading={loading}
          aria-label="Add target"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
