import type { Component, ParentProps } from 'solid-js';

import { Board } from './components/Board';
import styles from './App.module.css';

const App: Component<ParentProps> = (props) => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <p>Pacific</p>
      </header>
      <main>
        {props.children}
      </main>
    </div>
  );
};

export default App;
