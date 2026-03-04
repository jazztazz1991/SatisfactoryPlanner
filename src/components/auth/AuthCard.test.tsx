// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AuthCard } from "./AuthCard";

describe("AuthCard", () => {
  it("renders the title", () => {
    render(<AuthCard title="Sign In"><p>content</p></AuthCard>);
    expect(screen.getByRole("heading", { name: "Sign In" })).toBeInTheDocument();
  });

  it("renders optional subtitle", () => {
    render(<AuthCard title="Sign In" subtitle="Welcome back"><p>content</p></AuthCard>);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<AuthCard title="Test"><button>Submit</button></AuthCard>);
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    render(<AuthCard title="Sign In"><p>content</p></AuthCard>);
    expect(screen.queryByText("Welcome back")).not.toBeInTheDocument();
  });
});
