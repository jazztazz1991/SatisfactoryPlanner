// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignUpForm } from "./SignUpForm";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders name, email, and password fields", () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders create account button", () => {
    render(<SignUpForm />);
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("renders GitHub button", () => {
    render(<SignUpForm />);
    expect(screen.getByRole("button", { name: /github/i })).toBeInTheDocument();
  });

  it("email input is required", () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText("Email")).toBeRequired();
  });

  it("password input has minLength of 8", () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("minLength", "8");
  });
});
