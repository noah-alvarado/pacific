import { Component } from "solid-js";

import { usePreferences } from "../providers/Preferences.js";
import { PlayerColor } from "../types/GameState.js";

import { playerColorVar } from "./GamePiece.util.js";

interface GameOverModalProps {
  winner: PlayerColor | undefined;
}

const GameOverModal: Component<GameOverModalProps> = (props) => {
  const { theme } = usePreferences();

  const styledWinner = props.winner && (
    <span
      style={{
        ...(theme() === "light" && { color: playerColorVar(props.winner) }),
        "font-weight": 600,
      }}
    >
      {props.winner.toLocaleUpperCase()}
    </span>
  );

  return (
    <div data-testid="game-over" data-winner={props.winner ?? "draw"}>
      <h2 style={{ "margin-top": 0 }}>Game Over</h2>
      {props.winner ? (
        <p>The winner is {styledWinner}!</p>
      ) : (
        <p>The game has ended in a draw.</p>
      )}
    </div>
  );
};

export default GameOverModal;
