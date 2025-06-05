import "./index.css";

import { Route, Router } from "@solidjs/router";

import App from "./App";
import { lazy } from "solid-js";
import { render } from "solid-js/web";

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => (
  <Router root={App}>
    <Route path="/" component={lazy(() => import("./pages/Main"))} />
    <Route path="/find-game" component={lazy(() => import("./pages/FindGame"))} />
    <Route path="/create-game" component={lazy(() => import("./pages/CreateGame"))} />
    <Route path="/join-game" component={lazy(() => import("./pages/JoinGame"))} />
    <Route path="/settings" component={lazy(() => import("./pages/Settings"))} />
    <Route path="/lobby" component={lazy(() => import("./pages/Lobby"))} />
    <Route path="/setup" component={lazy(() => import("./pages/Setup"))} />
    <Route path="/in-progress" component={lazy(() => import("./pages/InProgress"))} />
    <Route path="/finished" component={lazy(() => import("./pages/Finished"))} />
  </Router>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
), root!);
