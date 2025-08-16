import { Component } from "solid-js";
import { Controls } from "../components/Controls.jsx";
import { Board } from "../components/Board.jsx";
import { GameProvider, LocalGameConfig } from "../providers/Game.jsx";
import styles from "./Game.module.css";

const Local: Component = () => {
  const gameConfig: LocalGameConfig = {
    gameType: "local",
    player: "blue",
    turn: "blue",
  };
  
  return (
    <GameProvider gameConfig={gameConfig}>
      <div class={styles.container}>
        <Controls />
        <Board />
      </div>
    </GameProvider>
  );
};

export default Local;
