import { BLUE_STALEMATE_OR_DECISIVE, INITIAL_STATE } from "../constants/game";
import { Component, JSX } from "solid-js";

import { reconcile } from "solid-js/store";
import styles from './Controls.module.css';
import { useGameContext } from "../providers/GameLogic";

export const Controls: Component = () => {
    const { game, setGame } = useGameContext();

    const resetGame: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
        e.preventDefault();
        setGame(reconcile(INITIAL_STATE({
            pieces: BLUE_STALEMATE_OR_DECISIVE,
            player: game.player,
            turn: game.turn,
        }), { merge: true }));
    }

    return (
        <div class={styles.container}>
            <button type="button" class={styles.button} onClick={resetGame}>
                Reset Game
            </button>
            <div class={styles.turnIndicator}>
                <div classList={{ [styles.red]: true, [styles.isTurn]: game.turn === 'red' }} />
                <div classList={{ [styles.blue]: true, [styles.isTurn]: game.turn === 'blue' }} />
            </div>
        </div>
    );
}
