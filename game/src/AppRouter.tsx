import { HashRouter, Route } from "@solidjs/router";

import App from "./App";
import { lazy } from "solid-js";

export enum Page {
    Landing = "/",
    Local = "/local",
}

export default function AppRouter() {
    return (
        <HashRouter root={App}>
            <Route path="/" component={lazy(() => import("./pages/Landing"))} />
            <Route path="/local" component={lazy(() => import("./pages/Local"))} />
        </HashRouter>
    );
}
