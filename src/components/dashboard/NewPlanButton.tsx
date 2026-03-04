import Link from "next/link";

export function NewPlanButton() {
  return (
    <Link
      href="/plans/new"
      className="inline-flex items-center gap-2 rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
    >
      <span aria-hidden="true">+</span>
      New Plan
    </Link>
  );
}
