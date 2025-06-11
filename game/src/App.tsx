import { createEffect, type Component, type ParentProps } from 'solid-js';

import styles from './App.module.css';
import { useNavigate } from '@solidjs/router';
import Header from './components/Header';
import { Page } from './AppRouter';

const App: Component<ParentProps> = (props) => {

  const navigate = useNavigate();

  createEffect(() => {
    console.log("Navigating to local game:");
    navigate(Page.Local, { resolve: false, replace: true });
  });

  return (
    <div class={styles.App}>
      <Header />
      <main>
        {props.children}
      </main>
    </div>
  );
};

export default App;
