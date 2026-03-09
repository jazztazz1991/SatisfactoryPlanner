import { describe, it, expect } from "vitest";
import { validateConnection, parseHandleItem } from "./connectionValidation";

describe("parseHandleItem", () => {
  it("parses output handle", () => {
    expect(parseHandleItem("out-Desc_IronIngot_C")).toBe("Desc_IronIngot_C");
  });

  it("parses input handle", () => {
    expect(parseHandleItem("in-Desc_IronPlate_C")).toBe("Desc_IronPlate_C");
  });

  it("returns null for invalid format", () => {
    expect(parseHandleItem("bad-format")).toBeNull();
    expect(parseHandleItem("")).toBeNull();
  });

  it("parses splitter/merger bus handles", () => {
    expect(parseHandleItem("bus-in-Desc_IronIngot_C")).toBe("Desc_IronIngot_C");
    expect(parseHandleItem("bus-out-Desc_IronIngot_C")).toBe("Desc_IronIngot_C");
  });

  it("parses splitter branch output handles", () => {
    expect(parseHandleItem("branch-out-Desc_IronIngot_C")).toBe("Desc_IronIngot_C");
    expect(parseHandleItem("branch-out-left-Desc_IronIngot_C")).toBe("Desc_IronIngot_C");
  });

  it("parses merger branch input handles", () => {
    expect(parseHandleItem("branch-in-Desc_IronIngot_C")).toBe("Desc_IronIngot_C");
    expect(parseHandleItem("branch-in-right-Desc_IronIngot_C")).toBe("Desc_IronIngot_C");
  });

  it("returns empty string for unassigned splitter/merger handles", () => {
    expect(parseHandleItem("bus-in-")).toBe("");
    expect(parseHandleItem("bus-out-")).toBe("");
    expect(parseHandleItem("branch-out-")).toBe("");
    expect(parseHandleItem("branch-out-left-")).toBe("");
    expect(parseHandleItem("branch-in-")).toBe("");
    expect(parseHandleItem("branch-in-right-")).toBe("");
  });
});

describe("validateConnection", () => {
  it("rejects self-connections", () => {
    const result = validateConnection(
      { source: "node-1", target: "node-1", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
      [],
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/itself/);
  });

  it("rejects item mismatch", () => {
    const result = validateConnection(
      { source: "node-1", target: "node-2", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronPlate_C" },
      [],
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/mismatch/i);
  });

  it("rejects duplicate connections", () => {
    const result = validateConnection(
      { source: "node-1", target: "node-2", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
      [{ sourceNodeId: "node-1", targetNodeId: "node-2", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" }],
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/already exists/);
  });

  it("accepts valid connections", () => {
    const result = validateConnection(
      { source: "node-1", target: "node-2", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "in-Desc_IronIngot_C" },
      [],
    );
    expect(result.valid).toBe(true);
  });

  it("accepts connection to unassigned splitter (empty item)", () => {
    // Splitter has no item yet — handle is "bus-in-" (empty item)
    const result = validateConnection(
      { source: "node-1", target: "splitter-1", sourceHandle: "out-Desc_IronIngot_C", targetHandle: "bus-in-" },
      [],
    );
    expect(result.valid).toBe(true);
    expect(result.resolvedItem).toBe("Desc_IronIngot_C");
  });

  it("accepts connection from unassigned splitter (empty item)", () => {
    const result = validateConnection(
      { source: "splitter-1", target: "node-1", sourceHandle: "bus-out-", targetHandle: "in-Desc_IronIngot_C" },
      [],
    );
    expect(result.valid).toBe(true);
    expect(result.resolvedItem).toBe("Desc_IronIngot_C");
  });

  it("rejects connection when both sides have empty item", () => {
    const result = validateConnection(
      { source: "splitter-1", target: "merger-1", sourceHandle: "bus-out-", targetHandle: "bus-in-" },
      [],
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/unknown/i);
  });

  it("rejects invalid handle format", () => {
    const result = validateConnection(
      { source: "node-1", target: "node-2", sourceHandle: "bad", targetHandle: "in-Desc_IronIngot_C" },
      [],
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/Invalid handle/);
  });
});
