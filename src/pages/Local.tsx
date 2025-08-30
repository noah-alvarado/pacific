import { Component } from "solid-js";
import { Game, LocalGameConfig } from "../components/Game.jsx";
import { createNanoEvents } from "nanoevents";
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
