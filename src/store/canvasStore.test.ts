import { describe, it, expect, beforeEach } from "vitest";
import { useCanvasStore } from "./canvasStore";

describe("canvasStore collaboration state", () => {
  beforeEach(() => {
    useCanvasStore.getState().reset();
  });

  it("starts with empty collaboration state", () => {
    const state = useCanvasStore.getState();
    expect(state.collaborators).toEqual([]);
    expect(state.remoteCursors.size).toBe(0);
    expect(state.isConnected).toBe(false);
  });

  it("setCollaborators updates the collaborator list", () => {
    const users = [
      { userId: "u1", name: "Alice", color: "#ef4444" },
      { userId: "u2", name: "Bob", color: "#3b82f6" },
    ];
    useCanvasStore.getState().setCollaborators(users);
    expect(useCanvasStore.getState().collaborators).toEqual(users);
  });

  it("updateRemoteCursor adds/updates a cursor", () => {
    const cursor = { userId: "u1", name: "Alice", color: "#ef4444", x: 100, y: 200 };
    useCanvasStore.getState().updateRemoteCursor(cursor);
    expect(useCanvasStore.getState().remoteCursors.get("u1")).toEqual(cursor);

    // Update position
    useCanvasStore.getState().updateRemoteCursor({ ...cursor, x: 150, y: 250 });
    expect(useCanvasStore.getState().remoteCursors.get("u1")?.x).toBe(150);
  });

  it("removeRemoteCursor removes a cursor", () => {
    const cursor = { userId: "u1", name: "Alice", color: "#ef4444", x: 100, y: 200 };
    useCanvasStore.getState().updateRemoteCursor(cursor);
    expect(useCanvasStore.getState().remoteCursors.size).toBe(1);

    useCanvasStore.getState().removeRemoteCursor("u1");
    expect(useCanvasStore.getState().remoteCursors.size).toBe(0);
  });

  it("setIsConnected updates connection state", () => {
    useCanvasStore.getState().setIsConnected(true);
    expect(useCanvasStore.getState().isConnected).toBe(true);

    useCanvasStore.getState().setIsConnected(false);
    expect(useCanvasStore.getState().isConnected).toBe(false);
  });

  it("reset clears collaboration state", () => {
    useCanvasStore.getState().setCollaborators([{ userId: "u1", name: "A", color: "#000" }]);
    useCanvasStore.getState().updateRemoteCursor({ userId: "u1", name: "A", color: "#000", x: 0, y: 0 });
    useCanvasStore.getState().setIsConnected(true);

    useCanvasStore.getState().reset();

    const state = useCanvasStore.getState();
    expect(state.collaborators).toEqual([]);
    expect(state.remoteCursors.size).toBe(0);
    expect(state.isConnected).toBe(false);
  });
});
