import { beforeEach, describe, expect, test, vi } from "vitest";

import { renderWithProviders } from "../test/render.jsx";

import GameOverModal from "./GameOverModal.jsx";

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );
}

describe("<GameOverModal />", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  test("renders RED winner text", () => {
    stubMatchMedia(false);
    const { getByTestId, getByText } = renderWithProviders(
      () => <GameOverModal winner="red" />,
      { withRouter: false },
    );
    expect(getByTestId("game-over").getAttribute("data-winner")).toBe("red");
    expect(getByText("RED")).toBeInTheDocument();
  });

  test("renders BLUE winner text", () => {
    stubMatchMedia(false);
    const { getByText, getByTestId } = renderWithProviders(
      () => <GameOverModal winner="blue" />,
      { withRouter: false },
    );
    expect(getByTestId("game-over").getAttribute("data-winner")).toBe("blue");
    expect(getByText("BLUE")).toBeInTheDocument();
  });

  test("renders draw text when winner undefined", () => {
    stubMatchMedia(false);
    const { getByText, getByTestId } = renderWithProviders(
      () => <GameOverModal winner={undefined} />,
      { withRouter: false },
    );
    expect(getByTestId("game-over").getAttribute("data-winner")).toBe("draw");
    expect(getByText("The game has ended in a draw.")).toBeInTheDocument();
  });

  test("light theme applies player color hex", () => {
    stubMatchMedia(false);
    localStorage.setItem("theme", "light");
    const { getByText } = renderWithProviders(
      () => <GameOverModal winner="red" />,
      { withRouter: false },
    );
    const span = getByText("RED");
    // Browsers normalize hex to rgb; accept either form.
    expect(span.getAttribute("style") ?? "").toMatch(
      /#FF0000|rgb\(255,\s*0,\s*0\)/i,
    );
  });

  test("dark theme omits explicit color style", () => {
    stubMatchMedia(true);
    localStorage.setItem("theme", "dark");
    const { getByText } = renderWithProviders(
      () => <GameOverModal winner="blue" />,
      { withRouter: false },
    );
    const span = getByText("BLUE");
    expect(span.getAttribute("style") ?? "").not.toMatch(
      /#0000FF|rgb\(0,\s*0,\s*255\)/i,
    );
  });
});
