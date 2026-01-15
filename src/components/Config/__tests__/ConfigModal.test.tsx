// src/components/Config/__tests__/ConfigModal.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigModal } from "../ConfigModal";
import {
  renderWithProviders,
  mockAnnounceToScreenReader,
  mockFeatureFlags,
} from "./test-utils";

describe("ConfigModal", () => {
  beforeEach(() => {
    mockAnnounceToScreenReader.mockClear();
    mockFeatureFlags({ CLUSTER_BROWSER: true });
  });

  it("renders the modal with all sections", () => {
    renderWithProviders(<ConfigModal onClose={vi.fn()} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /settings/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /appearance/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /api configuration/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /cluster browser/i }),
    ).toBeInTheDocument();
  });

  it("announces modal opening to screen readers", () => {
    renderWithProviders(<ConfigModal onClose={vi.fn()} />);

    expect(mockAnnounceToScreenReader).toHaveBeenCalledWith(
      "Settings dialog opened",
    );
  });

  it("closes when clicking the close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(<ConfigModal onClose={onClose} />);

    const closeButton = screen.getByRole("button", {
      name: /close settings dialog/i,
    });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("closes when clicking the cancel button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(<ConfigModal onClose={onClose} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("closes when pressing Escape key", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(<ConfigModal onClose={onClose} />);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });

  it("enables save button when changes are made", async () => {
    const user = userEvent.setup();

    renderWithProviders(<ConfigModal onClose={vi.fn()} />);

    const saveButton = screen.getByRole("button", {
      name: /no changes to save/i,
    });
    expect(saveButton).toBeDisabled();

    // Make a change
    const lightTheme = screen.getByRole("radio", { name: /light theme/i });
    await user.click(lightTheme);

    await waitFor(() => {
      const updatedSaveButton = screen.getByRole("button", {
        name: /save all changes/i,
      });
      expect(updatedSaveButton).not.toBeDisabled();
    });
  });

  it("shows unsaved changes status for screen readers", async () => {
    const user = userEvent.setup();

    renderWithProviders(<ConfigModal onClose={vi.fn()} />);

    expect(screen.getByText("No unsaved changes")).toBeInTheDocument();

    // Make a change
    const lightTheme = screen.getByRole("radio", { name: /light theme/i });
    await user.click(lightTheme);

    await waitFor(() => {
      expect(screen.getByText("You have unsaved changes")).toBeInTheDocument();
    });
  });

  it("applies theme changes immediately for preview", async () => {
    const user = userEvent.setup();

    renderWithProviders(<ConfigModal onClose={vi.fn()} />);

    const darkTheme = screen.getByRole("radio", { name: /dark theme/i });
    await user.click(darkTheme);

    expect(mockAnnounceToScreenReader).toHaveBeenCalledWith(
      "Theme changed to dark",
    );
  });

  it("saves all changes when save button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(<ConfigModal onClose={onClose} />);

    // Make changes
    const lightTheme = screen.getByRole("radio", { name: /light theme/i });
    await user.click(lightTheme);

    const apiInput = screen.getByLabelText(/backend api endpoint/i);
    await user.clear(apiInput);
    await user.type(apiInput, "http://new-api:8080");

    // Save
    const saveButton = screen.getByRole("button", {
      name: /save all changes/i,
    });
    await user.click(saveButton);

    expect(mockAnnounceToScreenReader).toHaveBeenCalledWith(
      "Settings saved successfully",
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("resets all settings to defaults when reset is clicked", async () => {
    const user = userEvent.setup();
    // Mock window.confirm
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithProviders(<ConfigModal onClose={vi.fn()} />);

    const resetButton = screen.getByRole("button", {
      name: /reset to defaults/i,
    });
    await user.click(resetButton);

    expect(window.confirm).toHaveBeenCalledWith(
      "Reset all settings to defaults?",
    );
    expect(mockAnnounceToScreenReader).toHaveBeenCalledWith(
      "All settings reset to defaults",
    );

    vi.restoreAllMocks();
  });

  it("does not reset if user cancels confirmation", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderWithProviders(<ConfigModal onClose={vi.fn()} />);

    const resetButton = screen.getByRole("button", {
      name: /reset to defaults/i,
    });
    await user.click(resetButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockAnnounceToScreenReader).not.toHaveBeenCalledWith(
      "All settings reset to defaults",
    );

    vi.restoreAllMocks();
  });

  describe("Feature Flag: Cluster Browser Disabled", () => {
    beforeEach(() => {
      mockFeatureFlags({ CLUSTER_BROWSER: false });
    });

    it("hides cluster browser sections when feature is disabled", () => {
      renderWithProviders(<ConfigModal onClose={vi.fn()} />);

      expect(
        screen.queryByRole("heading", { name: /api configuration/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /cluster browser/i }),
      ).not.toBeInTheDocument();
    });

    it("only shows appearance section when cluster browser is disabled", () => {
      renderWithProviders(<ConfigModal onClose={vi.fn()} />);

      expect(
        screen.getByRole("heading", { name: /appearance/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /settings/i }),
      ).toBeInTheDocument();
    });
  });
});
