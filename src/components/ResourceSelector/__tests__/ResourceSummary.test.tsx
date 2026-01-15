// src/components/ResourceSelector/__tests__/ResourceSummary.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResourceSummary } from "../ResourceSummary";

describe("ResourceSummary", () => {
  describe("Rendering", () => {
    it("renders total resources count", () => {
      render(
        <ResourceSummary
          totalResources={5}
          customResourcesCount={0}
          totalPermissions={10}
        />,
      );

      expect(screen.getByText(/total resources: 5/i)).toBeInTheDocument();
    });

    it("renders total permissions count", () => {
      render(
        <ResourceSummary
          totalResources={5}
          customResourcesCount={0}
          totalPermissions={10}
        />,
      );

      expect(screen.getByText(/total permissions: 10/i)).toBeInTheDocument();
    });

    it("shows custom resources count when present", () => {
      render(
        <ResourceSummary
          totalResources={5}
          customResourcesCount={2}
          totalPermissions={10}
        />,
      );

      expect(screen.getByText(/2 custom/i)).toBeInTheDocument();
    });

    it("does not show custom count when zero", () => {
      render(
        <ResourceSummary
          totalResources={5}
          customResourcesCount={0}
          totalPermissions={10}
        />,
      );

      expect(screen.queryByText(/custom/i)).not.toBeInTheDocument();
    });

    it("shows warning about resources with no verbs", () => {
      render(
        <ResourceSummary
          totalResources={5}
          customResourcesCount={0}
          totalPermissions={10}
        />,
      );

      expect(
        screen.getByText(/resources with no verbs will not be included/i),
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(
        <ResourceSummary
          totalResources={5}
          customResourcesCount={2}
          totalPermissions={10}
        />,
      );

      const summary = screen.getByRole("status");
      expect(summary).toHaveAttribute("aria-live", "polite");
      expect(summary).toHaveAttribute("aria-atomic", "true");
    });
  });

  describe("Edge Cases", () => {
    it("handles zero resources", () => {
      render(
        <ResourceSummary
          totalResources={0}
          customResourcesCount={0}
          totalPermissions={0}
        />,
      );

      expect(screen.getByText(/total resources: 0/i)).toBeInTheDocument();
    });

    it("handles large numbers", () => {
      render(
        <ResourceSummary
          totalResources={100}
          customResourcesCount={50}
          totalPermissions={500}
        />,
      );

      expect(screen.getByText(/total resources: 100/i)).toBeInTheDocument();
      expect(screen.getByText(/50 custom/i)).toBeInTheDocument();
      expect(screen.getByText(/total permissions: 500/i)).toBeInTheDocument();
    });
  });
});
