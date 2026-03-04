// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders with default label", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading..." })).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<Spinner label="Fetching data" />);
    expect(screen.getByRole("status", { name: "Fetching data" })).toBeInTheDocument();
  });
});
