import { A } from "@solidjs/router";
import { Component } from "solid-js";

import { Page } from "../AppRouter.js";
import logo from "../assets/logo/logo.PNG";
import plane from "../assets/logo/plane.PNG";
import ship from "../assets/logo/ship.PNG";

import styles from "./Landing.module.css";

const Landing: Component = () => {
  return (
    <div class={styles.landingRoot}>
      <div class={styles.heroSection}>
        <div class={styles.logoRow}>
          <div class={`${styles.crop} ${styles.ship}`}>
            <img src={ship} alt="" />
          </div>
          <h1 class={`${styles.crop} ${styles.logo}`}>
            <img src={logo} alt="PACIFIC" />
          </h1>
          <div class={`${styles.crop} ${styles.plane}`}>
            <img src={plane} alt="" />
          </div>
        </div>
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
