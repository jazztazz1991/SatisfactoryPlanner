"use client";
import { useState } from "react";
import type { IPlanTarget } from "@/domain/types/plan";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";

interface TargetRowProps {
  target: IPlanTarget;
  itemName: string;
  onUpdate: (id: string, rate: number) => void;
  onDelete: (id: string) => void;
}

export function TargetRow({ target, itemName, onUpdate, onDelete }: TargetRowProps) {
  const [editing, setEditing] = useState(false);
  const [rate, setRate] = useState(String(target.targetRate));

  function handleSave() {
    const val = Number(rate);
    if (!isNaN(val) && val > 0) {
      onUpdate(target.id, val);
    }
    setEditing(false);
  }

  return (
    <li className="flex items-center gap-3 rounded bg-gray-800 px-3 py-2 text-sm">
      <span className="flex-1 text-white">{itemName}</span>
      {editing ? (
        <>
          <Input
            id={`rate-${target.id}`}
            type="number"
            value={rate}
            min={0.01}
            step={0.01}
            onChange={(e) => setRate(e.target.value)}
            className="w-24"
            aria-label={`Rate for ${itemName}`}
          />
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        </>
      ) : (
        <>
          <span className="text-gray-300">{target.targetRate}/min</span>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
          <Button
            size="sm"
            variant="danger"
            aria-label={`Delete ${itemName} target`}
            onClick={() => onDelete(target.id)}
          >
            ✕
          </Button>
        </>
      )}
    </li>
  );
}
