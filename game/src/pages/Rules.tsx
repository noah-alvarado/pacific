import { Component } from 'solid-js';
import figure1 from '../assets/figure-1.png';
import figure2 from '../assets/figure-2.png';
import figure3 from '../assets/figure-3.png';
import figure4 from '../assets/figure-4.png';
import originalBoard from '../assets/original-board.jpeg';
import originalInstructions from '../assets/original-instructions.jpeg';
import styles from './Rules.module.css';

const Rules: Component = () => {
    return (
        <div class={styles.container}>
            <h1>Pacific Game Rules</h1>
            <section>
                <h2>General</h2>
                <p>Type A & B - Board Wargame for 2 Players.</p>
            </section>
            <section>
                <h2>Original Game Materials</h2>
                <img src={originalBoard} alt="Original Board" class={styles.imgBoard} />
                <img src={originalInstructions} alt="Original Instructions" class={styles.imgInstructions} />
            </section>
            <section>
                <h2>Pacific Type A</h2>
                <h3>Board</h3>
                <p>The Pacific game board is a 7x7 grid of diagonal intersecting lines. The board is square, with intersections of the grid cells forming the playable spaces, such that the actual playable locations are 8 rows of 4 points. The back row for each player is the row closest to them, where their four Aircraft Carriers are initially placed. In even numbered rows, each point connects to the corresponding point in the neighboring rows, as well as the point ahead of it. In odd rows, points also connect to the points behind them in row-order.</p>
                <h3>Setup</h3>
                <ul>
                    <li>Each player starts the game with four Aircraft Carriers and eight Attack Planes.</li>
                    <li>The Carriers, numbered 1, 2, 3, 4, are set out in order on the back row intersections, starting from the left of the board.</li>
                    <li>Each Carrier has two Attack Planes which wear its number and are placed on the intersections ahead of it. (See Figure 1).</li>
                </ul>
                <img src={figure1} alt="Figure 1: Initial Setup" class={styles.imgFigure} />
                <h3>Gameplay</h3>
                <ul>
                    <li>Moves are made by each player alternately.</li>
                </ul>
                <h3>Movement</h3>
                <ul>
                    <li>Carriers and Attack Planes advance up the board diagonally, from one intersection to another.</li>
                    <li>An Attack Plane may only move up to three intersections (rows) ahead of its Carrier. (See Figure 2).</li>
                </ul>
                <img src={figure2} alt="Figure 2: Movement Limit" class={styles.imgFigure} />
                <ul>
                    <li>An Attack Plane may only attack if it is within two rows of its Carrier. It may however be any number of moves to the side of its Carrier.</li>
                    <li>An Attack Plane which cannot advance further because of the position of its Carrier is said to be at its limit.</li>
                </ul>
                <h3>Attack</h3>
                <ul>
                    <li>Carriers may not attack.</li>
                    <li>Attack Planes (and later in the game Kamikazes) destroy other Attack Planes, Aircraft Carriers (and Kamikazes).</li>
                    <li>When a Carrier has been destroyed, its surviving Attack Planes must also leave the board.</li>
                    <li>A player is not allowed to decide whether or not to attack from an attacking position; once the piece has moved into, or been placed in, an attacking position, attack is compulsory.</li>
                    <li>Attacks are made as in draughts, by one piece 'jumping' an adjacent enemy piece in a forward direction. The enemy piece then leaves the board.</li>
                    <li>Once begun, an attack is pressed home on as many enemy pieces as can be jumped, though the attacking piece may end up more than three rows ahead of its Carrier. (See Figure 3).</li>
                </ul>
                <img src={figure3} alt="Figure 3: Attack Example" class={styles.imgFigure} />
                <ul>
                    <li>At the conclusion of the attack, the attacking piece is unable to advance further until its supporting Carrier is again brought to within two rows.</li>
                </ul>
                <h3>Kamikazes (Type A)</h3>
                <ul>
                    <li>When an Aircraft Carrier has reached the enemy back row, it remains on the board, immobilised.</li>
                    <li>The initial strategy of the game is to preserve Carriers while advancing as many Attack Planes as possible into the enemy back row.</li>
                    <li>An Attack Plane which penetrates as far as the enemy back row becomes a Kamikaze. (See Figure 4).</li>
                </ul>
                <img src={figure4} alt="Figure 4: Kamikaze" class={styles.imgFigure} />
            </section>
        </div>
    )
};

export default Rules;
