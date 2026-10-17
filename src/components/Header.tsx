import { useLocation } from "@solidjs/router";
import { A } from "@solidjs/router";
import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  JSX,
  onCleanup,
  Show,
} from "solid-js";

import { Page } from "../AppRouter.js";
// this is needed to have the directive available in-scope
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import clickOutside from "../primitives/clickOutside.js";
import { usePreferences } from "../providers/Preferences.js";

import styles from "./Header.module.css";

interface NavLinkProps {
  href: Page;
  className: string;
  label: string;
  onClick: JSX.EventHandler<HTMLAnchorElement, MouseEvent>;
}
const NavLink: Component<NavLinkProps> = ({
  href,
  className,
  label,
  onClick,
}) => {
  return (
    <A href={href} class={className} onclick={onClick}>
      {label}
    </A>
  );
};

const Header: Component = () => {
  const location = useLocation();
  const { theme, toggleDarkMode } = usePreferences();
  const [navOpen, setNavOpen] = createSignal(false);
  let burgerRef: HTMLButtonElement | undefined;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && navOpen()) {
      setNavOpen(false);
      burgerRef?.focus();
    }
  };
  document.addEventListener("keydown", onKeyDown);
  onCleanup(() => {
    document.removeEventListener("keydown", onKeyDown);
  });

  createEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    location.pathname; // Trigger effect when the route changes
    setNavOpen(false); // Close the navigation when the route changes
  });

  createEffect(() => {
    document.documentElement.dataset.theme = theme();
  });

  const compact = createMemo(() => true);

  const showBurger = compact;

  const showNav = createMemo(() => {
    return showBurger() ? navOpen() : true;
  });

  const onClickNavA: JSX.EventHandler<HTMLAnchorElement, MouseEvent> = () => {
    setNavOpen(false);
    (document.activeElement as HTMLElement | undefined)?.blur();
  };

  const navigationLinks: NavLinkProps[] = [
    {
      href: Page.Landing,
      label: "home",
      className: styles.clickable,
      onClick: onClickNavA,
    },
    {
      href: Page.Rules,
      label: "rules",
      className: styles.clickable,
      onClick: onClickNavA,
    },
    {
      href: Page.Local,
      label: "local",
      className: styles.clickable,
      onClick: onClickNavA,
    },
    {
      href: Page.Online,
      label: "online",
      className: styles.clickable,
      onClick: onClickNavA,
    },
  ];

  return (
    <header
      class={styles.header}
      classList={{ [styles.compact]: compact() }}
      use:clickOutside={() => setNavOpen(false)}
    >
      <button
        type="button"
        aria-label={
          theme() === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        onClick={toggleDarkMode}
        class={`${styles.themeToggle} ${styles.clickable}`}
        classList={{ [styles.compact]: compact() }}
      >
        {theme() === "dark" ? "🌙" : "☀️"}
      </button>

      <A
        href={Page.Landing}
        class={styles.title}
        classList={{ [styles.compact]: compact() }}
      >
        PACIFIC
      </A>

      <Show when={showBurger()}>
        <button
          ref={burgerRef}
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
        classList={{ [styles.compact]: compact() }}
        style={{ display: showNav() ? "block" : "none" }}
      >
        <ul>
          <For each={navigationLinks}>
            {(link) => (
              <li>
                <NavLink
                  href={link.href}
                  className={link.className}
                  label={link.label}
                  onClick={link.onClick}
                />
              </li>
            )}
          </For>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
