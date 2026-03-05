import { describe, it, expect } from "vitest";
import { resolveAccessRole, hasMinRole } from "./planAccess";
import type { IPlan } from "@/domain/types/plan";

const basePlan: IPlan = {
  id: "plan-1",
  userId: "owner-user",
  name: "Test Plan",
  description: null,
  viewMode: "graph",
  templateKey: null,
  canvasViewport: null,
  shareToken: null,
  shareRole: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("resolveAccessRole", () => {
  it("returns 'owner' when userId matches plan owner", () => {
    expect(resolveAccessRole(basePlan, "owner-user", null)).toBe("owner");
  });

  it("returns 'owner' even if collaboratorRole is viewer", () => {
    expect(resolveAccessRole(basePlan, "owner-user", "viewer")).toBe("owner");
  });

  it("returns 'editor' for a collaborator with editor role", () => {
    expect(resolveAccessRole(basePlan, "other-user", "editor")).toBe("editor");
  });

  it("returns 'viewer' for a collaborator with viewer role", () => {
    expect(resolveAccessRole(basePlan, "other-user", "viewer")).toBe("viewer");
  });

  it("returns null when user is not owner and has no collaborator role", () => {
    expect(resolveAccessRole(basePlan, "other-user", null)).toBeNull();
  });
});

describe("hasMinRole", () => {
  it("owner meets all role requirements", () => {
    expect(hasMinRole("owner", "viewer")).toBe(true);
    expect(hasMinRole("owner", "editor")).toBe(true);
    expect(hasMinRole("owner", "owner")).toBe(true);
  });

  it("editor meets editor and viewer but not owner", () => {
    expect(hasMinRole("editor", "viewer")).toBe(true);
    expect(hasMinRole("editor", "editor")).toBe(true);
    expect(hasMinRole("editor", "owner")).toBe(false);
  });

  it("viewer meets only viewer", () => {
    expect(hasMinRole("viewer", "viewer")).toBe(true);
    expect(hasMinRole("viewer", "editor")).toBe(false);
    expect(hasMinRole("viewer", "owner")).toBe(false);
  });
});
