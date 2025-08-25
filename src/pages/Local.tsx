import { Component } from "solid-js";
import { Controls } from "../components/Controls.js";
import { Board } from "../components/Board.js";
import { GameProvider, LocalGameConfig } from "../providers/Game.js";
import styles from "./Game.module.css";
import { createNanoEvents } from "nanoevents";
import { GameEventsHandlers } from "../types/GameEvents.js";

const Local: Component = () => {
  const emitter = createNanoEvents<GameEventsHandlers>();
  const gameConfig: LocalGameConfig = {
    gameType: "local",
    turn: "blue",
  };

  return (
    <GameProvider gameConfig={gameConfig} emitter={emitter}>
      <div class={styles.container}>
        <Controls />
        <Board />
      </div>
    </GameProvider>
  );
};

export default Local;
