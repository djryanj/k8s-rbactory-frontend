// src/components/Config/components/__tests__/ModalFooter.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalFooter } from "../ModalFooter";

describe("ModalFooter", () => {
  it("renders all action buttons", () => {
    render(
      <ModalFooter
        hasChanges={false}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /reset to defaults/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
  });

  it("disables save button when there are no changes", () => {
    render(
      <ModalFooter
        hasChanges={false}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    const saveButton = screen.getByRole("button", {
      name: /no changes to save/i,
    });
    expect(saveButton).toBeDisabled();
  });

  it("enables save button when there are changes", () => {
    render(
      <ModalFooter
        hasChanges={true}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    const saveButton = screen.getByRole("button", {
      name: /save all changes/i,
    });
    expect(saveButton).not.toBeDisabled();
  });

  it("calls onSave when save button is clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <ModalFooter
        hasChanges={true}
        onSave={onSave}
        onCancel={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    const saveButton = screen.getByRole("button", {
      name: /save all changes/i,
    });
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ModalFooter
        hasChanges={false}
        onSave={vi.fn()}
        onCancel={onCancel}
        onReset={vi.fn()}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onReset when reset button is clicked", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(
      <ModalFooter
        hasChanges={false}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onReset={onReset}
      />,
    );

    const resetButton = screen.getByRole("button", {
      name: /reset to defaults/i,
    });
    await user.click(resetButton);

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
