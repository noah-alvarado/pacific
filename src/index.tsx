import "./index.css";

import { render } from "solid-js/web";

import AppRouter from "./AppRouter.jsx";

const root = document.getElementById("root");
if (!(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(() => <AppRouter />, root);
