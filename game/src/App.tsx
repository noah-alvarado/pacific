import { type Component, type ParentProps } from 'solid-js';

import styles from './App.module.css';
import Header from './components/Header';

const App: Component<ParentProps> = (props) => {
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
