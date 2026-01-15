// src/components/Config/components/__tests__/ApiConfiguration.test.tsx
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiConfiguration } from "../ApiConfiguration";
import { renderWithProviders } from "../../__tests__/test-utils";

describe("ApiConfiguration", () => {
  it("renders the API endpoint input", () => {
    renderWithProviders(
      <ApiConfiguration
        endpoint="http://localhost:8080/api/v1"
        onEndpointChange={vi.fn()}
      />,
    );

    const input = screen.getByLabelText(/backend api endpoint/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("http://localhost:8080/api/v1");
  });

  it("calls onEndpointChange when input value changes", async () => {
    const user = userEvent.setup();
    const onEndpointChange = vi.fn();

    renderWithProviders(
      <ApiConfiguration
        endpoint="http://localhost:8080/api/v1"
        onEndpointChange={onEndpointChange}
      />,
    );

    const input = screen.getByLabelText(/backend api endpoint/i);
    await user.clear(input);
    await user.type(input, "http://new-endpoint:9090/api");

    expect(onEndpointChange).toHaveBeenCalled();
    // Get the last call's argument
    const calls = onEndpointChange.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toContain("http://new-endpoint:9090/api");
  });

  it("displays the description text", () => {
    renderWithProviders(
      <ApiConfiguration
        endpoint="http://localhost:8080/api/v1"
        onEndpointChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        /the backend api server endpoint for cluster operations/i,
      ),
    ).toBeInTheDocument();
  });

  it("has proper input attributes", () => {
    renderWithProviders(
      <ApiConfiguration
        endpoint="http://localhost:8080/api/v1"
        onEndpointChange={vi.fn()}
      />,
    );

    const input = screen.getByLabelText(/backend api endpoint/i);
    expect(input).toHaveAttribute("type", "url");
    expect(input).toHaveAttribute(
      "placeholder",
      "http://localhost:8080/api/v1",
    );
    expect(input).toHaveAttribute(
      "aria-describedby",
      "api-endpoint-description",
    );
  });
});
