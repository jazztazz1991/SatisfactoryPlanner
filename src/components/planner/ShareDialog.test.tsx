// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ShareDialog } from "./ShareDialog";

vi.mock("@/components/shared/Button", () => ({
  Button: ({ children, onClick, loading, ...props }: { children: React.ReactNode; onClick?: () => void; loading?: boolean; size?: string }) => (
    <button onClick={onClick} disabled={loading} {...props}>{children}</button>
  ),
}));

const baseProps = {
  planId: "plan-1",
  isOpen: true,
  onClose: vi.fn(),
  shareToken: null,
  shareRole: null as "editor" | "viewer" | null,
};

describe("ShareDialog", () => {
  it("renders nothing when not open", () => {
    const { container } = render(<ShareDialog {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders share dialog with title when open", () => {
    render(<ShareDialog {...baseProps} />);
    expect(screen.getByText("Share Plan")).toBeInTheDocument();
  });

  it("has Invite People and Share Link tabs", () => {
    render(<ShareDialog {...baseProps} />);
    expect(screen.getByText("Invite People")).toBeInTheDocument();
    expect(screen.getByText("Share Link")).toBeInTheDocument();
  });

  it("shows email input and Invite button on invite tab", () => {
    render(<ShareDialog {...baseProps} />);
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByText("Invite")).toBeInTheDocument();
  });

  it("shows Enable button on share link tab", async () => {
    render(<ShareDialog {...baseProps} />);
    await userEvent.click(screen.getByText("Share Link"));
    expect(screen.getByText("Enable")).toBeInTheDocument();
    expect(screen.getByText("Link sharing is off")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn();
    render(<ShareDialog {...baseProps} onClose={onClose} />);
    await userEvent.click(screen.getByLabelText("Close share dialog"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking backdrop", async () => {
    const onClose = vi.fn();
    render(<ShareDialog {...baseProps} onClose={onClose} />);
    // Click the backdrop (the outer div)
    const backdrop = screen.getByText("Share Plan").closest(".fixed");
    if (backdrop) {
      await userEvent.click(backdrop);
    }
    expect(onClose).toHaveBeenCalled();
  });

  it("shows no collaborators message initially", () => {
    render(<ShareDialog {...baseProps} />);
    expect(screen.getByText("No collaborators yet")).toBeInTheDocument();
  });
});
