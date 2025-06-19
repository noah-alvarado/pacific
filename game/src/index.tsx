import "./index.css";

import AppRouter from "./AppRouter";
import { render } from "solid-js/web";
import ModalProvider from "./providers/Modal";

const root = document.getElementById("root");
if (!(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(
  () => (
    <ModalProvider>
      <AppRouter />
    </ModalProvider>
  ),
  root,
);
