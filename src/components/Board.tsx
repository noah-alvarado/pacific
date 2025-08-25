import { Index, type Component, For } from "solid-js";
import styles from "./Board.module.css";
import { GamePiece } from "./GamePiece.js";
import { PieceId } from "../types/GameState.js";
import DestinationMarker from "./DestinationMarker.js";
import { useGameContext } from "../providers/Game.js";

export const Board: Component = () => {
  const { game, pieceToDestinations } = useGameContext();

  const cells = Array.from({ length: 7 * 7 });

  return (
    <div class={styles.board}>
      {/* Render the grid cells */}
      <Index each={cells}>
        {(_, index) => {
          const row = Math.floor(index / 7);
          const col = index % 7;
          const isEvenRow = row % 2 === 0;
          const isEvenCol = col % 2 === 0;

          if ((isEvenRow && !isEvenCol) || (!isEvenRow && isEvenCol)) {
            return (
              <div class={styles.cell}>
                <div class={styles.line1} />
                <div class={`${styles.dot} ${styles.topLeft}`} />
                <div class={`${styles.dot} ${styles.bottomRight}`} />
              </div>
            );
          }

          return (
            <div class={styles.cell}>
              <div class={styles.line2} />
              <div class={`${styles.dot} ${styles.topRight}`} />
              <div class={`${styles.dot} ${styles.bottomLeft}`} />
            </div>
          );
        }}
      </Index>

      {/* Render the game pieces */}
      <Index each={Object.keys(game.pieces) as PieceId[]}>
        {(id) => <GamePiece id={id()} />}
      </Index>

      {/* Render the destination markers */}
      <For
        each={
          game.selectedPieceId
            ? pieceToDestinations()[game.selectedPieceId]
            : []
        }
      >
        {(destination) => <DestinationMarker destination={destination} />}
      </For>
    </div>
  );
};
