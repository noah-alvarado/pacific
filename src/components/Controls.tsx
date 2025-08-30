import { batch, Component, JSX, Show } from "solid-js";
import { reconcile } from "solid-js/store";
import {
  BLUE_STALEMATE_OR_DECISIVE,
  INITIAL_STATE,
  ONE_MOVE_TO_WIN,
} from "../constants/game.js";
import { useGameContext } from "./Game.jsx";
import { useModalContext } from "../providers/Modal.js";

import styles from "./Controls.module.css";

export const Controls: Component = () => {
  const { gameConfig, game, setGame, initialPieces } = useGameContext();
  const { closeModal } = useModalContext();

  function resetGame(
    pieces = "normal",
  ): JSX.EventHandler<HTMLButtonElement, MouseEvent> {
    return (e) => {
      e.preventDefault();

      let nextPieces = initialPieces;
      if (import.meta.env.DEV) {
        if (pieces === "ONE_MOVE_TO_WIN") {
          nextPieces = ONE_MOVE_TO_WIN;
        }
        if (pieces === "BLUE_STALEMATE_OR_DECISIVE") {
          nextPieces = BLUE_STALEMATE_OR_DECISIVE;
        }
      }

      batch(() => {
        closeModal();
        setGame(
          reconcile(
            INITIAL_STATE({
              pieces: nextPieces,
              player: game.player,
              turn: game.turn,
            }),
            { merge: true },
          ),
        );
      });
    };
  }

  return (
    <div class={styles.container}>
      <Show when={gameConfig.gameType === "local"}>
        <button type="button" class={styles.button} onClick={resetGame()}>
          Reset Game
        </button>

        {/* {import.meta.env.DEV && (
          <>
            <button
              type="button"
              class={styles.button}
              onClick={resetGame("ONE_MOVE_TO_WIN")}
            >
              ONE_MOVE_TO_WIN
            </button>
            <button
              type="button"
              class={styles.button}
              onClick={resetGame("BLUE_STALEMATE_OR_DECISIVE")}
            >
              BLUE_STALEMATE_OR_DECISIVE
            </button>
          </>
        )} */}
      </Show>
      <div class={styles.turnIndicator}>
        <div class={styles.player}>
          <div
            classList={{
              [styles.icon]: true,
              [styles.red]: true,
              [styles.isTurn]: game.turn === "red",
            }}
          />
          <p>My Player 1</p>
        </div>

        <div class={styles.player}>
          <div
            classList={{
              [styles.icon]: true,
              [styles.blue]: true,
              [styles.isTurn]: game.turn === "blue",
            }}
          />
          <p>My Player 2</p>
        </div>
      </div>
    </div>
  );
};
