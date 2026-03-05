// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { PresenceAvatars } from "./PresenceAvatars";
import { useCanvasStore } from "@/store/canvasStore";

describe("PresenceAvatars", () => {
  beforeEach(() => {
    useCanvasStore.getState().reset();
  });

  it("renders nothing when not connected", () => {
    useCanvasStore.getState().setCollaborators([
      { userId: "u1", name: "Alice", color: "#ef4444" },
    ]);
    const { container } = render(<PresenceAvatars />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when no collaborators", () => {
    useCanvasStore.getState().setIsConnected(true);
    const { container } = render(<PresenceAvatars />);
    expect(container.firstChild).toBeNull();
  });

  it("renders avatar circles for each collaborator", () => {
    useCanvasStore.getState().setIsConnected(true);
    useCanvasStore.getState().setCollaborators([
      { userId: "u1", name: "Alice", color: "#ef4444" },
      { userId: "u2", name: "Bob", color: "#3b82f6" },
    ]);

    render(<PresenceAvatars />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows user name on hover via title", () => {
    useCanvasStore.getState().setIsConnected(true);
    useCanvasStore.getState().setCollaborators([
      { userId: "u1", name: "Alice", color: "#ef4444" },
    ]);

    render(<PresenceAvatars />);
    expect(screen.getByTitle("Alice")).toBeInTheDocument();
  });
});
