import { createEffect, type Component, type ParentProps } from 'solid-js';

import styles from './App.module.css';
import { useNavigate } from '@solidjs/router';
import { useGame } from './store/gameStore';

const App: Component<ParentProps> = (props) => {

  const navigate = useNavigate();

  const [game] = useGame();

  createEffect(() => {
    console.log("Navigating to game phase:", game.phase);
    navigate(`/${game.phase}`, { replace: true });
  });

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
