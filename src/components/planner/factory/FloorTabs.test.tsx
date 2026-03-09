// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FloorTabs } from "./FloorTabs";

describe("FloorTabs", () => {
  it("renders correct number of tabs", () => {
    render(<FloorTabs floorCount={3} activeFloor={0} onFloorChange={() => {}} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent("Floor 1");
    expect(tabs[1]).toHaveTextContent("Floor 2");
    expect(tabs[2]).toHaveTextContent("Floor 3");
  });

  it("marks active tab with aria-selected", () => {
    render(<FloorTabs floorCount={3} activeFloor={1} onFloorChange={() => {}} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");
  });

  it("calls onFloorChange when a tab is clicked", async () => {
    const user = userEvent.setup();
    const onFloorChange = vi.fn();
    render(<FloorTabs floorCount={3} activeFloor={0} onFloorChange={onFloorChange} />);

    const tabs = screen.getAllByRole("tab");
    await user.click(tabs[2]);

    expect(onFloorChange).toHaveBeenCalledWith(2);
  });
});
