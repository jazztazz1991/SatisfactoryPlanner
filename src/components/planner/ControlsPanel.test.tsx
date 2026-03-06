// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ControlsPanel } from "./ControlsPanel";

describe("ControlsPanel", () => {
  const onClose = vi.fn();

  afterEach(() => {
    onClose.mockClear();
  });

  it("renders Graph controls when viewMode is graph", () => {
    render(<ControlsPanel viewMode="graph" onClose={onClose} />);
    expect(screen.getByText("Graph Controls")).toBeInTheDocument();
    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Nodes")).toBeInTheDocument();
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
    expect(screen.getByText("Scroll to zoom in/out")).toBeInTheDocument();
  });

  it("renders Factory controls when viewMode is factory", () => {
    render(<ControlsPanel viewMode="factory" onClose={onClose} />);
    expect(screen.getByText("Factory Controls")).toBeInTheDocument();
    expect(screen.getByText("Buildings")).toBeInTheDocument();
    expect(screen.getByText("Belts")).toBeInTheDocument();
    expect(screen.getByText("S = Splitter, M = Merger")).toBeInTheDocument();
  });

  it("renders Tree controls when viewMode is tree", () => {
    render(<ControlsPanel viewMode="tree" onClose={onClose} />);
    expect(screen.getByText("Tree Controls")).toBeInTheDocument();
    expect(screen.getByText("Reading the Tree")).toBeInTheDocument();
    expect(screen.getByText("Numbers show machine count and power")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<ControlsPanel viewMode="graph" onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close controls panel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<ControlsPanel viewMode="graph" onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("collapses and expands sections on click", () => {
    render(<ControlsPanel viewMode="graph" onClose={onClose} />);
    const navButton = screen.getByText("Navigation");

    // Initially expanded
    expect(navButton.closest("button")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Scroll to zoom in/out")).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(navButton);
    expect(navButton.closest("button")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Scroll to zoom in/out")).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(navButton);
    expect(navButton.closest("button")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Scroll to zoom in/out")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<ControlsPanel viewMode="graph" onClose={onClose} />);
    expect(screen.getByRole("region", { name: "Controls help panel" })).toBeInTheDocument();
    expect(screen.getByLabelText("Close controls panel")).toBeInTheDocument();
  });
});
