import { Component, JSX } from "solid-js";
import { INITIAL_STATE, ONE_MOVE_TO_WIN } from "../constants/game";

import { IGameState } from "../types/GameState";
import { reconcile } from "solid-js/store";
import styles from './Controls.module.css';
import { useGameContext } from "../providers/GameLogic";

export const Controls: Component = () => {
    const { game, setGame } = useGameContext();

    const resetGame: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
        e.preventDefault();
        setGame(reconcile(INITIAL_STATE({
            pieces: ONE_MOVE_TO_WIN,
            player: game.player,
            turn: game.turn,
        }), { merge: true }));
    }

    const undoLastMove: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
        e.preventDefault();
        // Logic to undo the last move
        // This is a placeholder as the actual implementation would depend on how moves are tracked
        console.log("Undoing last move...");
    }

    return (
        <div class={styles.container}>
            <button type="button" class={styles.button} onClick={resetGame}>
                Reset Game
            </button>
            <button type="button" class={styles.button} onClick={undoLastMove}>
                Undo Last Move
            </button>
        </div>
    );
}
