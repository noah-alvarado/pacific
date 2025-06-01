import type { Component } from 'solid-js';

import styles from './App.module.css';
import { Board } from './components/Board';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <p>Pacific Game</p>
      </header>
      <main>
        <Board />
      </main>
    </div>
  );
};

export default App;
