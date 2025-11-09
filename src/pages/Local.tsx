import { Component } from "solid-js";
import { Game } from "../components/Game.jsx";
import { createNanoEvents } from "nanoevents";
import { GameEventsHandlers } from "../types/GameEvents.js";
import { LocalGameConfig } from "../types/GameConfig.js";

const Local: Component = () => {
  const emitter = createNanoEvents<GameEventsHandlers>();
  const gameConfig: LocalGameConfig = {
    gameType: "local",
    turn: "blue",
  };

  return <Game gameConfig={gameConfig} emitter={emitter} />;
};

export default Local;
