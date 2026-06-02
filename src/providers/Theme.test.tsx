import { render } from "@solidjs/testing-library";
import { beforeEach, describe, expect, test, vi } from "vitest";

import ThemeProvider, { useThemeContext } from "./Theme.jsx";

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

describe("<ThemeProvider />", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  test("defaults to dark when prefers-color-scheme is dark", () => {
    vi.stubGlobal("matchMedia", makeMatchMedia(true));

    let captured: string | undefined;
    const Consumer = () => {
      const { theme } = useThemeContext();
      captured = theme();
      return <div data-testid="t">{theme()}</div>;
    };

    const { getByTestId } = render(() => (
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    ));

    expect(captured).toBe("dark");
    expect(getByTestId("t").textContent).toBe("dark");
  });

  test("defaults to light when prefers-color-scheme is light", () => {
    vi.stubGlobal("matchMedia", makeMatchMedia(false));

    const Consumer = () => {
      const { theme } = useThemeContext();
      return <div data-testid="t">{theme()}</div>;
    };

    const { getByTestId } = render(() => (
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    ));

    expect(getByTestId("t").textContent).toBe("light");
  });

  test("localStorage theme overrides matchMedia default", () => {
    vi.stubGlobal("matchMedia", makeMatchMedia(true));
    localStorage.setItem("theme", "light");

    const Consumer = () => {
      const { theme } = useThemeContext();
      return <div data-testid="t">{theme()}</div>;
    };

    const { getByTestId } = render(() => (
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    ));

    expect(getByTestId("t").textContent).toBe("light");
  });

  test("toggleDarkMode flips theme and persists to localStorage", () => {
    vi.stubGlobal("matchMedia", makeMatchMedia(false));

    let toggle!: () => void;
    const Consumer = () => {
      const { theme, toggleDarkMode } = useThemeContext();
      toggle = toggleDarkMode;
      return <div data-testid="t">{theme()}</div>;
    };

    const { getByTestId } = render(() => (
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    ));

    expect(getByTestId("t").textContent).toBe("light");
    toggle();
    expect(getByTestId("t").textContent).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    toggle();
    expect(getByTestId("t").textContent).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  test("setTheme directly sets the theme", () => {
    vi.stubGlobal("matchMedia", makeMatchMedia(false));

    let setter!: (t: "light" | "dark") => void;
    const Consumer = () => {
      const { theme, setTheme } = useThemeContext();
      setter = setTheme;
      return <div data-testid="t">{theme()}</div>;
    };

    const { getByTestId } = render(() => (
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    ));

    setter("dark");
    expect(getByTestId("t").textContent).toBe("dark");
  });

  test("useThemeContext throws outside a provider", () => {
    const Consumer = () => {
      useThemeContext();
      return <div />;
    };

    expect(() => render(() => <Consumer />)).toThrow(/can't find ThemeContext/);
  });
});
