import { Board } from "../components/Board.jsx";
import { Component } from "solid-js";
import { Controls } from "../components/Controls.jsx";
import { GameProvider } from "../providers/Game.jsx";
import styles from "./Local.module.css";

const Local: Component = () => {
  return (
    <GameProvider gameId="local" player="local" turn="blue">
      <div class={styles.container}>
        <Controls />
        <Board />
      </div>
    </GameProvider>
  );
};

export default Local;
