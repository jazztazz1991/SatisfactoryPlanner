// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TargetRow } from "./TargetRow";
import type { IPlanTarget } from "@/domain/types/plan";

const target: IPlanTarget = {
  id: "t-1",
  planId: "plan-1",
  itemClassName: "Desc_IronPlate_C",
  targetRate: 30,
};

describe("TargetRow", () => {
  it("renders item name and rate", () => {
    render(<TargetRow target={target} itemName="Iron Plate" onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Iron Plate")).toBeInTheDocument();
    expect(screen.getByText("30/min")).toBeInTheDocument();
  });

  it("shows edit and delete buttons in view mode", () => {
    render(<TargetRow target={target} itemName="Iron Plate" onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("enters edit mode when Edit is clicked", async () => {
    render(<TargetRow target={target} itemName="Iron Plate" onUpdate={vi.fn()} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const onDelete = vi.fn();
    render(<TargetRow target={target} itemName="Iron Plate" onUpdate={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: /delete iron plate/i }));
    expect(onDelete).toHaveBeenCalledWith("t-1");
  });

  it("calls onUpdate with new rate when saved", async () => {
    const onUpdate = vi.fn();
    render(<TargetRow target={target} itemName="Iron Plate" onUpdate={onUpdate} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    const input = screen.getByRole("spinbutton", { name: /rate for iron plate/i });
    await userEvent.clear(input);
    await userEvent.type(input, "60");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onUpdate).toHaveBeenCalledWith("t-1", 60);
  });

  it("exits edit mode without saving on cancel", async () => {
    const onUpdate = vi.fn();
    render(<TargetRow target={target} itemName="Iron Plate" onUpdate={onUpdate} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText("30/min")).toBeInTheDocument();
  });
});
