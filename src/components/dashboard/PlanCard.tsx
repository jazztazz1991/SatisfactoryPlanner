import Link from "next/link";
import type { IPlanWithRole, PlanAccessRole } from "@/domain/types/plan";

const roleBadgeClasses: Record<PlanAccessRole, string> = {
  owner: "",
  editor: "bg-blue-500/20 text-blue-400",
  viewer: "bg-gray-500/20 text-gray-400",
};

interface PlanCardProps {
  plan: IPlanWithRole;
  onDelete?: (id: string) => void;
}

export function PlanCard({ plan, onDelete }: PlanCardProps) {
  const updatedAt = new Date(plan.updatedAt).toLocaleDateString();
  const isShared = plan.accessRole !== "owner";

  return (
    <article className="group flex flex-col gap-2 rounded-lg border border-gray-700 bg-gray-800 p-4 transition-colors hover:border-orange-500">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/plans/${plan.id}`}
          className="flex-1 text-base font-semibold text-white hover:text-orange-400"
        >
          {plan.name}
        </Link>
        {isShared && (
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${roleBadgeClasses[plan.accessRole]}`}>
            {plan.accessRole}
          </span>
        )}
        {!isShared && onDelete && (
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
        {isShared && plan.ownerName && (
          <>
            <span>·</span>
            <span>by {plan.ownerName}</span>
          </>
        )}
      </div>
    </article>
  );
}
