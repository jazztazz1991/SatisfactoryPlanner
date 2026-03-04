// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(<Modal open={false} onClose={vi.fn()} title="Test"><p>Content</p></Modal>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders title and children when open", () => {
    render(<Modal open onClose={vi.fn()} title="My Modal"><p>Body content</p></Modal>);
    expect(screen.getByRole("dialog", { name: "My Modal" })).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Test"><p>Content</p></Modal>);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Test"><p>Content</p></Modal>);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });
});
