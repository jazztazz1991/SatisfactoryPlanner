"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { SPACE_ELEVATOR_TEMPLATES } from "@/domain/templates/spaceElevatorTemplates";

export default function NewPlanPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateKey, setTemplateKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || null, templateKey }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create plan");
        return;
      }
      const plan = await res.json();
      router.push(`/plans/${plan.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-white">New Plan</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <p role="alert" className="rounded bg-red-900/40 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <Input
          id="plan-name"
          label="Plan Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Iron Factory"
          required
        />

        <Input
          id="plan-description"
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your plan..."
        />

        {/* Template selector */}
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-gray-300">
            Start from a template (optional)
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setTemplateKey(null)}
              className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                templateKey === null
                  ? "border-orange-500 bg-orange-500/10 text-white"
                  : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500"
              }`}
            >
              <div className="font-medium">Blank plan</div>
              <div className="mt-1 text-xs text-gray-400">Start from scratch</div>
            </button>
            {SPACE_ELEVATOR_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.key}
                type="button"
                onClick={() => setTemplateKey(tmpl.key)}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                  templateKey === tmpl.key
                    ? "border-orange-500 bg-orange-500/10 text-white"
                    : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500"
                }`}
              >
                <div className="font-medium">{tmpl.name}</div>
                <div className="mt-1 text-xs text-gray-400">{tmpl.description}</div>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-3">
          <Button type="submit" loading={loading} disabled={!name.trim()}>
            Create Plan
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
