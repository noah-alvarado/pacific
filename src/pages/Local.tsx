import { createNanoEvents } from "nanoevents";
import { Component } from "solid-js";

import { Game } from "../components/Game.jsx";
import { LocalGameConfig } from "../types/GameConfig.js";
import { GameEventsHandlers } from "../types/GameEvents.js";

const Local: Component = () => {
  const emitter = createNanoEvents<GameEventsHandlers>();
  const gameConfig: LocalGameConfig = {
    gameType: "local",
    turn: "blue",
  };

  return <Game gameConfig={gameConfig} emitter={emitter} />;
};

export default Local;
