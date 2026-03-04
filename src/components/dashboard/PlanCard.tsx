import Link from "next/link";
import type { IPlan } from "@/domain/types/plan";

interface PlanCardProps {
  plan: IPlan;
  onDelete?: (id: string) => void;
}

export function PlanCard({ plan, onDelete }: PlanCardProps) {
  const updatedAt = new Date(plan.updatedAt).toLocaleDateString();

  return (
    <article className="group flex flex-col gap-2 rounded-lg border border-gray-700 bg-gray-800 p-4 transition-colors hover:border-orange-500">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/plans/${plan.id}`}
          className="flex-1 text-base font-semibold text-white hover:text-orange-400"
        >
          {plan.name}
        </Link>
        {onDelete && (
          <button
            aria-label={`Delete ${plan.name}`}
            onClick={() => onDelete(plan.id)}
            className="text-gray-500 hover:text-red-400"
          >
            ✕
          </button>
        )}
      </div>
      {plan.description && (
        <p className="text-sm text-gray-400 line-clamp-2">{plan.description}</p>
      )}
      <div className="mt-auto flex items-center gap-3 text-xs text-gray-500">
        <span className="capitalize">{plan.viewMode}</span>
        <span>·</span>
        <span>Updated {updatedAt}</span>
      </div>
    </article>
  );
}
