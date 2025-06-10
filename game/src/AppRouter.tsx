import { HashRouter, Route } from "@solidjs/router";

import App from "./App";
import { lazy } from "solid-js";

export default function AppRouter() {
    return (
        <HashRouter root={App} {...import.meta.env.VITE_GITHUB_PAGES ? { base: "/pacific" } : {}}>
            <Route path="/" component={lazy(() => import("./pages/Main"))} />
            <Route path="/find-game" component={lazy(() => import("./pages/FindGame"))} />
            <Route path="/create-game" component={lazy(() => import("./pages/CreateGame"))} />
            <Route path="/join-game" component={lazy(() => import("./pages/JoinGame"))} />
            <Route path="/settings" component={lazy(() => import("./pages/Settings"))} />
            <Route path="/lobby" component={lazy(() => import("./pages/Lobby"))} />
            <Route path="/setup" component={lazy(() => import("./pages/Setup"))} />
            <Route path="/in-progress" component={lazy(() => import("./pages/InProgress"))} />
            <Route path="/finished" component={lazy(() => import("./pages/Finished"))} />
        </HashRouter>
    );
}
