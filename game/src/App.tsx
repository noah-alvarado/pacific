import { Show, type Component, type ParentProps } from 'solid-js';
import { useLocation } from '@solidjs/router';

import styles from './App.module.css';
import Header from './components/Header';
import { Page } from './AppRouter';

const App: Component<ParentProps> = (props) => {
  const location = useLocation();

  return (
    <div class={styles.App}>
      <Show when={location.pathname !== String(Page.Landing)}>
        <Header />
      </Show>
      <main>
        {props.children}
      </main>
    </div>
  );
};

export default App;
