import { type Component, type ParentProps } from "solid-js";

import styles from "./App.module.css";
import Header from "./components/Header";
import ModalProvider from "./providers/Modal";

const App: Component<ParentProps> = (props) => {
  return (
    <ModalProvider>
      <div class={styles.app}>
        <Header />
        <main>{props.children}</main>
      </div>
    </ModalProvider>
  );
};

export default App;
