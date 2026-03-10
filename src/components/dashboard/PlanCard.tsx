import Link from "next/link";
import type { IPlanWithRole, PlanAccessRole } from "@/domain/types/plan";

const roleBadgeClasses: Record<PlanAccessRole, string> = {
  owner: "",
  editor: "rounded-full bg-secondary-muted border border-secondary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-light",
  viewer: "rounded-full bg-secondary-muted border border-secondary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-light",
};

interface PlanCardProps {
  plan: IPlanWithRole;
  onDelete?: (id: string) => void;
}

export function PlanCard({ plan, onDelete }: PlanCardProps) {
  const updatedAt = new Date(plan.updatedAt).toLocaleDateString();
  const isShared = plan.accessRole !== "owner";

  return (
    <article className="group flex items-center gap-4 rounded-xl border border-surface-border bg-surface-raised px-5 py-4 transition-all hover:border-brand/30 hover:shadow-card-hover">
      {/* Left accent bar */}
      <div className="h-8 w-1 rounded-full bg-brand/30 group-hover:bg-brand transition-colors" />

      {/* Plan info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/plans/${plan.id}`}
            className="truncate font-bold text-content group-hover:text-brand transition-colors"
          >
            {plan.name}
          </Link>
          {isShared && (
            <span className={`shrink-0 ${roleBadgeClasses[plan.accessRole]}`}>
              {plan.accessRole}
            </span>
          )}
        </div>
        {plan.description && (
          <p className="mt-0.5 truncate text-xs text-content-muted">{plan.description}</p>
        )}
      </div>

      {/* Metadata — right side */}
      <div className="hidden items-center gap-4 text-[11px] font-mono text-content-muted sm:flex">
        <span className="rounded-full border border-surface-border bg-surface-overlay px-2 py-0.5 uppercase">{plan.viewMode}</span>
        <span>{updatedAt}</span>
        {isShared && plan.ownerName && <span>by {plan.ownerName}</span>}
      </div>

      {/* Delete button — far right */}
      {!isShared && onDelete && (
        <button
          aria-label={`Delete ${plan.name}`}
          onClick={() => onDelete(plan.id)}
          className="shrink-0 text-content-muted hover:text-danger transition-colors"
        >
          ✕
        </button>
      )}
    </article>
  );
}
