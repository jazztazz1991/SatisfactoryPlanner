// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TierPicker } from "./TierPicker";

describe("TierPicker", () => {
  it("renders buttons for tiers 0 through 9", () => {
    render(<TierPicker value={9} onChange={vi.fn()} />);
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole("button", { name: `Tier ${i}` })).toBeInTheDocument();
    }
  });

  it("highlights the selected tier", () => {
    render(<TierPicker value={3} onChange={vi.fn()} />);
    const selected = screen.getByRole("button", { name: "Tier 3" });
    expect(selected).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onChange with the clicked tier", async () => {
    const onChange = vi.fn();
    render(<TierPicker value={9} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Tier 5" }));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("does not call onChange when clicking the already-selected tier", async () => {
    const onChange = vi.fn();
    render(<TierPicker value={4} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Tier 4" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("marks non-selected tiers as not pressed", () => {
    render(<TierPicker value={2} onChange={vi.fn()} />);
    const tier5 = screen.getByRole("button", { name: "Tier 5" });
    expect(tier5).toHaveAttribute("aria-pressed", "false");
  });
});
