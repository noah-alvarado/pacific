import {
  Show,
  type Component,
  createSignal,
  createMemo,
  createEffect,
} from "solid-js";
import { Page } from "../AppRouter";
import styles from "./Header.module.css";
import { useLocation } from "@solidjs/router";
import { A } from "@solidjs/router";
import { useWindowWidth } from "../primitives/useWindowWidth";

const Header: Component = () => {
  const location = useLocation();
  const windowWidth = useWindowWidth();
  const [theme, setTheme] = createSignal(
    localStorage.getItem("theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),
  );
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

  const toggleDarkMode = () => {
    setTheme((v) => {
      const next = v === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  return (
    <header class={styles.header}>
      <button
        type="button"
        aria-label={
          theme() === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        onClick={toggleDarkMode}
        class={styles.themeToggle}
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
            <A href={Page.Landing}>home</A>
          </li>
          <li>
            <A href={Page.Rules}>rules</A>
          </li>
          <li>
            <A href={Page.Local}>local play</A>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
