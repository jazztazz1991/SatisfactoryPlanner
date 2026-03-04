import { PlanList } from "@/components/dashboard/PlanList";
import { NewPlanButton } from "@/components/dashboard/NewPlanButton";

export const metadata = { title: "Dashboard — Satisfactory Planner" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Plans</h1>
        <NewPlanButton />
      </div>
      <PlanList />
    </div>
  );
}
