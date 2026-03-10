// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("renders with a label", () => {
    render(<Input label="Email" id="email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input error="Required" id="field" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("applies error styling when error is present", () => {
    render(<Input error="Bad" id="field" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-danger");
  });

  it("renders without label or error", () => {
    render(<Input id="bare" placeholder="Enter value" />);
    expect(screen.getByPlaceholderText("Enter value")).toBeInTheDocument();
  });
});
