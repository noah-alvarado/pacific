import { describe, expect, test } from "vitest";

import { Game, LocalGameConfig } from "./Game.jsx";
import { render } from "@solidjs/testing-library";
import { createNanoEvents } from "nanoevents";
import { GameEventsHandlers } from "../types/GameEvents.js";
import ModalProvider from "../providers/Modal.jsx";

describe("<Game />", () => {
  test("renders children", () => {
    const emitter = createNanoEvents<GameEventsHandlers>();
    const gameConfig: LocalGameConfig = {
      gameType: "local",
      turn: "blue",
    };

    const results = render(() => (
      <ModalProvider>
        <Game gameConfig={gameConfig} emitter={emitter} />
      </ModalProvider>
    ));

    const gameBoard = results.container.querySelector("#gameBoard");
    expect(gameBoard).not.toBeNull();
  });
});
