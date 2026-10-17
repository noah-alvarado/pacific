import { render } from "@solidjs/testing-library";
import { beforeEach, describe, expect, test, vi } from "vitest";

import PreferencesProvider, {
  parsePreferences,
  PREFERENCES_KEY,
  usePreferences,
} from "./Preferences.jsx";

function makeMatchMedia(matches: boolean) {
  return vi.fn().mockReturnValue({
    matches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}

function renderPreferences() {
  let ctx!: ReturnType<typeof usePreferences>;
  const Consumer = () => {
    ctx = usePreferences();
    return <div data-testid="t">{ctx.theme()}</div>;
  };
  const result = render(() => (
    <PreferencesProvider>
      <Consumer />
    </PreferencesProvider>
  ));
  return { ...result, ctx };
}

const stored = () =>
  JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "null") as unknown;

describe("<PreferencesProvider />", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("theme follows prefers-color-scheme when unset", () => {
    vi.stubGlobal("matchMedia", makeMatchMedia(true));
    expect(renderPreferences().getByTestId("t").textContent).toBe("dark");
  });

  test("defaults to light when prefers-color-scheme is light", () => {
    vi.stubGlobal("matchMedia", makeMatchMedia(false));
    expect(renderPreferences().getByTestId("t").textContent).toBe("light");
  });

  test("a saved theme overrides prefers-color-scheme", () => {
    vi.stubGlobal("matchMedia", makeMatchMedia(true));
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ theme: "light" }));
    expect(renderPreferences().getByTestId("t").textContent).toBe("light");
  });

  test("toggleDarkMode flips and persists the theme", () => {
    vi.stubGlobal("matchMedia", makeMatchMedia(false));
    const { ctx, getByTestId } = renderPreferences();
    ctx.toggleDarkMode();
    expect(getByTestId("t").textContent).toBe("dark");
    expect(stored()).toMatchObject({ theme: "dark" });
    ctx.toggleDarkMode();
    expect(getByTestId("t").textContent).toBe("light");
    expect(stored()).toMatchObject({ theme: "light" });
  });

  test("upright pieces forces upright numbers without overwriting it", () => {
    const { ctx } = renderPreferences();
    expect(ctx.uprightNumbers()).toBe(false);
    ctx.setPreferences("uprightPieces", true);
    expect(ctx.uprightNumbers()).toBe(true);
    expect(ctx.preferences.uprightNumbers).toBe(false);
    expect(stored()).toMatchObject({
      uprightPieces: true,
      uprightNumbers: false,
    });
  });

  test("local and online board rotations are stored separately", () => {
    const { ctx } = renderPreferences();
    ctx.setPreferences("boardRotation", "online", 3);
    expect(stored()).toMatchObject({ boardRotation: { local: 0, online: 3 } });
  });

  test("restores saved preferences", () => {
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        uprightNumbers: true,
        uprightPieces: false,
        boardRotation: { local: 2, online: 1 },
      }),
    );
    const { ctx } = renderPreferences();
    expect(ctx.preferences.uprightNumbers).toBe(true);
    expect(ctx.preferences.boardRotation).toEqual({ local: 2, online: 1 });
  });

  test("corrupt saved preferences fall back to defaults", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem(PREFERENCES_KEY, "{not json");
    const { ctx } = renderPreferences();
    expect(ctx.preferences.boardRotation).toEqual({ local: 0, online: 0 });
    expect(ctx.preferences.uprightPieces).toBe(false);
  });

  test("migrates settings saved under legacy keys", () => {
    localStorage.setItem("theme", "dark");
    localStorage.setItem("boardRotation", "3");
    localStorage.setItem("uprightNumbers", "true");
    const { ctx } = renderPreferences();
    expect(ctx.theme()).toBe("dark");
    expect(ctx.preferences.boardRotation.local).toBe(3);
    expect(ctx.preferences.uprightNumbers).toBe(true);
    expect(localStorage.getItem("theme")).toBeNull();
    expect(localStorage.getItem("boardRotation")).toBeNull();
    expect(localStorage.getItem("uprightNumbers")).toBeNull();
  });

  test("usePreferences throws outside a provider", () => {
    const Consumer = () => {
      usePreferences();
      return <div />;
    };
    expect(() => render(() => <Consumer />)).toThrow(
      /can't find PreferencesContext/,
    );
  });
});

describe("parsePreferences", () => {
  test("drops invalid fields", () => {
    expect(
      parsePreferences({
        theme: "purple",
        uprightNumbers: "yes",
        uprightPieces: 1,
        boardRotation: { local: 7, online: 1.5 },
      }),
    ).toEqual({
      uprightNumbers: false,
      uprightPieces: false,
      boardRotation: { local: 0, online: 0 },
    });
  });

  test("handles non-object input", () => {
    expect(parsePreferences(null).boardRotation).toEqual({
      local: 0,
      online: 0,
    });
    expect(parsePreferences("x").uprightPieces).toBe(false);
  });
});
