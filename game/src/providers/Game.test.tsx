import { describe, expect, test } from "vitest";

import { GameProvider } from "./Game";
import { render } from "@solidjs/testing-library";

describe("<GameLogicProvider />", () => {
  test("renders children", () => {
    const results = render(() => (
      <GameProvider player={"local"}>
        <div>Test Child</div>
      </GameProvider>
    ));
    expect(results.getByText("Test Child")).toBeDefined();
  });
});
