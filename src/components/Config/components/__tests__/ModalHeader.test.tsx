// src/components/Config/components/__tests__/ModalHeader.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalHeader } from "../ModalHeader";

describe("ModalHeader", () => {
  it("renders the title correctly", () => {
    render(<ModalHeader title="Test Settings" onClose={vi.fn()} />);

    expect(screen.getByText("Test Settings")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Test Settings" }),
    ).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ModalHeader title="Settings" onClose={onClose} />);

    const closeButton = screen.getByRole("button", {
      name: /close settings dialog/i,
    });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("focuses the close button when firstFocusableRef is provided", () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <ModalHeader
        title="Settings"
        onClose={vi.fn()}
        firstFocusableRef={ref}
      />,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("has proper accessibility attributes", () => {
    render(<ModalHeader title="Settings" onClose={vi.fn()} />);

    const closeButton = screen.getByRole("button", {
      name: /close settings dialog/i,
    });
    expect(closeButton).toHaveAttribute("type", "button");
    expect(closeButton).toHaveAttribute("aria-label", "Close settings dialog");
  });
});
