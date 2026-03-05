// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { RemoteCursors } from "./RemoteCursors";
import { useCanvasStore } from "@/store/canvasStore";

describe("RemoteCursors", () => {
  beforeEach(() => {
    useCanvasStore.getState().reset();
  });

  it("renders nothing when no remote cursors", () => {
    const { container } = render(<RemoteCursors />);
    expect(container.firstChild).toBeNull();
  });

  it("renders cursor with user name label", () => {
    useCanvasStore.getState().updateRemoteCursor({
      userId: "u1",
      name: "Alice",
      color: "#ef4444",
      x: 100,
      y: 200,
    });

    render(<RemoteCursors />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders multiple remote cursors", () => {
    useCanvasStore.getState().updateRemoteCursor({
      userId: "u1", name: "Alice", color: "#ef4444", x: 100, y: 200,
    });
    useCanvasStore.getState().updateRemoteCursor({
      userId: "u2", name: "Bob", color: "#3b82f6", x: 300, y: 400,
    });

    render(<RemoteCursors />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});
