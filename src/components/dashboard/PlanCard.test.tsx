// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { PlanCard } from "./PlanCard";
import type { IPlan } from "@/domain/types/plan";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const plan: IPlan = {
  id: "plan-1",
  userId: "user-1",
  name: "Iron Factory",
  description: "My iron production line",
  viewMode: "graph",
  templateKey: null,
  canvasViewport: null,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-02T00:00:00.000Z",
};

describe("PlanCard", () => {
  it("renders the plan name as a link", () => {
    render(<PlanCard plan={plan} />);
    const link = screen.getByRole("link", { name: "Iron Factory" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/plans/plan-1");
  });

  it("renders the description", () => {
    render(<PlanCard plan={plan} />);
    expect(screen.getByText("My iron production line")).toBeInTheDocument();
  });

  it("shows the delete button when onDelete is provided", () => {
    render(<PlanCard plan={plan} onDelete={vi.fn()} />);
    expect(screen.getByRole("button", { name: /delete iron factory/i })).toBeInTheDocument();
  });

  it("calls onDelete with plan id when delete button clicked", async () => {
    const onDelete = vi.fn();
    render(<PlanCard plan={plan} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith("plan-1");
  });

  it("does not show delete button without onDelete", () => {
    render(<PlanCard plan={plan} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not render description when null", () => {
    render(<PlanCard plan={{ ...plan, description: null }} />);
    expect(screen.queryByText("My iron production line")).not.toBeInTheDocument();
  });
});
