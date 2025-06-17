import { type JSX, type Component } from "solid-js";
import styles from "./DestinationMarker.module.css";
import emitter from "../emitter";
import { positionStyle } from "./GamePiece.util";
import { useGameContext } from "../providers/GameLogic";
import { MoveMadeEvent } from "../types/GameEvents";

interface IDestinationMarkerProps {
  index: number;
}
const DestinationMarker: Component<IDestinationMarkerProps> = (props) => {
  const { game, pieceToDestinations } = useGameContext();

  const onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
    e.preventDefault();

    const piece = game.pieces[game.selectedPieceId!];
    emitter.emit(
      "moveMade",
      JSON.parse(
        JSON.stringify({
          piece,
          moveType:
            pieceToDestinations()[game.selectedPieceId!][props.index].moveType,
          from: game.pieces[game.selectedPieceId!].position,
          to: pieceToDestinations()[game.selectedPieceId!][props.index]
            .position,
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
          pieceToDestinations()[game.selectedPieceId!][props.index].position,
          { pieceSize: 45 },
        ),
      }}
    />
  );
};

export default DestinationMarker;
