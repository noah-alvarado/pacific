import { Index, type Component, For } from 'solid-js';
import styles from './Board.module.css';
import { GamePiece } from '../GamePiece';
import { usePieces } from 'store/piecesStore';

export const Board: Component = () => {
  const [pieces] = usePieces();

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

          if (isEvenRow && !isEvenCol || !isEvenRow && isEvenCol) {
            return (
              <div class={`${styles.cell} ${styles.dots1}`}>
                <div class={styles.line1} />
                <div class={`${styles.dot} ${styles.topLeft}`} />
                <div class={`${styles.dot} ${styles.bottomRight}`} />
              </div>
            );
          }

          return (
            <div class={`${styles.cell} ${styles.dots2}`}>
              <div class={styles.line2} />
              <div class={`${styles.dot} ${styles.topRight}`} />
              <div class={`${styles.dot} ${styles.bottomLeft}`} />
            </div>
          );
        }}
      </Index>

      {/* Render the game pieces */}
      <For each={pieces}>
        {(piece) => <GamePiece piece={piece} />}
      </For>
    </div>
  );
};
