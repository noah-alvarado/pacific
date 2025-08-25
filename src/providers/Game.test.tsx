import { describe, expect, test } from "vitest";

import { GameProvider, LocalGameConfig } from "./Game.jsx";
import { render } from "@solidjs/testing-library";
import { createNanoEvents } from "nanoevents";
import { GameEvent } from "../types/GameEvents.js";

describe("<GameProvider />", () => {
  test("renders children", () => {
    const emitter = createNanoEvents<GameEvent>();
    const gameConfig: LocalGameConfig = {
      gameType: "local",
      emitter,
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
