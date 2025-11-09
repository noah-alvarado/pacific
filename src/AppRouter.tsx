import { HashRouter, Route } from "@solidjs/router";
import { For, lazy } from "solid-js";

import App from "./App.js";

export enum Page {
  Landing = "/",
  Rules = "/rules",
  Local = "/local",
  Online = "/online",
}

const routes = [
  {
    path: Page.Landing,
    component: lazy(() => import("./pages/Landing.js")),
  },
  {
    path: Page.Rules,
    component: lazy(() => import("./pages/Rules.js")),
  },
  {
    path: Page.Local,
    component: lazy(() => import("./pages/Local.js")),
  },
  {
    path: Page.Online,
    component: lazy(() => import("./pages/Online.js")),
  },
];

export default function AppRouter() {
  return (
    <HashRouter root={App}>
      <For each={routes}>
        {(route) => <Route path={route.path} component={route.component} />}
      </For>
    </HashRouter>
  );
}
