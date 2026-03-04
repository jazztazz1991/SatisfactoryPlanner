"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TargetRow } from "./TargetRow";
import { Spinner } from "@/components/shared/Spinner";
import type { IPlanTarget } from "@/domain/types/plan";
import type { IItem } from "@/domain/types/game";

async function fetchTargets(planId: string): Promise<IPlanTarget[]> {
  const res = await fetch(`/api/plans/${planId}/targets`);
  if (!res.ok) throw new Error("Failed to fetch targets");
  return res.json();
}

async function fetchItems(): Promise<IItem[]> {
  const res = await fetch("/api/game-data/items");
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

interface TargetListProps {
  planId: string;
}

export function TargetList({ planId }: TargetListProps) {
  const queryClient = useQueryClient();

  const { data: targets, isLoading: targetsLoading } = useQuery({
    queryKey: ["targets", planId],
    queryFn: () => fetchTargets(planId),
  });

  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  const itemNameMap = new Map((items ?? []).map((i) => [i.className, i.name]));

  const updateMutation = useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) =>
      fetch(`/api/plans/${planId}/targets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRate: rate }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["targets", planId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/plans/${planId}/targets/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["targets", planId] }),
  });

  if (targetsLoading) return <Spinner size="sm" />;

  return (
    <div className="flex flex-col gap-2 p-3">
      <h2 className="text-sm font-semibold text-gray-300">Production Targets</h2>
      {!targets?.length ? (
        <p className="text-xs text-gray-500">No targets set</p>
      ) : (
        <ul className="flex flex-col gap-1" role="list">
          {targets.map((target) => (
            <TargetRow
              key={target.id}
              target={target}
              itemName={itemNameMap.get(target.itemClassName) ?? target.itemClassName}
              onUpdate={(id, rate) => updateMutation.mutate({ id, rate })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
