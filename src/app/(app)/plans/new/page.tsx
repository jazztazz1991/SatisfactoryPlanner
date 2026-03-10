"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { TierPicker } from "@/components/shared/TierPicker";
import { SPACE_ELEVATOR_TEMPLATES, TEMPLATE_MAP } from "@/domain/templates/spaceElevatorTemplates";

export default function NewPlanPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateKey, setTemplateKey] = useState<string | null>(null);
  const [maxTier, setMaxTier] = useState(9);
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
        body: JSON.stringify({ name, description: description || null, templateKey, maxTier }),
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
    <div className="mx-auto max-w-5xl px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tight text-content">New Plan</h1>
        <p className="mt-1 text-sm text-content-muted">Configure your factory blueprint</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-danger/30 bg-danger-muted px-4 py-3 text-sm text-danger-light">
            {error}
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left column — details */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5 rounded-2xl border border-surface-border bg-surface-raised p-6">
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
            </div>

            <fieldset>
              <legend className="mb-3 text-xs font-bold uppercase tracking-widest text-content-muted">
                Max Milestone Tier
              </legend>
              <TierPicker value={maxTier} onChange={setMaxTier} />
              <p className="mt-2 text-xs text-content-muted">
                Only recipes and buildings unlocked up to this tier will be used.
              </p>
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
          </div>

          {/* Right column — template selector */}
          <fieldset>
            <legend className="mb-3 text-xs font-bold uppercase tracking-widest text-content-muted">
              Template
            </legend>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => { setTemplateKey(null); setMaxTier(9); }}
                className={`group rounded-xl border p-4 text-left text-sm transition-all ${
                  templateKey === null
                    ? "border-brand/50 bg-brand-muted glow-ring"
                    : "border-surface-border bg-surface-raised hover:border-brand/20"
                }`}
              >
                <div className={`font-semibold ${templateKey === null ? "text-brand" : "text-content"}`}>Blank plan</div>
                <div className="mt-1 text-xs text-content-muted">Start from scratch</div>
              </button>
              {SPACE_ELEVATOR_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.key}
                  type="button"
                  onClick={() => { setTemplateKey(tmpl.key); setMaxTier(tmpl.maxTier); }}
                  className={`group rounded-xl border p-4 text-left text-sm transition-all ${
                    templateKey === tmpl.key
                      ? "border-brand/50 bg-brand-muted glow-ring"
                      : "border-surface-border bg-surface-raised hover:border-brand/20"
                  }`}
                >
                  <div className={`font-semibold ${templateKey === tmpl.key ? "text-brand" : "text-content"}`}>{tmpl.name}</div>
                  <div className="mt-1 text-xs text-content-muted">{tmpl.description}</div>
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </form>
    </div>
  );
}
