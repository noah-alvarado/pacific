import { MemoryRouter, Route } from "@solidjs/router";
import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import App from "./App.jsx";

describe("<App />", () => {
  test("renders the Header and child content inside a router", () => {
    const result = render(() => (
      <MemoryRouter>
        <Route
          path="/"
          component={() => (
            <App>
              <div data-testid="child">child-content</div>
            </App>
          )}
        />
      </MemoryRouter>
    ));

    // Header renders the PACIFIC title.
    expect(result.getByText("PACIFIC")).toBeInTheDocument();

    // Header nav contains expected links.
    expect(result.getByText("home")).toBeInTheDocument();
    expect(result.getByText("rules")).toBeInTheDocument();
    expect(result.getByText("local")).toBeInTheDocument();
    expect(result.getByText("online")).toBeInTheDocument();

    // The child is rendered inside the <main> region.
    const child = result.getByTestId("child");
    expect(child).toBeInTheDocument();
    expect(child.textContent).toBe("child-content");
    expect(child.parentElement?.tagName.toLowerCase()).toBe("main");
  });
});
