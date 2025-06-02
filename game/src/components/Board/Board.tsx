import type { Component } from 'solid-js';
import styles from './Board.module.css';


export interface BoardProps { }

export const Board: Component<BoardProps> = (props) => {
  const cells = Array.from({ length: 7 * 7 });

  return (
    <div class={styles.board}>
      {cells.map((_, index) => {
        const row = Math.floor(index / 7);
        const col = index % 7;
        const isEvenRow = row % 2 === 0;
        const isEvenCol = col % 2 === 0;

        if (isEvenRow && !isEvenCol || !isEvenRow && isEvenCol) {
          return (
            <div class={`${styles.cell} ${styles.dots1}`}>
              <div class={styles.line1}/>
              <div class={`${styles.dot} ${styles.topLeft}`}/>
              <div class={`${styles.dot} ${styles.bottomRight}`}/>
            </div>
          );
        }
        
        // isEvenRow && isEvenCol
        // !isEvenRow && !isEvenCol
        return (
          <div class={`${styles.cell} ${styles.dots2}`}>
            <div class={styles.line2}/>
          </div>
        );
      })}
    </div>
  );
};
