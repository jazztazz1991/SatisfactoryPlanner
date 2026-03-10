import { PlanList } from "@/components/dashboard/PlanList";
import { NewPlanButton } from "@/components/dashboard/NewPlanButton";

export const metadata = { title: "Dashboard — Satisfactory Planner" };

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-4xl px-8 py-12">
        <h1 className="text-3xl font-black uppercase tracking-tight text-content">
          My Plans
        </h1>
        <p className="mt-1 text-sm text-content-muted">
          Manage your factory blueprints
        </p>
        <div className="mt-8 h-px bg-linear-to-r from-brand/20 via-surface-border to-transparent" />
        <div className="mt-8">
          <PlanList />
        </div>
      </div>

      {/* Floating action button — bottom right */}
      <div className="fixed bottom-8 right-8 z-30">
        <NewPlanButton />
      </div>
    </div>
  );
}
