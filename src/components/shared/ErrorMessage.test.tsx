// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage", () => {
  it("displays the error message", () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("shows retry button when onRetry is provided", () => {
    render(<ErrorMessage message="Failed" onRetry={vi.fn()} />);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls onRetry when try again is clicked", async () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Failed" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not show retry button without onRetry", () => {
    render(<ErrorMessage message="Failed" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
