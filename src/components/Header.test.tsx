import { fireEvent } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

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

  function setWindowWidth(w: number) {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: w,
    });
    window.dispatchEvent(new Event("resize"));
  }

  test("renders the four navigation links", () => {
    setWindowWidth(1024);
    const { getByText } = renderWithProviders(() => <Header />);
    expect(getByText("home")).toBeInTheDocument();
    expect(getByText("rules")).toBeInTheDocument();
    expect(getByText("local")).toBeInTheDocument();
    expect(getByText("online")).toBeInTheDocument();
  });

  test("dark-mode toggle flips theme and updates aria-label", async () => {
    setWindowWidth(1024);
    localStorage.setItem("theme", "light");
    const { getByLabelText } = renderWithProviders(() => <Header />);
    const toggle = getByLabelText("Switch to dark mode") as HTMLButtonElement;
    fireEvent.click(toggle);
    // After toggle, aria-label should change to "Switch to light mode"
    expect(toggle.getAttribute("aria-label")).toBe("Switch to light mode");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  test("burger button shows when window width < 720", () => {
    setWindowWidth(500);
    const { queryByLabelText } = renderWithProviders(() => <Header />);
    expect(
      queryByLabelText("Open navigation menu") ??
        queryByLabelText("Close navigation menu"),
    ).not.toBeNull();
  });

  test("burger button hides when window width >= 720", () => {
    setWindowWidth(1024);
    const { queryByLabelText } = renderWithProviders(() => <Header />);
    expect(queryByLabelText("Open navigation menu")).toBeNull();
  });

  test("clicking burger toggles aria-expanded and clicking a nav link closes it", () => {
    setWindowWidth(500);
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
    setWindowWidth(1024);
    localStorage.setItem("theme", "dark");
    renderWithProviders(() => <Header />);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
