import { Board } from "../components/Board";
import { Component } from "solid-js";
import { Controls } from "../components/Controls";
import { GameLogicProvider } from "../providers/GameLogic";
import styles from "./Local.module.css";

const Local: Component = () => {
  return (
    <GameLogicProvider gameId="local" player="local" turn="blue">
      <div class={styles.container}>
        <Controls />
        <Board />
      </div>
    </GameLogicProvider>
  );
};

export default Local;
