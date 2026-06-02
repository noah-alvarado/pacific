import { MemoryRouter, Route } from "@solidjs/router";
import { render } from "@solidjs/testing-library";
import { type Component, type JSX, Show } from "solid-js";

import ModalProvider from "../providers/Modal.jsx";
import ThemeProvider from "../providers/Theme.jsx";

interface Options {
  withRouter?: boolean;
  withTheme?: boolean;
  withModal?: boolean;
  initialPath?: string;
}

interface WrapperProps {
  children: JSX.Element;
  withTheme: boolean;
  withModal: boolean;
}

const Wrappers: Component<WrapperProps> = (props) => (
  <Show
    when={props.withTheme}
    fallback={
      <Show when={props.withModal} fallback={props.children}>
        <ModalProvider>{props.children}</ModalProvider>
      </Show>
    }
  >
    <ThemeProvider>
      <Show when={props.withModal} fallback={props.children}>
        <ModalProvider>{props.children}</ModalProvider>
      </Show>
    </ThemeProvider>
  </Show>
);

/**
 * Render the component under test with the providers most pages and
 * components need. Each wrapper is opt-out.
 */
export function renderWithProviders(Comp: Component, options: Options = {}) {
  const {
    withRouter = true,
    withTheme = true,
    withModal = true,
    initialPath = "/",
  } = options;

  if (withRouter) {
    return render(() => (
      <MemoryRouter>
        <Route
          path={initialPath}
          component={() => (
            <Wrappers withTheme={withTheme} withModal={withModal}>
              <Comp />
            </Wrappers>
          )}
        />
      </MemoryRouter>
    ));
  }

  return render(() => (
    <Wrappers withTheme={withTheme} withModal={withModal}>
      <Comp />
    </Wrappers>
  ));
}
