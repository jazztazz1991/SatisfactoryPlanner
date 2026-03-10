"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { CollaboratorRole } from "@/domain/types/plan";

interface Notification {
  id: string;
  type: "invite" | "shared";
  planId: string;
  planName: string;
  role: CollaboratorRole;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // Ignore fetch errors
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function handleAccept(collaboratorId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== collaboratorId));
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const count = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={count > 0 ? `${count} notifications` : "No notifications"}
        className="relative rounded-full px-3 py-2 text-sm text-content-secondary hover:text-brand hover:bg-brand-muted transition-all"
      >
        &#128276;
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-mono font-bold text-content">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 glass glass-border rounded-xl shadow-card">
          <div className="border-b border-surface-border px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-content">Notifications</h3>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-content-muted">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="border-b border-surface-border-subtle px-4 py-3 last:border-b-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-content">{n.planName}</p>
                      <p className="text-xs text-content-secondary">
                        {n.type === "invite" ? "Invited as" : "Shared as"}{" "}
                        <span className="text-brand">{n.role}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {n.type === "invite" ? (
                        <button
                          onClick={() => handleAccept(n.id)}
                          disabled={loading}
                          className="gradient-brand rounded-full px-3 py-1 text-xs font-bold uppercase text-content-inverse shadow-glow hover:shadow-glow-brand disabled:opacity-50 transition-all"
                        >
                          Accept
                        </button>
                      ) : (
                        <Link
                          href={`/plans/${n.planId}`}
                          onClick={() => { setOpen(false); handleDismiss(n.id); }}
                          className="bg-surface-overlay border border-surface-border rounded-full px-3 py-1 text-xs font-bold text-content hover:border-brand/30 hover:text-brand transition-all"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
