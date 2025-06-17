import { Board } from "../components/Board";
import { Component } from "solid-js";
import { Controls } from "../components/Controls";
import { GameProvider } from "../providers/Game";
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
