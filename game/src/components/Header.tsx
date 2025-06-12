import { Show, type Component, createSignal, createMemo, createEffect } from 'solid-js';
import { Page } from '../AppRouter';
import styles from './Header.module.css';
import { useLocation } from '@solidjs/router';
import { A } from '@solidjs/router';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { create } from 'domain';

const Header: Component = () => {
    const location = useLocation();
    const [navOpen, setNavOpen] = createSignal(false);
    const windowWidth = useWindowWidth();

    createEffect(() => {
        location.pathname; // Trigger effect when the route changes
        setNavOpen(false); // Close the navigation when the route changes
    });

    const showBurger = createMemo(() => {
        return windowWidth() < 720;
    });

    const showNav = createMemo(() => {
        return showBurger() ? navOpen() : true;
    });

    return (
        <header class={styles.header}>
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
