// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuilderToolbar } from "./BuilderToolbar";

describe("BuilderToolbar", () => {
  const defaultProps = {
    onAddMachine: () => {},
    onAddResource: () => {},
    onAddSplitterMerger: () => {},
  };

  it("renders all building buttons including splitter/merger", () => {
    render(<BuilderToolbar {...defaultProps} />);
    expect(screen.getByLabelText("Add Smelter")).toBeDefined();
    expect(screen.getByLabelText("Add Constructor")).toBeDefined();
    expect(screen.getByLabelText("Add Assembler")).toBeDefined();
    expect(screen.getByLabelText("Add Manufacturer")).toBeDefined();
    expect(screen.getByLabelText("Add Resource")).toBeDefined();
    expect(screen.getByLabelText("Add Splitter")).toBeDefined();
    expect(screen.getByLabelText("Add Merger")).toBeDefined();
  });

  it("calls onAddMachine with correct building when clicked", async () => {
    const user = userEvent.setup();
    const onAddMachine = vi.fn();
    render(<BuilderToolbar {...defaultProps} onAddMachine={onAddMachine} />);

    await user.click(screen.getByLabelText("Add Smelter"));
    expect(onAddMachine).toHaveBeenCalledWith("Desc_SmelterMk1_C", "Smelter");
  });

  it("calls onAddResource when Resource button is clicked", async () => {
    const user = userEvent.setup();
    const onAddResource = vi.fn();
    render(<BuilderToolbar {...defaultProps} onAddResource={onAddResource} />);

    await user.click(screen.getByLabelText("Add Resource"));
    expect(onAddResource).toHaveBeenCalled();
  });

  it("calls onAddSplitterMerger with correct kind", async () => {
    const user = userEvent.setup();
    const onAddSplitterMerger = vi.fn();
    render(<BuilderToolbar {...defaultProps} onAddSplitterMerger={onAddSplitterMerger} />);

    await user.click(screen.getByLabelText("Add Splitter"));
    expect(onAddSplitterMerger).toHaveBeenCalledWith("splitter");

    await user.click(screen.getByLabelText("Add Merger"));
    expect(onAddSplitterMerger).toHaveBeenCalledWith("merger");
  });
});
