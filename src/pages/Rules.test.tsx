import { describe, expect, test } from "vitest";

import { renderWithProviders } from "../test/render.jsx";

import Rules from "./Rules.jsx";

describe("<Rules />", () => {
  test("has a single top-level heading", () => {
    const result = renderWithProviders(() => <Rules />, { withRouter: false });

    const h1s = result.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Pacific Game Rules");
  });

  test("organises the rules under accessible section headings", () => {
    const result = renderWithProviders(() => <Rules />, { withRouter: false });

    for (const name of ["Pacific Type A", "Pacific Type B", "General Notes"]) {
      expect(
        result.getByRole("heading", { level: 2, name }),
      ).toBeInTheDocument();
    }
    for (const name of [
      "Setup",
      "Movement",
      "Attacks",
      "Kamikazes",
      "Winning the Game",
    ]) {
      expect(
        result.getByRole("heading", { level: 3, name }),
      ).toBeInTheDocument();
    }
  });

  test("matches the original rules text", () => {
    const result = renderWithProviders(() => <Rules />, { withRouter: false });

    expect(
      result.getByText(/Board Wargame for 2 Players/i),
    ).toBeInTheDocument();
    expect(
      result.getByText(
        /Each player starts the game with four Aircraft Carriers and eight Attack Planes/,
      ),
    ).toBeInTheDocument();
    expect(
      result.getByText(
        /Pacific Type B is for players who have already mastered Pacific A/,
      ),
    ).toBeInTheDocument();
    expect(result.getByText(/he has won the game/)).toBeInTheDocument();
    expect(
      result.getByText(/Copyright Ian Hamilton Finlay 1975/),
    ).toBeInTheDocument();
  });

  test("includes the four rule figures", () => {
    const result = renderWithProviders(() => <Rules />, { withRouter: false });

    expect(
      result.getByAltText(/Four Carriers set on the back row/),
    ).toBeInTheDocument();
    expect(
      result.getByAltText(/An Attack Plane that reaches the enemy back row/),
    ).toBeInTheDocument();
  });
});
