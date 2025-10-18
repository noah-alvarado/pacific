import { batch, Component, createMemo, Show } from "solid-js";
import type { JSX } from "solid-js";
import { reconcile } from "solid-js/store";
import {
  BLUE_STALEMATE_OR_DECISIVE,
  INITIAL_STATE,
  ONE_MOVE_TO_WIN,
} from "../constants/game.js";
import { useGameContext } from "./Game.jsx";
import { useModalContext } from "../providers/Modal.js";

import styles from "./Controls.module.css";

const turnIndicator = `★`;

export const Controls: Component = () => {
  const { gameConfig, game, setGame, initialPieces } = useGameContext();
  const { closeModal } = useModalContext();
  const playerNames = createMemo(() => {
    if (gameConfig.gameType === "local") {
      return { red: "Player 1", blue: "Player 2" };
    }
    return gameConfig.player === "red"
      ? { red: "me", blue: "peer" }
      : { red: "peer", blue: "me" };
  });

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

        {import.meta.env.DEV && (
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
        )}
      </Show>

      <div class={styles.players}>
        <div class={styles.player}>
          <div class={styles.turnIndicator}>
            <Show when={game.turn === "red"}>{turnIndicator}</Show>
          </div>
          <div
            classList={{
              [styles.icon]: true,
              [styles.red]: true,
              [styles.isTurn]: game.turn === "red",
            }}
          />
          <p>{playerNames().red}</p>
        </div>

        <div class={styles.player}>
          <div class={styles.turnIndicator}>
            <Show when={game.turn === "blue"}>{turnIndicator}</Show>
          </div>
          <div
            classList={{
              [styles.icon]: true,
              [styles.blue]: true,
              [styles.isTurn]: game.turn === "blue",
            }}
          />
          <p>{playerNames().blue}</p>
        </div>
      </div>
    </div>
  );
};
