import { type JSX, type Component } from "solid-js";
import styles from "./DestinationMarker.module.css";
import { positionStyle } from "./GamePiece.util.js";
import { useGameContext } from "../providers/Game.jsx";
import { MoveMadeEvent } from "../types/GameEvents.js";

interface IDestinationMarkerProps {
  index: number;
}
const DestinationMarker: Component<IDestinationMarkerProps> = (props) => {
  const { game, pieceToDestinations, makeMove } = useGameContext();

  const onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
    e.preventDefault();

    if (!game.selectedPieceId) {
      console.warn("No piece selected");
      return;
    }

    const dest = pieceToDestinations()[game.selectedPieceId]?.[props.index];
    if (!dest) {
      console.warn("No destinations found");
      return;
    }

    const piece = game.pieces[game.selectedPieceId];
    makeMove(
      JSON.parse(
        JSON.stringify({
          eventType: "moveMade",
          piece,
          moveType: dest.moveType,
          from: game.pieces[game.selectedPieceId].position,
          to: dest.position,
        }),
      ) as MoveMadeEvent,
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      class={styles.destinationMarker}
      style={{
        ...positionStyle(
          pieceToDestinations()[game.selectedPieceId!]?.[props.index].position,
          { pieceSize: 45 },
        ),
      }}
    />
  );
};

export default DestinationMarker;
