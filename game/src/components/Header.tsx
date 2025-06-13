import { Show, type Component, createSignal, createMemo, createEffect, onMount } from 'solid-js';
import { Page } from '../AppRouter';
import styles from './Header.module.css';
import { useLocation } from '@solidjs/router';
import { A } from '@solidjs/router';
import { useWindowWidth } from '../hooks/useWindowWidth';

const Header: Component = () => {
    const location = useLocation();
    const windowWidth = useWindowWidth();
    const [theme, setTheme] = createSignal(
        localStorage.getItem('theme')
        || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    const [navOpen, setNavOpen] = createSignal(false);

    createEffect(() => {
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
            const next = v === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', next);
            return next;
        });
    };

    return (
        <header class={styles.header}>
            <button
                type="button"
                aria-label={theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={toggleDarkMode}
                class={styles.themeToggle}
            >
                {theme() === 'dark' ? '🌙' : '☀️'}
            </button>

            <p class={styles.title}>PACIFIC</p>

            <Show when={showBurger()}>
                <div class={styles.burger} onClick={() => setNavOpen(n => !n)}>
                    <span />
                    <span />
                    <span />
                </div>
            </Show>

            <Show when={showNav()}>
                <nav class={styles.nav}>
                    <ul>
                        <li><A href={Page.Landing}>home</A></li>
                        <li><A href={Page.Rules}>rules</A></li>
                        <li><A href={Page.Local}>local play</A></li>
                    </ul>
                </nav>
            </Show>
        </header>
    );
};

export default Header;
