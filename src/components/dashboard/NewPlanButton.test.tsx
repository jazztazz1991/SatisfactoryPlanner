// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NewPlanButton } from "./NewPlanButton";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("NewPlanButton", () => {
  it("renders a link to /plans/new", () => {
    render(<NewPlanButton />);
    const link = screen.getByRole("link", { name: /new plan/i });
    expect(link).toHaveAttribute("href", "/plans/new");
  });
});
