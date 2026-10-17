import { fireEvent } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { PREFERENCES_KEY } from "../providers/Preferences.jsx";
import { renderWithProviders } from "../test/render.jsx";

import Header from "./Header.jsx";

describe("<Header />", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("renders the four navigation links", () => {
    const { getByText } = renderWithProviders(() => <Header />);
    expect(getByText("home")).toBeInTheDocument();
    expect(getByText("rules")).toBeInTheDocument();
    expect(getByText("local")).toBeInTheDocument();
    expect(getByText("online")).toBeInTheDocument();
  });

  test("dark-mode toggle flips theme and updates aria-label", async () => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ theme: "light" }));
    const { getByLabelText } = renderWithProviders(() => <Header />);
    const toggle = getByLabelText("Switch to dark mode") as HTMLButtonElement;
    fireEvent.click(toggle);
    // After toggle, aria-label should change to "Switch to light mode"
    expect(toggle.getAttribute("aria-label")).toBe("Switch to light mode");
    expect(
      JSON.parse(localStorage.getItem(PREFERENCES_KEY)!) as unknown,
    ).toMatchObject({ theme: "dark" });
  });

  test("burger button is always shown", () => {
    const { queryByLabelText } = renderWithProviders(() => <Header />);
    expect(
      queryByLabelText("Open navigation menu") ??
        queryByLabelText("Close navigation menu"),
    ).not.toBeNull();
  });

  test("clicking burger toggles aria-expanded and clicking a nav link closes it", () => {
    const { getByLabelText, getByText } = renderWithProviders(() => <Header />);
    const burger = getByLabelText("Open navigation menu") as HTMLButtonElement;
    expect(burger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(burger);
    // burger label flips
    const expanded = getByLabelText(
      "Close navigation menu",
    ) as HTMLButtonElement;
    expect(expanded.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(getByText("home"));
    // After clicking a link, nav closes (effect resets navOpen)
    expect(
      getByLabelText("Open navigation menu").getAttribute("aria-expanded"),
    ).toBe("false");
  });

  test("sets document.documentElement.dataset.theme on render", () => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ theme: "dark" }));
    renderWithProviders(() => <Header />);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
