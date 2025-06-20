import {
  Show,
  type Component,
  createSignal,
  createMemo,
  createEffect,
  JSX,
} from "solid-js";
import { Page } from "../AppRouter";
import styles from "./Header.module.css";
import { useLocation } from "@solidjs/router";
import { A } from "@solidjs/router";
import { useWindowWidth } from "../primitives/useWindowWidth";
import { useThemeContext } from "../providers/Theme";

const Header: Component = () => {
  const location = useLocation();
  const windowWidth = useWindowWidth();
  const { theme, toggleDarkMode } = useThemeContext();
  const [navOpen, setNavOpen] = createSignal(false);

  createEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    location.pathname; // Trigger effect when the route changes
    setNavOpen(false); // Close the navigation when the route changes
  });

  createEffect(() => {
    document.documentElement.dataset.theme = theme();
  });

  const showBurger = createMemo(() => {
    return windowWidth() < 720;
  });

  const showNav = createMemo(() => {
    return showBurger() ? navOpen() : true;
  });

  const onClickNavA: JSX.EventHandler<HTMLAnchorElement, MouseEvent> = () => {
    setNavOpen(false);
    (document.activeElement as HTMLElement | undefined)?.blur();
  };

  return (
    <header class={styles.header}>
      <button
        type="button"
        aria-label={
          theme() === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        onClick={toggleDarkMode}
        class={`${styles.themeToggle} ${styles.clickable}`}
      >
        {theme() === "dark" ? "🌙" : "☀️"}
      </button>

      <p class={styles.title}>PACIFIC</p>

      <Show when={showBurger()}>
        <button
          type="button"
          class={styles.burger}
          aria-label={
            navOpen() ? "Close navigation menu" : "Open navigation menu"
          }
          aria-controls="main-navigation"
          aria-expanded={showNav()}
          onClick={() => setNavOpen((n) => !n)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </Show>

      <nav
        id="main-navigation"
        class={styles.nav}
        style={{ display: showNav() ? "block" : "none" }}
      >
        <ul>
          <li>
            <A
              href={Page.Landing}
              class={styles.clickable}
              onclick={onClickNavA}
            >
              home
            </A>
          </li>
          <li>
            <A href={Page.Rules} class={styles.clickable} onclick={onClickNavA}>
              rules
            </A>
          </li>
          <li>
            <A href={Page.Local} class={styles.clickable} onclick={onClickNavA}>
              local play
            </A>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
