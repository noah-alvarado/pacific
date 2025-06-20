import { type Component, type ParentProps } from "solid-js";
import { MultiProvider } from "@solid-primitives/context";

import styles from "./App.module.css";
import Header from "./components/Header";
import ModalProvider from "./providers/Modal";
import ThemeProvider from "./providers/Theme";

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
