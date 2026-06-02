import { describe, expect, test } from "vitest";

import { renderWithProviders } from "../test/render.jsx";

import Rules from "./Rules.jsx";

describe("<Rules />", () => {
  test("renders the page heading and key sections", () => {
    const result = renderWithProviders(() => <Rules />, { withRouter: false });

    expect(result.getByText("Pacific Game Rules")).toBeInTheDocument();
    expect(result.getByText("General")).toBeInTheDocument();
    expect(result.getByText("Pacific Type A")).toBeInTheDocument();
    expect(result.getByText("Pacific Type B")).toBeInTheDocument();
    expect(result.getByText("Winning the Game")).toBeInTheDocument();
  });
});
