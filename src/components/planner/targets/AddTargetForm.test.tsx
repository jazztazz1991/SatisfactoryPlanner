// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AddTargetForm } from "./AddTargetForm";
import type { IItem } from "@/domain/types/game";

const items: IItem[] = [
  {
    className: "Desc_IronPlate_C",
    slug: "iron-plate",
    name: "Iron Plate",
    description: null,
    stackSize: 200,
    sinkPoints: 6,
    energyValue: null,
    radioactiveDecay: null,
    isLiquid: false,
    fluidColor: null,
    isRawResource: false,
  },
  {
    className: "Desc_IronRod_C",
    slug: "iron-rod",
    name: "Iron Rod",
    description: null,
    stackSize: 200,
    sinkPoints: 4,
    energyValue: null,
    radioactiveDecay: null,
    isLiquid: false,
    fluidColor: null,
    isRawResource: false,
  },
  {
    className: "Desc_CopperSheet_C",
    slug: "copper-sheet",
    name: "Copper Sheet",
    description: null,
    stackSize: 200,
    sinkPoints: 12,
    energyValue: null,
    radioactiveDecay: null,
    isLiquid: false,
    fluidColor: null,
    isRawResource: false,
  },
];

describe("AddTargetForm", () => {
  it("renders search input and rate input", () => {
    render(<AddTargetForm items={items} onAdd={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search items...")).toBeInTheDocument();
    expect(screen.getByLabelText("Rate (per min)")).toBeInTheDocument();
  });

  it("shows item suggestions when typing", async () => {
    render(<AddTargetForm items={items} onAdd={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText("Search items..."), "Iron");
    expect(screen.getByText("Iron Plate")).toBeInTheDocument();
    expect(screen.getByText("Iron Rod")).toBeInTheDocument();
    expect(screen.queryByText("Copper Sheet")).not.toBeInTheDocument();
  });

  it("selects an item from suggestions", async () => {
    render(<AddTargetForm items={items} onAdd={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText("Search items..."), "Iron Pl");
    await userEvent.click(screen.getByText("Iron Plate"));
    expect(screen.getByPlaceholderText("Search items...")).toHaveValue("Iron Plate");
  });

  it("calls onAdd with className and rate when Add is clicked", async () => {
    const onAdd = vi.fn();
    render(<AddTargetForm items={items} onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText("Search items..."), "Iron Pl");
    await userEvent.click(screen.getByText("Iron Plate"));
    const rateInput = screen.getByLabelText("Rate (per min)");
    await userEvent.clear(rateInput);
    await userEvent.type(rateInput, "60");
    await userEvent.click(screen.getByRole("button", { name: /add target/i }));
    expect(onAdd).toHaveBeenCalledWith("Desc_IronPlate_C", 60);
  });

  it("resets form after adding", async () => {
    const onAdd = vi.fn();
    render(<AddTargetForm items={items} onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText("Search items..."), "Iron Pl");
    await userEvent.click(screen.getByText("Iron Plate"));
    const rateInput = screen.getByLabelText("Rate (per min)");
    await userEvent.clear(rateInput);
    await userEvent.type(rateInput, "60");
    await userEvent.click(screen.getByRole("button", { name: /add target/i }));
    expect(screen.getByPlaceholderText("Search items...")).toHaveValue("");
    expect(screen.getByLabelText("Rate (per min)")).toHaveValue(1);
  });

  it("disables Add button when no item is selected", () => {
    render(<AddTargetForm items={items} onAdd={vi.fn()} />);
    expect(screen.getByRole("button", { name: /add target/i })).toBeDisabled();
  });

  it("hides suggestions when item is selected", async () => {
    render(<AddTargetForm items={items} onAdd={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText("Search items..."), "Iron Pl");
    await userEvent.click(screen.getByText("Iron Plate"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows suggestions again when search text changes after selection", async () => {
    render(<AddTargetForm items={items} onAdd={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText("Search items..."), "Iron Pl");
    await userEvent.click(screen.getByText("Iron Plate"));
    await userEvent.clear(screen.getByPlaceholderText("Search items..."));
    await userEvent.type(screen.getByPlaceholderText("Search items..."), "Cop");
    expect(screen.getByText("Copper Sheet")).toBeInTheDocument();
  });
});
