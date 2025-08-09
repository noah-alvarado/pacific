import { batch, Component, JSX } from "solid-js";
import { INITIAL_STATE } from "../constants/game.js";

import { reconcile } from "solid-js/store";
import styles from "./Controls.module.css";
import { useGameContext } from "../providers/Game.jsx";
import { useModalContext } from "../providers/Modal.jsx";

export const Controls: Component = () => {
  const { game, setGame, initialPieces } = useGameContext();
  const { closeModal } = useModalContext();

  const resetGame: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
    e.preventDefault();
    batch(() => {
      closeModal();
      setGame(
        reconcile(
          INITIAL_STATE({
            pieces: initialPieces,
            player: game.player,
            turn: game.turn,
          }),
          { merge: true },
        ),
      );
    });
  };

  return (
    <div class={styles.container}>
      <button type="button" class={styles.button} onClick={resetGame}>
        Reset Game
      </button>
      <div class={styles.turnIndicator}>
        <div
          classList={{
            [styles.red]: true,
            [styles.isTurn]: game.turn === "red",
          }}
        />
        <div
          classList={{
            [styles.blue]: true,
            [styles.isTurn]: game.turn === "blue",
          }}
        />
      </div>
    </div>
  );
};
