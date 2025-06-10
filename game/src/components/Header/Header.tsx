import type { Component } from 'solid-js';
import styles from './Header.module.css';

const Header: Component = () => (
    <header class={styles.header}>
        <p>Pacific</p>
    </header>
);

export default Header;
