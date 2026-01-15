// src/components/Config/components/__tests__/ClusterBrowserSettings.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClusterBrowserSettings } from "../ClusterBrowserSettings";
import { mockAnnounceToScreenReader } from "../../__tests__/test-utils";

describe("ClusterBrowserSettings", () => {
  beforeEach(() => {
    mockAnnounceToScreenReader.mockClear();
  });

  it("renders the enable toggle", () => {
    render(
      <ClusterBrowserSettings
        enabled={true}
        pageSize={20}
        onEnabledChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText(/enable cluster browser/i),
    ).toBeInTheDocument();
  });

  it("shows the toggle as checked when enabled", () => {
    render(
      <ClusterBrowserSettings
        enabled={true}
        pageSize={20}
        onEnabledChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /enable cluster browser/i,
    });
    expect(checkbox).toBeChecked();
  });

  it("calls onEnabledChange when toggle is clicked", async () => {
    const user = userEvent.setup();
    const onEnabledChange = vi.fn();

    render(
      <ClusterBrowserSettings
        enabled={false}
        pageSize={20}
        onEnabledChange={onEnabledChange}
        onPageSizeChange={vi.fn()}
      />,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /enable cluster browser/i,
    });
    await user.click(checkbox);

    expect(onEnabledChange).toHaveBeenCalledWith(true);
  });

  it("shows page size selector when enabled", () => {
    render(
      <ClusterBrowserSettings
        enabled={true}
        pageSize={20}
        onEnabledChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText(/cluster resource page load size/i),
    ).toBeInTheDocument();
  });

  it("hides page size selector when disabled", () => {
    render(
      <ClusterBrowserSettings
        enabled={false}
        pageSize={20}
        onEnabledChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByLabelText(/cluster resource page load size/i),
    ).not.toBeInTheDocument();
  });

  it("calls onPageSizeChange when page size is changed", async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();

    render(
      <ClusterBrowserSettings
        enabled={true}
        pageSize={20}
        onEnabledChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    const select = screen.getByLabelText(/cluster resource page load size/i);
    await user.selectOptions(select, "50");

    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it("announces page size change to screen readers", async () => {
    const user = userEvent.setup();

    render(
      <ClusterBrowserSettings
        enabled={true}
        pageSize={20}
        onEnabledChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    const select = screen.getByLabelText(/cluster resource page load size/i);
    await user.selectOptions(select, "100");

    expect(mockAnnounceToScreenReader).toHaveBeenCalledWith(
      "Page load size changed to 100 items",
    );
  });

  it("displays all page size options", () => {
    render(
      <ClusterBrowserSettings
        enabled={true}
        pageSize={20}
        onEnabledChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    const select = screen.getByLabelText(/cluster resource page load size/i);
    const options = Array.from(select.querySelectorAll("option"));

    expect(options).toHaveLength(5);
    expect(options.map((opt) => opt.value)).toEqual([
      "5",
      "10",
      "20",
      "50",
      "100",
    ]);
  });
});
