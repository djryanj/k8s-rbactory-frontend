// src/icons/components/__tests__/K8sResourceIcon.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { K8sResourceIcon } from "../K8sResourceIcon";
import { resetIconCache } from "../../services/iconCache";

// Mock the resolver
vi.mock("../../services/iconResolver", () => ({
  resolveIcon: vi.fn(({ kind, hasImageError }) => {
    if (hasImageError) {
      return {
        type: "svg",
        component: () => <div data-testid="fallback-icon">{kind}</div>,
        source: "category",
      };
    }

    if (kind === "pod") {
      return {
        type: "image",
        url: "https://cdn.example.com/pod.svg",
        source: "cdn",
      };
    }

    return {
      type: "svg",
      component: () => <div data-testid="fallback-icon">{kind}</div>,
      source: "default",
    };
  }),
}));

describe("K8sResourceIcon", () => {
  beforeEach(() => {
    resetIconCache();
    vi.clearAllMocks();
  });

  it("should render image for CDN icons", () => {
    render(<K8sResourceIcon kind="pod" />);

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://cdn.example.com/pod.svg");
  });

  it("should render SVG for fallback icons", () => {
    render(<K8sResourceIcon kind="unknown" />);

    const fallback = screen.getByTestId("fallback-icon");
    expect(fallback).toBeInTheDocument();
  });

  it("should apply size prop", () => {
    render(<K8sResourceIcon kind="pod" size={32} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "32");
    expect(img).toHaveAttribute("height", "32");
  });

  it("should apply className", () => {
    render(<K8sResourceIcon kind="pod" className="custom-class" />);

    const img = screen.getByRole("img");
    expect(img).toHaveClass("custom-class");
  });

  it("should use eager loading when specified", () => {
    render(<K8sResourceIcon kind="pod" eager />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("should use lazy loading by default", () => {
    render(<K8sResourceIcon kind="pod" />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("should have proper alt text", () => {
    render(<K8sResourceIcon kind="pod" />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "pod icon");
  });

  it("should call onError when image fails to load", async () => {
    const onError = vi.fn();
    render(<K8sResourceIcon kind="pod" onError={onError} />);

    const img = screen.getByRole("img");

    // Simulate image error
    img.dispatchEvent(new Event("error"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("pod");
    });
  });
});
