import { type Component, For, Index } from "solid-js";

import { BOARD_HEIGHT } from "../constants/game.js";
import { PieceId } from "../types/GameState.js";

import styles from "./Board.module.css";
import DestinationMarker from "./DestinationMarker.js";
import { useGameContext } from "./Game.context.js";
import { GamePiece } from "./GamePiece.js";

const CELLS = BOARD_HEIGHT - 1;
const MID = CELLS / 2;

const diagonals = Array.from({ length: CELLS * CELLS }, (_, i) => {
  const r = Math.floor(i / CELLS);
  const c = i % CELLS;
  return (r + c) % 2 === 1
    ? `M${c} ${r}L${c + 1} ${r + 1}`
    : `M${c + 1} ${r}L${c} ${r + 1}`;
}).join("");

// playable points are the grid intersections where gx + gy is odd
const dots = Array.from({ length: (CELLS + 1) ** 2 }, (_, i) => ({
  x: i % (CELLS + 1),
  y: Math.floor(i / (CELLS + 1)),
})).filter(({ x, y }) => (x + y) % 2 === 1);

export const Board: Component = () => {
  const { game, pieceToDestinations } = useGameContext();

  return (
    <div id="gameBoard" class={styles.board}>
      <svg
        class={styles.grid}
        viewBox={`0 0 ${CELLS} ${CELLS}`}
        aria-hidden="true"
      >
        <rect class={styles.line} width={CELLS} height={CELLS} />
        <path
          class={styles.thinLine}
          d={`M0 ${Math.floor(MID)}H${CELLS}M0 ${Math.ceil(MID)}H${CELLS}`}
        />
        <path class={styles.line} d={diagonals} />
        <Index each={dots}>
          {(dot) => (
            <circle class={styles.dot} cx={dot().x} cy={dot().y} r={0.045} />
          )}
        </Index>
      </svg>

      <div class={styles.layer}>
        <Index each={Object.keys(game.pieces) as PieceId[]}>
          {(id) => <GamePiece id={id()} />}
        </Index>

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
    </div>
  );
};
