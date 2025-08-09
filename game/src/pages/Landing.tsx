import { A } from "@solidjs/router";
import { Component } from "solid-js";
import { Page } from "../AppRouter.jsx";
import styles from "./Landing.module.css";

const Landing: Component = () => {
  return (
    <div class={styles.landingRoot}>
      <div class={styles.heroSection}>
        <h1 class={styles.title}>PACIFIC</h1>
        <p class={styles.subtitle}>
          A strategic game about WW2 in the Pacific.
        </p>
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
