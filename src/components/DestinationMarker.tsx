import { type Component,type JSX } from "solid-js";

import { IDestinationMarker } from "../types/GameState.js";

import styles from "./DestinationMarker.module.css";
import { useGameContext } from "./Game.context.js";
import { positionStyle } from "./GamePiece.util.js";

interface IDestinationMarkerProps {
  destination: IDestinationMarker;
}
const DestinationMarker: Component<IDestinationMarkerProps> = (props) => {
  const { game, makeMove } = useGameContext();

  const onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
    e.preventDefault();

    if (!game.selectedPieceId) {
      console.error(
        `No piece selected for destination ${JSON.stringify(props.destination.position, null, 2)}`,
      );
      return;
    }

    const piece = game.pieces[game.selectedPieceId];
    makeMove({
      eventType: "moveMade",
      piece,
      moveType: props.destination.moveType,
      from: game.pieces[game.selectedPieceId].position,
      to: props.destination.position,
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      class={styles.destinationMarker}
      style={{
        ...positionStyle(props.destination.position, { size: 44 }),
      }}
    />
  );
};

export default DestinationMarker;
