import { MemoryRouter, Route } from "@solidjs/router";
import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import { Page } from "../AppRouter.jsx";

import Landing from "./Landing.jsx";

describe("<Landing />", () => {
  function renderLanding() {
    return render(() => (
      <MemoryRouter>
        <Route path="/" component={Landing} />
      </MemoryRouter>
    ));
  }

  test("renders the title and subtitle", () => {
    const result = renderLanding();
    expect(result.getByText("PACIFIC")).toBeInTheDocument();
    expect(
      result.getByText("A strategic game about WW2 in the Pacific."),
    ).toBeInTheDocument();
  });

  test("renders a Start Local Game link pointing to the local page", () => {
    const result = renderLanding();
    const link = result.getByText("Start Local Game").closest("a");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toContain(Page.Local);
  });

  test("renders a Game Rules link pointing to the rules page", () => {
    const result = renderLanding();
    const link = result.getByText("Game Rules").closest("a");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toContain(Page.Rules);
  });
});
