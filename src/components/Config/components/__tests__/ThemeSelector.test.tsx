// src/components/Config/components/__tests__/ThemeSelector.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSelector } from "../ThemeSelector";

describe("ThemeSelector", () => {
  it("renders all theme options", () => {
    render(<ThemeSelector selectedTheme="system" onThemeChange={vi.fn()} />);

    expect(
      screen.getByRole("radio", { name: /light theme/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /dark theme/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /system theme/i })
    ).toBeInTheDocument();
  });

  it("marks the selected theme as checked", () => {
    render(<ThemeSelector selectedTheme="dark" onThemeChange={vi.fn()} />);

    const lightRadio = screen.getByRole("radio", { name: /light theme/i });
    const darkRadio = screen.getByRole("radio", { name: /dark theme/i });
    const systemRadio = screen.getByRole("radio", { name: /system theme/i });

    expect(lightRadio).toHaveAttribute("aria-checked", "false");
    expect(darkRadio).toHaveAttribute("aria-checked", "true");
    expect(systemRadio).toHaveAttribute("aria-checked", "false");
  });

  it("calls onThemeChange when a theme is selected", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();

    render(
      <ThemeSelector selectedTheme="system" onThemeChange={onThemeChange} />
    );

    const lightButton = screen.getByRole("radio", { name: /light theme/i });
    await user.click(lightButton);

    expect(onThemeChange).toHaveBeenCalledWith("light");
  });

  it("displays the preview note", () => {
    render(<ThemeSelector selectedTheme="system" onThemeChange={vi.fn()} />);

    expect(
      screen.getByText(/theme changes apply immediately for preview/i)
    ).toBeInTheDocument();
  });

  it("has proper ARIA structure", () => {
    render(<ThemeSelector selectedTheme="system" onThemeChange={vi.fn()} />);

    const radiogroup = screen.getByRole("radiogroup", {
      name: /theme selection/i,
    });
    expect(radiogroup).toBeInTheDocument();

    const heading = screen.getByRole("heading", { name: /appearance/i });
    expect(heading).toBeInTheDocument();
  });
});
