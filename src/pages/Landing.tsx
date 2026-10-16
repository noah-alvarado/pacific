import { A } from "@solidjs/router";
import { Component } from "solid-js";

import { Page } from "../AppRouter.js";

import styles from "./Landing.module.css";

const Landing: Component = () => {
  return (
    <div class={styles.landingRoot}>
      <div class={styles.heroSection}>
        <h1 class={styles.title}>PACIFIC</h1>
        <p class={styles.subtitle}>Type A & B - Board Wargame for 2 Players</p>
      </div>
      <div class={styles.buttonGroup}>
        <A href={Page.Local} class={styles.primaryButton}>
          Start Local Game
        </A>
        <A href={Page.Rules} class={styles.secondaryButton}>
          Game Rules
        </A>
      </div>
    </div>
  );
};

export default Landing;
