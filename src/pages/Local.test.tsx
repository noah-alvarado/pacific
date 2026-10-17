import { describe, expect, test } from "vitest";

import { renderWithProviders } from "../test/render.jsx";

import Local from "./Local.jsx";

describe("<Local />", () => {
  test("renders a local game board", () => {
    const { container } = renderWithProviders(Local, { withRouter: false });

    const gameBoard = container.querySelector("#gameBoard");
    expect(gameBoard).not.toBeNull();
  });
});
