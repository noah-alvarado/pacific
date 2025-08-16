import { HashRouter, Route } from "@solidjs/router";

import App from "./App.jsx";
import { For, lazy } from "solid-js";

export enum Page {
  Landing = "/",
  Rules = "/rules",
  Local = "/local",
  P2P = "/p2p",
}

const routes = [
  {
    path: Page.Landing,
    component: lazy(() => import("./pages/Landing.jsx")),
  },
  {
    path: Page.Rules,
    component: lazy(() => import("./pages/Rules.jsx")),
  },
  {
    path: Page.Local,
    component: lazy(() => import("./pages/Local.jsx")),
  },
  {
    path: Page.P2P,
    component: lazy(() => import("./pages/P2P.jsx")),
  },
];

export default function AppRouter() {
  return (
    <HashRouter root={App}>
      <For each={routes}>
        {(route) => (
          <Route path={route.path} component={route.component} />
        )}
      </For>
    </HashRouter>
  );
}
