// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignInForm } from "./SignInForm";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  signIn: vi.fn().mockResolvedValue({ error: null }),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("SignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password fields", () => {
    render(<SignInForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders sign in button", () => {
    render(<SignInForm />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders GitHub button", () => {
    render(<SignInForm />);
    expect(screen.getByRole("button", { name: /github/i })).toBeInTheDocument();
  });

  it("shows error message on failed sign in", async () => {
    const { signIn } = await import("next-auth/react");
    vi.mocked(signIn).mockResolvedValue({ error: "CredentialsSignin", ok: false, status: 401, url: null });

    render(<SignInForm />);
    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid email or password/i);
  });

  it("email input is required", () => {
    render(<SignInForm />);
    expect(screen.getByLabelText("Email")).toBeRequired();
  });

  it("password input is required", () => {
    render(<SignInForm />);
    expect(screen.getByLabelText("Password")).toBeRequired();
  });
});
