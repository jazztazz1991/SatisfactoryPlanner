"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/shared/Button";
import type { IPlanCollaborator, CollaboratorRole } from "@/domain/types/plan";

interface ShareDialogProps {
  planId: string;
  isOpen: boolean;
  onClose: () => void;
  shareToken: string | null;
  shareRole: CollaboratorRole | null;
}

export function ShareDialog({ planId, isOpen, onClose, shareToken, shareRole }: ShareDialogProps) {
  const [tab, setTab] = useState<"invite" | "link">("invite");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaboratorRole>("editor");
  const [collaborators, setCollaborators] = useState<IPlanCollaborator[]>([]);
  const [currentShareToken, setCurrentShareToken] = useState(shareToken);
  const [currentShareRole, setCurrentShareRole] = useState<CollaboratorRole | null>(shareRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadCollaborators = useCallback(async () => {
    try {
      const res = await fetch(`/api/plans/${planId}/collaborators`);
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data);
      }
    } catch {
      // Ignore
    }
  }, [planId]);

  // Load collaborators when dialog opens
  useEffect(() => {
    if (isOpen) loadCollaborators();
  }, [isOpen, loadCollaborators]);

  if (!isOpen) return null;

  async function handleInvite() {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/plans/${planId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to invite");
        return;
      }
      setEmail("");
      await loadCollaborators();
    } catch {
      setError("Failed to invite collaborator");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveCollaborator(collabId: string) {
    try {
      await fetch(`/api/plans/${planId}/collaborators/${collabId}`, { method: "DELETE" });
      setCollaborators((prev) => prev.filter((c) => c.id !== collabId));
    } catch {
      // Ignore
    }
  }

  async function handleToggleShareLink() {
    setLoading(true);
    try {
      const res = await fetch(`/api/plans/${planId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: !currentShareToken,
          role: currentShareRole ?? "viewer",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentShareToken(data.shareToken);
        setCurrentShareRole(data.shareRole);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }

  function handleCopyLink() {
    if (!currentShareToken) return;
    const url = `${window.location.origin}/api/plans/join/${currentShareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Share Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close share dialog">
            X
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2 border-b border-gray-700 pb-2">
          <button
            className={`px-3 py-1 text-sm ${tab === "invite" ? "text-orange-400 border-b-2 border-orange-400" : "text-gray-400"}`}
            onClick={() => setTab("invite")}
          >
            Invite People
          </button>
          <button
            className={`px-3 py-1 text-sm ${tab === "link" ? "text-orange-400 border-b-2 border-orange-400" : "text-gray-400"}`}
            onClick={() => setTab("link")}
          >
            Share Link
          </button>
        </div>

        {tab === "invite" ? (
          <div>
            <div className="mb-3 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as CollaboratorRole)}
                className="rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-white"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button size="sm" onClick={handleInvite} loading={loading}>
                Invite
              </Button>
            </div>
            {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

            {/* Collaborator list */}
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {collaborators.map((collab) => (
                <div key={collab.id} className="flex items-center justify-between rounded bg-gray-800 px-3 py-2">
                  <div>
                    <span className="text-sm text-white">{collab.email ?? "User"}</span>
                    <span className="ml-2 rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-300">
                      {collab.role}
                    </span>
                    {!collab.acceptedAt && (
                      <span className="ml-1 text-[10px] text-yellow-500">Pending</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveCollaborator(collab.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                    aria-label={`Remove collaborator ${collab.email ?? "User"}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {collaborators.length === 0 && (
                <p className="text-center text-xs text-gray-500">No collaborators yet</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-300">
                {currentShareToken ? "Link sharing is on" : "Link sharing is off"}
              </span>
              <Button size="sm" onClick={handleToggleShareLink} loading={loading}>
                {currentShareToken ? "Disable" : "Enable"}
              </Button>
            </div>

            {currentShareToken && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/api/plans/join/${currentShareToken}`}
                    className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300"
                  />
                  <Button size="sm" onClick={handleCopyLink}>
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Role for link users:</span>
                  <select
                    value={currentShareRole ?? "viewer"}
                    onChange={async (e) => {
                      const newRole = e.target.value as CollaboratorRole;
                      setCurrentShareRole(newRole);
                      await fetch(`/api/plans/${planId}/share`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ enabled: true, role: newRole }),
                      });
                    }}
                    className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-white"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
