import { describe, expect, test } from "vitest";

import { GameProvider, LocalGameConfig } from "./Game.jsx";
import { render } from "@solidjs/testing-library";

describe("<GameProvider />", () => {
  test("renders children", () => {
    const gameConfig: LocalGameConfig = {
      gameType: "local",
      turn: "blue",
    };

    const results = render(() => (
      <GameProvider gameConfig={gameConfig}>
        <div>Test Child</div>
      </GameProvider>
    ));
    expect(results.getByText("Test Child")).toBeDefined();
  });
});
