import { Component } from "solid-js";
import { playerColorToHex } from "./GamePiece.util.js";
import { PlayerColor } from "../types/GameState.js";
import { useThemeContext } from "../providers/Theme.jsx";

interface GameOverModalProps {
  winner: PlayerColor | undefined;
}

const GameOverModal: Component<GameOverModalProps> = (props) => {
  const { theme } = useThemeContext();

  const styledWinner = props.winner && (
    <span
      style={{
        ...(theme() === "light" && { color: playerColorToHex(props.winner) }),
        "font-weight": 600,
      }}
    >
      {props.winner.toLocaleUpperCase()}
    </span>
  );

  return (
    <>
      <h2 style={{ "margin-top": 0 }}>Game Over</h2>
      {props.winner ? (
        <p>The winner is {styledWinner}!</p>
      ) : (
        <p>The game has ended in a draw.</p>
      )}
    </>
  );
};

export default GameOverModal;
