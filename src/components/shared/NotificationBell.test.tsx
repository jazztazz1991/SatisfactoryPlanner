// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationBell } from "./NotificationBell";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, onClick, ...props }: { children: React.ReactNode; href: string; onClick?: () => void; className?: string }) => (
    <a href={href} onClick={onClick} {...props}>{children}</a>
  ),
}));

const mockNotifications = [
  { id: "inv-1", type: "invite", planId: "plan-1", planName: "Iron Factory", role: "editor", createdAt: "2026-03-06T00:00:00Z" },
  { id: "sh-1", type: "shared", planId: "plan-2", planName: "Steel Mill", role: "viewer", createdAt: "2026-03-05T00:00:00Z" },
];

function mockFetch(data: unknown[] = []) {
  return vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
    if (url === "/api/notifications" && (!opts || opts.method !== "POST")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
    }
    if (url === "/api/notifications" && opts?.method === "POST") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    return Promise.resolve({ ok: false });
  });
}

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders bell button", async () => {
    global.fetch = mockFetch([]);
    render(<NotificationBell />);
    expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument();
  });

  it("shows no badge when there are no notifications", async () => {
    global.fetch = mockFetch([]);
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByLabelText("No notifications")).toBeInTheDocument();
    });
  });

  it("shows badge with count when there are notifications", async () => {
    global.fetch = mockFetch(mockNotifications);
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("shows dropdown with notifications when clicked", async () => {
    global.fetch = mockFetch(mockNotifications);
    const user = userEvent.setup();
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /notifications/i }));

    expect(screen.getByText("Iron Factory")).toBeInTheDocument();
    expect(screen.getByText("Steel Mill")).toBeInTheDocument();
    expect(screen.getByText("Accept")).toBeInTheDocument();
    expect(screen.getByText("View")).toBeInTheDocument();
  });

  it("shows 'No notifications' when dropdown is empty", async () => {
    global.fetch = mockFetch([]);
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByRole("button", { name: /notifications/i }));

    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("removes invite from list after accepting", async () => {
    global.fetch = mockFetch(mockNotifications);
    const user = userEvent.setup();
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /notifications/i }));
    await user.click(screen.getByText("Accept"));

    await waitFor(() => {
      expect(screen.queryByText("Iron Factory")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Steel Mill")).toBeInTheDocument();
  });

  it("closes dropdown when bell is clicked again", async () => {
    global.fetch = mockFetch(mockNotifications);
    const user = userEvent.setup();
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /notifications/i }));
    expect(screen.getByText("Notifications")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /notifications/i }));
    expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
  });

  it("shows role as orange text", async () => {
    global.fetch = mockFetch(mockNotifications);
    const user = userEvent.setup();
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /notifications/i }));

    const editorBadge = screen.getByText("editor");
    expect(editorBadge.className).toContain("text-orange-400");
  });
});
