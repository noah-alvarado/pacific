import { MultiProvider } from "@solid-primitives/context";
import { type Component, type ParentProps } from "solid-js";

import styles from "./App.module.css";
import Header from "./components/Header.js";
import ModalProvider from "./providers/Modal.js";
import ThemeProvider from "./providers/Theme.js";

const App: Component<ParentProps> = (props) => {
  return (
    <MultiProvider values={[ThemeProvider, ModalProvider]}>
      <div class={styles.app}>
        <Header />
        <main>{props.children}</main>
      </div>
    </MultiProvider>
  );
};

export default App;
