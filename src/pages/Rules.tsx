import { Component } from "solid-js";

import figure1 from "../assets/figure-1.png";
import figure2 from "../assets/figure-2.png";
import figure3 from "../assets/figure-3.png";
import figure4 from "../assets/figure-4.png";
import originalBoard from "../assets/original-board.jpeg";
import originalInstructions from "../assets/original-instructions.jpeg";

import styles from "./Rules.module.css";

const Rules: Component = () => {
  return (
    <div class={styles.rulesRoot}>
      <article class={styles.container}>
        <h1>Pacific Game Rules</h1>
        <p class={styles.subtitle}>
          Type A &amp; B - Board Wargame for 2 Players
        </p>

        <h2>Pacific Type A</h2>

        <h3>Setup</h3>
        <p>
          Each player starts the game with four Aircraft Carriers and eight
          Attack Planes. The Carriers, numbered 1, 2, 3, 4, are set out in order
          on the back row intersections, starting from the left of the board.
          Each Carrier has two Attack Planes which wear its number and are
          placed on the intersections ahead of and adjacent to it. (See Figure
          1).
        </p>
        <figure class={styles.figure}>
          <img
            src={figure1}
            alt="Four Carriers set on the back row, each with two numbered Attack Planes on the intersections ahead of it."
          />
          <figcaption>Figure 1</figcaption>
        </figure>

        <h3>Movement</h3>
        <p>
          Moves are made by each player alternately. Carriers and Attack Planes
          advance up the board diagonally, from one intersection to another. An
          Attack Plane may only move up to three intersections (rows) ahead of
          its Carrier (see Figure 2); it may only attack if it is within two
          rows of its Carrier. It may however be any number of moves to the side
          of its Carrier.
        </p>
        <figure class={styles.figure}>
          <img
            src={figure2}
            alt="An Attack Plane may move up to three rows ahead of its Carrier."
          />
          <figcaption>Figure 2</figcaption>
        </figure>

        <h3>Attacks</h3>
        <p>
          Attacks are made as in draughts, by one piece &lsquo;jumping&rsquo; an
          adjacent enemy piece in a forward direction. The enemy piece then
          leaves the board. Once begun, an attack is pressed home on as many
          enemy pieces as can be jumped, though the attacking piece may end up
          more than three rows ahead of its Carrier. (See Figure 3). At the
          conclusion of the attack, the attacking piece is unable to advance
          further until its supporting Carrier is again brought to within two
          rows. An Attack Plane which cannot advance further because of the
          position of its Carrier is said to be at its limit.
        </p>
        <figure class={styles.figure}>
          <img
            src={figure3}
            alt="An attack is pressed home on as many enemy pieces as can be jumped."
          />
          <figcaption>Figure 3</figcaption>
        </figure>
        <p>
          Carriers may not attack. Attack Planes (and later in the game
          Kamikazes) destroy other Attack Planes, Aircraft Carriers (and
          Kamikazes). When a Carrier has been destroyed, its surviving Attack
          Planes must also leave the board.
        </p>
        <p>
          A player is not allowed to decide whether or not to attack from an
          attacking position; once the piece has moved into, or been placed in,
          an attacking position, attack is compulsory.
        </p>

        <h3>Kamikazes</h3>
        <p>
          When an Aircraft Carrier has reached the enemy back row, it remains on
          the board, immobilised. The initial strategy of the game is to
          preserve Carriers while advancing as many Attack Planes as possible
          into the enemy back row. An Attack Plane which penetrates as far as
          the enemy back row becomes a Kamikaze. (See Figure 4). Kamikazes move
          diagonally, either forwards or backwards (like &lsquo;Kings&rsquo; in
          draughts), and in Pacific Type A they can destroy Attack Planes,
          Carriers, or other Kamikazes, without penalty.
        </p>
        <figure class={styles.figure}>
          <img
            src={figure4}
            alt="An Attack Plane that reaches the enemy back row becomes a Kamikaze."
          />
          <figcaption>Figure 4</figcaption>
        </figure>

        <h3>Winning the Game</h3>
        <p>
          When a player has destroyed all the enemy&rsquo;s Attack Planes and
          Kamikazes, or when he has left the enemy without a possible move, he
          has won the game.
        </p>

        <h2>Pacific Type B</h2>
        <p>
          Pacific Type B is for players who have already mastered Pacific A. In
          Pacific B, a Kamikaze destroys an Attack Plane, another Kamikaze, or
          an Aircraft Carrier. But when it destroys an Aircraft Carrier it is
          itself destroyed and must leave the board.
        </p>

        <h2>General Notes</h2>
        <p>
          Pacific cannot be won by mirror-defence, though an over-cautious
          strategy may result in one player being unable to move. The basic
          rules are easily grasped, but a good game will develop a satisfactory
          degree of complexity which is never so great that the result becomes
          merely a matter of chance. In Pacific A, the first penetration of the
          enemy back row is often crucial. In Pacific B, the role of the
          Kamikaze is less simple and the defending player is more likely to be
          able to restore the situation by sacrificing a Carrier deprived of its
          aircraft, and so return to the attack.
        </p>
        <p>
          Pacific is not intended to be a simulation but a <em>distillation</em>{" "}
          of the Pacific conflict. Both sides have an equal number of Carriers
          and Attack Planes, and both may gain Kamikazes, which are identified
          by the Cherry Blossom symbol of purity, worn by the Ohka (Cherry
          Blossom) piloted flying bomb.
        </p>

        <h2>Original Game Materials</h2>
        <figure class={styles.figure}>
          <img
            src={originalInstructions}
            alt="Photograph of the original Pacific instruction sheet."
            class={styles.referenceImg}
          />
          <figcaption>The original instruction sheet</figcaption>
        </figure>
        <figure class={styles.figure}>
          <img
            src={originalBoard}
            alt="Photograph of the original Pacific board and playing pieces."
            class={styles.referenceImg}
          />
          <figcaption>The original board and pieces</figcaption>
        </figure>

        <footer class={styles.attribution}>
          <p>
            Wild Hawthorn Press &middot; Stonypath &middot; Dunsyre &middot;
            Lanark &middot; Scotland
          </p>
          <p>&copy; Copyright Ian Hamilton Finlay 1975</p>
        </footer>
      </article>
    </div>
  );
};

export default Rules;
