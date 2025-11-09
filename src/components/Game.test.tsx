import { render } from "@solidjs/testing-library";
import { createNanoEvents } from "nanoevents";
import { describe, expect, test } from "vitest";

import ModalProvider from "../providers/Modal.jsx";
import { LocalGameConfig } from "../types/GameConfig.js";
import { GameEventsHandlers } from "../types/GameEvents.js";

import { Game } from "./Game.jsx";

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
