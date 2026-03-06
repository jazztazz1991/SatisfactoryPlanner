"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlanCard } from "./PlanCard";
import { Spinner } from "@/components/shared/Spinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import type { IPlanWithRole } from "@/domain/types/plan";

async function fetchPlans(): Promise<IPlanWithRole[]> {
  const res = await fetch("/api/plans");
  if (!res.ok) throw new Error("Failed to load plans");
  return res.json();
}

async function deletePlanById(id: string): Promise<void> {
  await fetch(`/api/plans/${id}`, { method: "DELETE" });
}

export function PlanList() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlanById,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plans"] }),
  });

  if (isLoading) return <Spinner label="Loading plans" />;
  if (isError) return <ErrorMessage message="Failed to load plans" onRetry={() => refetch()} />;
  if (!data?.length) {
    return (
      <p className="text-center text-gray-500 py-12">
        No plans yet. Create your first one!
      </p>
    );
  }

  const ownedPlans = data.filter((p) => p.accessRole === "owner");
  const sharedPlans = data.filter((p) => p.accessRole !== "owner");

  return (
    <div className="flex flex-col gap-8">
      {ownedPlans.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ownedPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
      {sharedPlans.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-300">Shared with me</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sharedPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
