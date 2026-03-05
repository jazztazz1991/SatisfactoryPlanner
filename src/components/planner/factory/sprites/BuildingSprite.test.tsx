// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BuildingSprite } from "./BuildingSprite";
import type { SpriteKey } from "@/domain/factory/buildingSprites";

const ALL_KEYS: SpriteKey[] = [
  "smelter",
  "constructor",
  "assembler",
  "manufacturer",
  "foundry",
  "refinery",
  "blender",
  "packager",
  "particle_accelerator",
  "miner",
  "splitter",
  "merger",
  "unknown",
];

describe("BuildingSprite", () => {
  it.each(ALL_KEYS)("renders %s sprite without crashing", (key) => {
    render(<BuildingSprite spriteKey={key} />);
    expect(screen.getByLabelText(/.+/)).toBeInTheDocument();
  });

  it("renders with correct aria-label for smelter", () => {
    render(<BuildingSprite spriteKey="smelter" />);
    expect(screen.getByLabelText("Smelter")).toBeInTheDocument();
  });

  it("renders with correct aria-label for unknown", () => {
    render(<BuildingSprite spriteKey="unknown" />);
    expect(screen.getByLabelText("Building")).toBeInTheDocument();
  });

  it("respects custom size", () => {
    render(<BuildingSprite spriteKey="constructor" size={64} />);
    const svg = screen.getByLabelText("Constructor");
    expect(svg).toHaveAttribute("width", "64");
    expect(svg).toHaveAttribute("height", "64");
  });

  it("defaults to size 32", () => {
    render(<BuildingSprite spriteKey="assembler" />);
    const svg = screen.getByLabelText("Assembler");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });
});
