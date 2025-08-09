import { describe, expect, test } from "vitest";

import { GameProvider } from "./Game.jsx";
import { render } from "@solidjs/testing-library";

describe("<GameLogicProvider />", () => {
  test("renders children", () => {
    const results = render(() => (
      <GameProvider player="local" gameId="local" turn="blue">
        <div>Test Child</div>
      </GameProvider>
    ));
    expect(results.getByText("Test Child")).toBeDefined();
  });
});
