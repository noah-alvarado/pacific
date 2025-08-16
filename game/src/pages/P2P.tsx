import { Component, createSignal, JSX } from "solid-js";
import { Controls } from "../components/Controls.jsx";
import { Board } from "../components/Board.jsx";
import { GameProvider, P2PGameConfig } from "../providers/Game.jsx";
import styles from "./Game.module.css";

interface P2PGameProps {
  gameConfig: P2PGameConfig;
}

const P2PGame: Component<P2PGameProps> = (props) => {
  return (
    <GameProvider gameConfig={props.gameConfig}>
      <div class={styles.container}>
        <Controls />
        <Board />
      </div>
    </GameProvider>
  );
};

const P2P: Component = () => {
  const [gameConfig, setGameConfig] = createSignal<P2PGameConfig>({
    gameType: "p2p",
    player: "red",
    turn: "red",
  });

  function devTestConfig(): JSX.EventHandler<HTMLButtonElement, MouseEvent> {
    return (e) => {
      e.preventDefault();
      setGameConfig({
        gameType: "p2p",
        player: "blue",
        turn: "blue",
      });
    };
  }

  return (
    <>
      <p>P2PGame</p>
      <button onClick={devTestConfig()}>Reset Config</button>
      <P2PGame gameConfig={gameConfig()} />
    </>
  );
};

export default P2P;
