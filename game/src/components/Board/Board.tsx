import type { Component } from 'solid-js';
import styles from './Board.module.css';

export interface BoardProps {}

export const Board: Component<BoardProps> = (props) => {
  return (
    <div class={styles.board}>
      {/* TODO: Implement board layout */}
      <p>Game Board</p>
    </div>
  );
};
