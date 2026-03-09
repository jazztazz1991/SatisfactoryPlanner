// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FloorConfigPopover } from "./FloorConfigPopover";

describe("FloorConfigPopover", () => {
  it("shows width and depth inputs", () => {
    render(
      <FloorConfigPopover
        floorConfig={{ floorWidth: 16, floorDepth: 16 }}
        onConfigChange={() => {}}
      />,
    );

    expect(screen.getByLabelText("Floor width")).toBeDefined();
    expect(screen.getByLabelText("Floor depth")).toBeDefined();
  });

  it("shows current config values in inputs", () => {
    render(
      <FloorConfigPopover
        floorConfig={{ floorWidth: 12, floorDepth: 8 }}
        onConfigChange={() => {}}
      />,
    );

    const widthInput = screen.getByLabelText("Floor width") as HTMLInputElement;
    const depthInput = screen.getByLabelText("Floor depth") as HTMLInputElement;
    expect(widthInput.value).toBe("12");
    expect(depthInput.value).toBe("8");
  });

  it("calls onConfigChange when depth is changed", () => {
    const onConfigChange = vi.fn();
    render(
      <FloorConfigPopover
        floorConfig={{ floorWidth: 16, floorDepth: 16 }}
        onConfigChange={onConfigChange}
      />,
    );

    const depthInput = screen.getByLabelText("Floor depth");
    fireEvent.change(depthInput, { target: { value: "8" } });

    expect(onConfigChange).toHaveBeenCalledWith({ floorWidth: 16, floorDepth: 8 });
  });
});
