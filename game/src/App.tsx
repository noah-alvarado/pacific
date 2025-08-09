import { type Component, type ParentProps } from "solid-js";
import { MultiProvider } from "@solid-primitives/context";

import styles from "./App.module.css";
import Header from "./components/Header.jsx";
import ModalProvider from "./providers/Modal.jsx";
import ThemeProvider from "./providers/Theme.jsx";

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
